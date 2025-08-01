# 🔑 Get Your Supabase Credentials

You need to get 2 more values from your Supabase dashboard:

## 1. 🔐 Database Password

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your **BallUp** project
3. Go to **Settings** → **Database**
4. Scroll down to **Connection string**
5. Copy the **Connection string** (it will look like this):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.hpecednbnrhaowivzegz.supabase.co:5432/postgres
   ```
6. **Replace `YOUR_DATABASE_PASSWORD`** in your `.env` file with the actual password

## 2. 🔑 Service Role Key

1. Still in your Supabase project dashboard
2. Go to **Settings** → **API**
3. Find the **Project API keys** section
4. Copy the **service_role** key (it's a long JWT token starting with `eyJ...`)
5. **Replace `ADD_YOUR_SERVICE_ROLE_KEY_HERE`** in your `.env` file

## 📋 Quick Checklist

After updating your `.env` file, it should look like this:
```env
DATABASE_URL="postgresql://postgres:your_actual_password@db.hpecednbnrhaowivzegz.supabase.co:5432/postgres"
SUPABASE_URL="https://hpecednbnrhaowivzegz.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwZWNlZG5ibnJoYW93aXZ6ZWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTQzNTYsImV4cCI6MjA2OTU3MDM1Nn0.o5YfNN_D9_TlpjCe8e_LbnRxUZI5TAfFdvqQXtkhOAQ"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_actual_service_role_key_here"
```

## ⚡ Test Connection

Once you've updated the `.env` file, test the connection:
```bash
npm run test:supabase
```

## 🆘 Need Help?

If you're having trouble finding these values:
1. Make sure you're logged into the correct Supabase account
2. Ensure your project is fully initialized (can take 2-3 minutes after creation)
3. Check that your project is in the "Active" status

**Once you've updated the credentials, let me know and I'll continue with the database setup!**