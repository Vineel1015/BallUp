-- Basic SQL Functions for BallUp (without PostGIS dependency)
-- Run these in Supabase Dashboard → SQL Editor

-- Function to find nearby games using basic distance calculation
CREATE OR REPLACE FUNCTION find_nearby_games_basic(
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
    -- Basic distance calculation using Haversine formula approximation
    (
      6371 * acos(
        cos(radians(user_lat)) * 
        cos(radians(l.latitude)) * 
        cos(radians(l.longitude) - radians(user_lng)) + 
        sin(radians(user_lat)) * 
        sin(radians(l.latitude))
      )
    ) as distance_km
  FROM games g
  JOIN locations l ON g."locationId" = l.id
  WHERE 
    g.status = 'scheduled'
    AND (
      -- Simple bounding box check first (faster)
      l.latitude BETWEEN user_lat - (radius_km / 111.0) AND user_lat + (radius_km / 111.0)
      AND l.longitude BETWEEN user_lng - (radius_km / (111.0 * cos(radians(user_lat)))) AND user_lng + (radius_km / (111.0 * cos(radians(user_lat))))
    )
    AND (
      -- Then accurate distance check
      6371 * acos(
        cos(radians(user_lat)) * 
        cos(radians(l.latitude)) * 
        cos(radians(l.longitude) - radians(user_lng)) + 
        sin(radians(user_lat)) * 
        sin(radians(l.latitude))
      )
    ) <= radius_km
  ORDER BY distance_km ASC;
END;
$$;

-- Function to find nearby courts using basic distance calculation
CREATE OR REPLACE FUNCTION find_nearby_courts_basic(
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
    -- Basic distance calculation using Haversine formula
    (
      6371 * acos(
        cos(radians(user_lat)) * 
        cos(radians(l.latitude)) * 
        cos(radians(l.longitude) - radians(user_lng)) + 
        sin(radians(user_lat)) * 
        sin(radians(l.latitude))
      )
    ) as distance_km
  FROM locations l
  WHERE 
    l."isActive" = true
    AND l."isApproved" = true
    AND (
      -- Simple bounding box check first (faster)
      l.latitude BETWEEN user_lat - (radius_km / 111.0) AND user_lat + (radius_km / 111.0)
      AND l.longitude BETWEEN user_lng - (radius_km / (111.0 * cos(radians(user_lat)))) AND user_lng + (radius_km / (111.0 * cos(radians(user_lat))))
    )
    AND (
      -- Then accurate distance check
      6371 * acos(
        cos(radians(user_lat)) * 
        cos(radians(l.latitude)) * 
        cos(radians(l.longitude) - radians(user_lng)) + 
        sin(radians(user_lat)) * 
        sin(radians(l.latitude))
      )
    ) <= radius_km
  ORDER BY distance_km ASC;
END;
$$;

-- Simple analytics function (no complex dependencies)
CREATE OR REPLACE FUNCTION get_basic_analytics()
RETURNS TABLE (
  total_users INTEGER,
  total_games INTEGER,
  total_locations INTEGER,
  active_games INTEGER,
  completed_games INTEGER,
  avg_players_per_game FLOAT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM users) as total_users,
    (SELECT COUNT(*)::INTEGER FROM games) as total_games,
    (SELECT COUNT(*)::INTEGER FROM locations WHERE "isActive" = true) as total_locations,
    (SELECT COUNT(*)::INTEGER FROM games WHERE status = 'scheduled') as active_games,
    (SELECT COUNT(*)::INTEGER FROM games WHERE status = 'completed') as completed_games,
    (SELECT COALESCE(AVG("currentPlayers"), 0)::FLOAT FROM games) as avg_players_per_game;
END;
$$;

-- Create indexes for better performance (basic version)
CREATE INDEX IF NOT EXISTS idx_games_location_scheduled ON games("locationId", "scheduledAt");
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_skill_level ON games("skillLevel");
CREATE INDEX IF NOT EXISTS idx_locations_lat_lng ON locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_locations_active_approved ON locations("isActive", "isApproved");
CREATE INDEX IF NOT EXISTS idx_game_participants_game_user ON game_participants("gameId", "userId");
CREATE INDEX IF NOT EXISTS idx_game_participants_user ON game_participants("userId");

COMMENT ON FUNCTION find_nearby_games_basic IS 'Find games within radius using basic distance calculation';
COMMENT ON FUNCTION find_nearby_courts_basic IS 'Find courts within radius using basic distance calculation';
COMMENT ON FUNCTION get_basic_analytics IS 'Get basic analytics without complex dependencies';