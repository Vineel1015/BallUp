# BallUp Deployment Guide

## Summary

✅ **Web Demo Issue Fixed**: Registration now properly connects to backend API and creates users in Supabase database  
✅ **Database Seeded**: 8 users, 6 courts, 6 games with participants  
🚀 **Ready for Deployment**: Multiple deployment options configured  

## Quick Deployment Options

### 1. Railway (Recommended - Free)
Railway offers the easiest deployment with PostgreSQL included.

**Steps:**
1. Visit [railway.app](https://railway.app)
2. Connect your GitHub account
3. Create new project from GitHub repo
4. Railway will auto-detect the `railway.json` config
5. Add environment variables:
   ```
   NODE_ENV=production
   DATABASE_URL=(Railway provides this automatically)
   JWT_SECRET=your-super-secret-jwt-key-here
   ```
6. Deploy! 🚀

### 2. Render (Free Tier)
Render provides free hosting with PostgreSQL.

**Steps:**
1. Visit [render.com](https://render.com)
2. Connect GitHub repo
3. Create PostgreSQL database first
4. Create web service using `render.yaml`
5. Set environment variables in dashboard
6. Deploy!

### 3. Vercel (Serverless)
**Steps:**
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in backend directory
3. Configure environment variables
4. Deploy with `vercel --prod`

### 4. DigitalOcean App Platform
**Steps:**
1. Visit DigitalOcean App Platform
2. Connect GitHub repo
3. Use provided `Dockerfile`
4. Add managed PostgreSQL database
5. Configure environment variables
6. Deploy!

## Environment Variables for Production

```bash
# Required
NODE_ENV=production
DATABASE_URL=your-database-connection-string
JWT_SECRET=your-super-secure-jwt-secret-at-least-32-chars
JWT_EXPIRES_IN=7d

# Optional but recommended
ENABLE_RATE_LIMITING=true
ENABLE_LOGGING=true
ENABLE_CORS=true
ENABLE_HELMET=true
ENABLE_COMPRESSION=true

# Rate limiting (optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=5

# Frontend URL for CORS
FRONTEND_URL=https://your-frontend-domain.com
```

## Database Setup

### Option 1: Use Existing Supabase
Your current Supabase database is ready to use. Just use the same `DATABASE_URL`.

### Option 2: New Database
If you want a fresh database:
1. Create new PostgreSQL database on your platform
2. Run migrations: `npm run migrate:deploy`
3. Seed with sample data: `npm run seed:sample`

## Post-Deployment

1. **Test API**: Visit `https://your-api-url.com/health`
2. **Update Frontend**: Change API URLs in web demo from `localhost:3000` to your deployed URL
3. **Test Registration**: Try creating a new user through the web interface

## Frontend Deployment

### Update API URLs
Before deploying frontend, update the API endpoints:

**In `web-demo/app.js`:**
```javascript
// Change from:
const response = await fetch('http://localhost:3000/api/auth/login', {

// To:
const response = await fetch('https://your-api-url.com/api/auth/login', {
```

### Deploy Frontend Options:
1. **Netlify**: Drag & drop `web-demo` folder
2. **Vercel**: `vercel --prod` in web-demo directory  
3. **GitHub Pages**: Push to gh-pages branch
4. **Surge.sh**: `surge` in web-demo directory

## Troubleshooting

### Database Connection Issues
- Ensure DATABASE_URL is correctly formatted
- Check if database allows connections from deployment platform
- Verify Prisma migrations are applied

### CORS Issues
- Add your frontend domain to FRONTEND_URL environment variable
- Ensure ENABLE_CORS=true

### API Not Responding
- Check health endpoint: `/health`
- Verify PORT environment variable (most platforms set this automatically)
- Check logs for startup errors

## Current Status

✅ Backend API fully functional  
✅ Database seeded with sample data  
✅ Web demo connects to real database  
✅ Authentication working  
✅ Game creation/joining working  
✅ Deployment configs ready  

## Test Accounts

Use these accounts to test the deployed application:
- **Email**: john.doe@example.com
- **Email**: mike.jordan@example.com
- **Email**: sarah.wilson@example.com
- **Email**: admin@ballup.com
- **Password**: password123

Or create new accounts through the registration form (now working!).

---

Your BallUp application is ready for prime time! 🏀🚀