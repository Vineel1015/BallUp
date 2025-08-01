-- Supabase SQL Functions for BallUp
-- Run these in Supabase Dashboard → SQL Editor

-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Function to find nearby games within a radius
CREATE OR REPLACE FUNCTION find_nearby_games(
  user_lat FLOAT,
  user_lng FLOAT,
  radius_km FLOAT DEFAULT 5
)
RETURNS TABLE (
  id TEXT,
  title TEXT,
  description TEXT,
  "scheduledAt" TIMESTAMP,
  "maxPlayers" INTEGER,
  "currentPlayers" INTEGER,
  "skillLevel" TEXT,
  status TEXT,
  location_name TEXT,
  location_address TEXT,
  latitude FLOAT,
  longitude FLOAT,
  distance_km FLOAT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    g.title,
    g.description,
    g."scheduledAt",
    g."maxPlayers",
    g."currentPlayers",
    g."skillLevel",
    g.status,
    l.name as location_name,
    l.address as location_address,
    l.latitude,
    l.longitude,
    ST_Distance(
      ST_Point(l.longitude, l.latitude)::geography,
      ST_Point(user_lng, user_lat)::geography
    ) / 1000 as distance_km
  FROM games g
  JOIN locations l ON g."locationId" = l.id
  WHERE 
    g.status = 'scheduled'
    AND ST_DWithin(
      ST_Point(l.longitude, l.latitude)::geography,
      ST_Point(user_lng, user_lat)::geography,
      radius_km * 1000
    )
  ORDER BY distance_km ASC;
END;
$$;

-- Function to find nearby courts within a radius
CREATE OR REPLACE FUNCTION find_nearby_courts(
  user_lat FLOAT,
  user_lng FLOAT,
  radius_km FLOAT DEFAULT 10
)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  address TEXT,
  description TEXT,
  latitude FLOAT,
  longitude FLOAT,
  "courtType" TEXT,
  "surfaceType" TEXT,
  "hoopCount" INTEGER,
  amenities TEXT[],
  "isActive" BOOLEAN,
  "isVerified" BOOLEAN,
  rating FLOAT,
  "totalGames" INTEGER,
  distance_km FLOAT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.name,
    l.address,
    l.description,
    l.latitude,
    l.longitude,
    l."courtType",
    l."surfaceType",
    l."hoopCount",
    l.amenities,
    l."isActive",
    l."isVerified",
    l.rating,
    l."totalGames",
    ST_Distance(
      ST_Point(l.longitude, l.latitude)::geography,
      ST_Point(user_lng, user_lat)::geography
    ) / 1000 as distance_km
  FROM locations l
  WHERE 
    l."isActive" = true
    AND l."isApproved" = true
    AND ST_DWithin(
      ST_Point(l.longitude, l.latitude)::geography,
      ST_Point(user_lng, user_lat)::geography,
      radius_km * 1000
    )
  ORDER BY distance_km ASC;
END;
$$;

-- Function to get game analytics
CREATE OR REPLACE FUNCTION get_game_analytics(
  timeframe TEXT DEFAULT 'week'
)
RETURNS TABLE (
  period_start DATE,
  total_games INTEGER,
  total_players INTEGER,
  avg_players_per_game FLOAT,
  most_popular_skill_level TEXT,
  most_active_court TEXT
) 
LANGUAGE plpgsql
AS $$
DECLARE
  interval_text TEXT;
BEGIN
  -- Set interval based on timeframe
  CASE timeframe
    WHEN 'day' THEN interval_text := '1 day';
    WHEN 'week' THEN interval_text := '7 days';
    WHEN 'month' THEN interval_text := '30 days';
    ELSE interval_text := '7 days';
  END CASE;

  RETURN QUERY
  SELECT 
    date_trunc('day', g."scheduledAt")::DATE as period_start,
    COUNT(g.id)::INTEGER as total_games,
    COALESCE(SUM(g."currentPlayers"), 0)::INTEGER as total_players,
    COALESCE(AVG(g."currentPlayers"), 0)::FLOAT as avg_players_per_game,
    MODE() WITHIN GROUP (ORDER BY g."skillLevel") as most_popular_skill_level,
    (
      SELECT l.name 
      FROM locations l 
      JOIN games g2 ON g2."locationId" = l.id 
      WHERE g2."scheduledAt" >= date_trunc('day', g."scheduledAt")
        AND g2."scheduledAt" < date_trunc('day', g."scheduledAt") + INTERVAL '1 day'
      GROUP BY l.name 
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    ) as most_active_court
  FROM games g
  WHERE g."scheduledAt" >= NOW() - INTERVAL interval_text
  GROUP BY date_trunc('day', g."scheduledAt")
  ORDER BY period_start DESC;
END;
$$;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(
  user_id TEXT
)
RETURNS TABLE (
  games_created INTEGER,
  games_joined INTEGER,
  games_completed INTEGER,
  total_games INTEGER,
  favorite_skill_level TEXT,
  favorite_court TEXT,
  avg_game_rating FLOAT,
  locations_created INTEGER
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM games WHERE "creatorId" = user_id) as games_created,
    (SELECT COUNT(*)::INTEGER FROM game_participants WHERE "userId" = user_id AND status = 'joined') as games_joined,
    (SELECT COUNT(*)::INTEGER FROM game_participants gp 
     JOIN games g ON gp."gameId" = g.id 
     WHERE gp."userId" = user_id AND g.status = 'completed') as games_completed,
    (SELECT COUNT(*)::INTEGER FROM game_participants WHERE "userId" = user_id) as total_games,
    (SELECT MODE() WITHIN GROUP (ORDER BY g."skillLevel") 
     FROM games g 
     WHERE g."creatorId" = user_id OR g.id IN (
       SELECT "gameId" FROM game_participants WHERE "userId" = user_id
     )) as favorite_skill_level,
    (SELECT l.name 
     FROM locations l 
     JOIN games g ON g."locationId" = l.id 
     WHERE g."creatorId" = user_id OR g.id IN (
       SELECT "gameId" FROM game_participants WHERE "userId" = user_id
     )
     GROUP BY l.name 
     ORDER BY COUNT(*) DESC 
     LIMIT 1) as favorite_court,
    0.0 as avg_game_rating, -- Placeholder for future rating system
    (SELECT COUNT(*)::INTEGER FROM locations WHERE "createdBy" = user_id) as locations_created;
END;
$$;

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('profile-pictures', 'profile-pictures', true),
  ('court-photos', 'court-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile and public data of others
CREATE POLICY "Users can view profiles" ON users
FOR SELECT USING (true); -- Public profiles for now

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid()::text = id);

-- Games are publicly viewable
CREATE POLICY "Games are publicly viewable" ON games
FOR SELECT USING (true);

-- Only authenticated users can create games
CREATE POLICY "Authenticated users can create games" ON games
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own games
CREATE POLICY "Users can update own games" ON games
FOR UPDATE USING (auth.uid()::text = "creatorId");

-- Locations are publicly viewable if approved
CREATE POLICY "Approved locations are publicly viewable" ON locations
FOR SELECT USING ("isApproved" = true);

-- Only authenticated users can create locations
CREATE POLICY "Authenticated users can create locations" ON locations
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own locations
CREATE POLICY "Users can update own locations" ON locations
FOR UPDATE USING (auth.uid()::text = "createdBy");

-- Game participants can view and manage their own participation
CREATE POLICY "Users can view game participants" ON game_participants
FOR SELECT USING (true);

CREATE POLICY "Users can join games" ON game_participants
FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own participation" ON game_participants
FOR UPDATE USING (auth.uid()::text = "userId");

-- Storage policies for file uploads
CREATE POLICY "Users can upload their own profile pictures" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Profile pictures are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can upload court photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'court-photos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Court photos are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'court-photos');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_games_location_scheduled ON games("locationId", "scheduledAt");
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_skill_level ON games("skillLevel");
CREATE INDEX IF NOT EXISTS idx_locations_coordinates ON locations USING GIST (ST_Point(longitude, latitude));
CREATE INDEX IF NOT EXISTS idx_locations_active_approved ON locations("isActive", "isApproved");
CREATE INDEX IF NOT EXISTS idx_game_participants_game_user ON game_participants("gameId", "userId");
CREATE INDEX IF NOT EXISTS idx_game_participants_user ON game_participants("userId");

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Enable real-time for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE game_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE locations;

COMMENT ON FUNCTION find_nearby_games IS 'Find games within specified radius of user location';
COMMENT ON FUNCTION find_nearby_courts IS 'Find courts within specified radius of user location';
COMMENT ON FUNCTION get_game_analytics IS 'Get analytics data for games within specified timeframe';
COMMENT ON FUNCTION get_user_stats IS 'Get comprehensive statistics for a specific user';