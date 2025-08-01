# 🚀 Supabase Setup Guide for BallUp

This guide will walk you through setting up Supabase as your PostgreSQL database provider for the BallUp project.

## 📋 Step 1: Create Supabase Account & Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up** using GitHub, Google, or email
3. **Create a New Project**:
   - Project Name: `BallUp` or `ballup-production`
   - Database Password: Generate a strong password (save this!)
   - Region: Choose closest to your users (e.g., `US East` for North America)
   - Plan: **Free tier** (perfect for development and small scale)

## 🔑 Step 2: Get Your Database Credentials

After project creation (takes ~2 minutes):

1. **Go to Settings → Database**
2. **Copy the Connection String**:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```
3. **Note down these values**:
   - Project URL: `https://[YOUR-PROJECT-REF].supabase.co`
   - API Key (anon): `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - API Key (service_role): `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## ⚙️ Step 3: Update Your Environment Variables

Update your `backend/.env` file:

```env
# Database Configuration - Supabase
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase Configuration
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

## 🛠️ Step 4: Run Database Setup

```bash
cd backend

# Install dependencies (if not done)
npm install

# Generate Prisma client
npm run generate

# Run migrations to create tables
npm run migrate

# Seed with sample data (optional)
npm run seed

# Start development server
npm run dev
```

## 🎯 Step 5: Verify Connection

1. **Check server logs** - Should see "Database connected successfully"
2. **Open Supabase Dashboard** → Table Editor
3. **You should see your tables**: `users`, `games`, `locations`, etc.
4. **Test with Prisma Studio**: `npm run db:studio`

## 📊 Step 6: Configure Row Level Security (RLS)

In Supabase Dashboard → Authentication → Policies:

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid()::text = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid()::text = id);
```

## 🔄 Step 7: Real-time Features (Optional but Recommended)

Enable real-time for live game updates:

1. **Go to Database → Replication**
2. **Enable replication** for these tables:
   - `games` - For live game updates
   - `game_participants` - For player join/leave events
   - `locations` - For new courts

## 🚀 Step 8: Production Optimization

### Performance Settings:
1. **Database → Settings**:
   - Connection pooling: Enable
   - Statement timeout: 30s
   - Lock timeout: 10s

### Security Settings:
1. **Authentication → Settings**:
   - Enable email confirmations
   - Set up custom SMTP (optional)
   - Configure JWT expiry

## 💡 Pro Tips for BallUp

### 1. Geospatial Queries
Supabase includes PostGIS for location-based features:

```sql
-- Find games within 5km of user location
SELECT * FROM games g
JOIN locations l ON g.location_id = l.id
WHERE ST_DWithin(
  ST_Point(l.longitude, l.latitude)::geography,
  ST_Point(-74.006, 40.7128)::geography,
  5000
);
```

### 2. Real-time Game Updates
```javascript
// Subscribe to game changes
const subscription = supabase
  .channel('game-updates')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'games' },
    (payload) => {
      console.log('Game updated:', payload);
    }
  )
  .subscribe();
```

### 3. File Storage for Images
```javascript
// Upload profile pictures
const { data, error } = await supabase.storage
  .from('profile-pictures')
  .upload('user-123.jpg', file);
```

## 🔧 Troubleshooting

### Connection Issues:
- ✅ Check if DATABASE_URL is correctly formatted
- ✅ Verify password doesn't contain special characters that need encoding
- ✅ Ensure project is fully initialized (can take 2-3 minutes)

### Migration Issues:
- ✅ Run `npx prisma db push` if migrations fail
- ✅ Check Supabase logs in Dashboard → Logs
- ✅ Verify your IP isn't blocked (Supabase allows all IPs by default)

### Performance Issues:
- ✅ Enable connection pooling
- ✅ Add database indexes for frequently queried columns
- ✅ Use `EXPLAIN ANALYZE` for slow queries

## 📈 Free Tier Limits

- **Database**: 500 MB
- **Bandwidth**: 2 GB/month
- **File Storage**: 1 GB
- **Realtime**: 200 concurrent connections
- **Auth**: 50,000 monthly active users

Perfect for development and small to medium production apps!

## 🔗 Useful Links

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase Docs](https://supabase.com/docs)
- [PostGIS Documentation](https://postgis.net/docs/)
- [Prisma with Supabase](https://supabase.com/docs/guides/integrations/prisma)

---

**Next**: Once setup is complete, test your connection with `npm run dev` and check the logs!