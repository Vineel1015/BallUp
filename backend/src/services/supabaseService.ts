import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (FREE tier)
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Public client for frontend operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for backend operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database helper functions
export const supabaseService = {
  // Test database connection
  async testConnection() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
        
      if (error) {
        console.error('Supabase connection error:', error);
        return false;
      }
      
      console.log('✅ Supabase connection successful');
      return true;
    } catch (error) {
      console.error('Supabase connection failed:', error);
      return false;
    }
  },

  // Real-time subscriptions for games
  subscribeToGames(callback: (payload: any) => void) {
    return supabase
      .channel('games-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'Game' }, 
        callback
      )
      .subscribe();
  },

  // Real-time subscriptions for game players
  subscribeToGamePlayers(gameId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`game-players-${gameId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'GamePlayer',
          filter: `gameId=eq.${gameId}`
        }, 
        callback
      )
      .subscribe();
  },

  // File upload helpers (using Supabase Storage - FREE tier)
  async uploadFile(bucket: string, path: string, file: Buffer, contentType: string) {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(path, file, {
          contentType,
          upsert: true
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(path);

      return {
        success: true,
        path: data.path,
        publicUrl: urlData.publicUrl
      };
    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  },

  // Delete file from storage
  async deleteFile(bucket: string, path: string) {
    try {
      const { error } = await supabaseAdmin.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('File deletion error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Deletion failed'
      };
    }
  },

  // Get signed URL for file access
  async getSignedUrl(bucket: string, path: string, expiresIn = 3600) {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        throw error;
      }

      return {
        success: true,
        signedUrl: data.signedUrl
      };
    } catch (error) {
      console.error('Signed URL error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create signed URL'
      };
    }
  },

  // Initialize storage buckets
  async initializeStorage() {
    try {
      // Create buckets if they don't exist
      const buckets = [
        { name: 'user-avatars', public: true },
        { name: 'game-images', public: true },
        { name: 'location-images', public: true }
      ];

      for (const bucket of buckets) {
        const { error } = await supabaseAdmin.storage.createBucket(bucket.name, {
          public: bucket.public
        });

        if (error && !error.message.includes('already exists')) {
          console.error(`Error creating bucket ${bucket.name}:`, error);
        } else {
          console.log(`✅ Storage bucket '${bucket.name}' ready`);
        }
      }

      return true;
    } catch (error) {
      console.error('Storage initialization error:', error);
      return false;
    }
  },

  // Edge functions for advanced features (FREE tier includes edge functions)
  async invokeEdgeFunction(functionName: string, payload: any) {
    try {
      const { data, error } = await supabaseAdmin.functions.invoke(functionName, {
        body: payload
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error(`Edge function ${functionName} error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Edge function failed'
      };
    }
  }
};

// Initialize Supabase services on startup
export const initializeSupabase = async () => {
  console.log('🔧 Initializing Supabase services...');
  
  const connectionOk = await supabaseService.testConnection();
  if (!connectionOk) {
    console.warn('⚠️  Supabase connection issues detected');
  }

  const storageOk = await supabaseService.initializeStorage();
  if (!storageOk) {
    console.warn('⚠️  Supabase storage initialization issues');
  }

  console.log('🎯 Supabase services initialized');
  return connectionOk && storageOk;
};