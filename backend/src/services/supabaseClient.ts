import { createClient } from '@supabase/supabase-js';
import { config } from '../config/environment';

// Initialize Supabase client
const supabaseUrl = config.SUPABASE_URL || '';
const supabaseServiceKey = config.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database helper functions for BallUp specific operations
export class SupabaseHelpers {
  
  // Real-time game updates
  static subscribeToGameUpdates(gameId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`game-${gameId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${gameId}`
      }, callback)
      .subscribe();
  }

  // Real-time participant updates
  static subscribeToParticipantUpdates(gameId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`participants-${gameId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_participants',
        filter: `gameId=eq.${gameId}`
      }, callback)
      .subscribe();
  }

  // Geospatial queries for nearby games
  static async findNearbyGames(latitude: number, longitude: number, radiusKm: number = 5) {
    try {
      const { data, error } = await supabase.rpc('find_nearby_games', {
        user_lat: latitude,
        user_lng: longitude,
        radius_km: radiusKm
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error finding nearby games:', error);
      throw error;
    }
  }

  // Geospatial queries for nearby courts
  static async findNearbyCourts(latitude: number, longitude: number, radiusKm: number = 10) {
    try {
      const { data, error } = await supabase.rpc('find_nearby_courts', {
        user_lat: latitude,
        user_lng: longitude,
        radius_km: radiusKm
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error finding nearby courts:', error);
      throw error;
    }
  }

  // File upload helpers
  static async uploadProfilePicture(userId: string, file: Buffer, filename: string) {
    try {
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(`${userId}/${filename}`, file, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(`${userId}/${filename}`);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  }

  static async uploadCourtPhoto(locationId: string, file: Buffer, filename: string) {
    try {
      const { data, error } = await supabase.storage
        .from('court-photos')
        .upload(`${locationId}/${filename}`, file, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('court-photos')
        .getPublicUrl(`${locationId}/${filename}`);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading court photo:', error);
      throw error;
    }
  }

  // Analytics helpers
  static async getGameAnalytics(timeframe: 'day' | 'week' | 'month' = 'week') {
    try {
      const { data, error } = await supabase.rpc('get_game_analytics', {
        timeframe
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting game analytics:', error);
      throw error;
    }
  }

  // User statistics
  static async getUserStats(userId: string) {
    try {
      const { data, error } = await supabase.rpc('get_user_stats', {
        user_id: userId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }
}

export default supabase;