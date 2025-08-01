# Database Setup Guide

This guide will help you set up PostgreSQL with Prisma for the BallUp backend.

## Quick Start Options

### Option 1: Local PostgreSQL (Recommended for Development)

1. Install PostgreSQL on your machine:

   ```bash
   # macOS (using Homebrew)
   brew install postgresql
   brew services start postgresql

   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql

   # Windows - Download from https://www.postgresql.org/download/windows/
   ```

2. Create a database:

   ```bash
   psql -U postgres
   CREATE DATABASE ballup_db;
   CREATE USER ballup_user WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE ballup_db TO ballup_user;
   \q
   ```

3. Update your `.env` file:
   ```env
   DATABASE_URL="postgresql://ballup_user:your_password@localhost:5432/ballup_db"
   ```

### Option 2: Supabase (Free Cloud PostgreSQL)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string and update your `.env` file:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```

### Option 3: Neon (Free Cloud PostgreSQL)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string and update your `.env` file:
   ```env
   DATABASE_URL="postgresql://username:password@ep-endpoint.region.neon.tech/database?sslmode=require"
   ```

### Option 4: Railway (Free Cloud PostgreSQL)

1. Go to [railway.app](https://railway.app) and create a free account
2. Create a new project and add PostgreSQL
3. Copy the connection string and update your `.env` file:
   ```env
   DATABASE_URL="postgresql://postgres:password@containers-us-west-id.railway.app:port/railway"
   ```

## Setup Steps

1. **Install dependencies** (if not already done):

   ```bash
   npm install
   ```

2. **Generate Prisma client**:

   ```bash
   npm run generate
   ```

3. **Run database migrations**:

   ```bash
   npm run migrate
   ```

4. **Seed the database** (optional):

   ```bash
   npm run seed
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

## Useful Commands

- **View database in browser**: `npm run db:studio`
- **Push schema changes**: `npm run db:push`
- **Reset database**: `npx prisma migrate reset`
- **Generate new migration**: `npx prisma migrate dev --name your_migration_name`

## Environment Variables

Make sure your `.env` file contains:

```env
# Database
DATABASE_URL="your_postgresql_connection_string"

# JWT
JWT_SECRET=your-secure-jwt-secret
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
```

## Troubleshooting

### Connection Issues

- Ensure PostgreSQL is running
- Check your connection string format
- Verify username, password, host, and port
- For cloud databases, ensure your IP is whitelisted

### Migration Issues

- Run `npx prisma generate` after schema changes
- Use `npx prisma migrate reset` to reset and reapply all migrations
- Check migration files in `prisma/migrations/`

### SSL Issues (Cloud Databases)

- Add `?sslmode=require` to your connection string for cloud databases
- Some providers require specific SSL configurations

## Production Deployment

1. **Environment Variables**: Ensure all production environment variables are set
2. **SSL**: Use SSL connections for production databases
3. **Connection Pooling**: Consider using connection pooling for high-traffic applications
4. **Backups**: Set up automated backups for your production database

For more information, see the [Prisma documentation](https://www.prisma.io/docs/).
