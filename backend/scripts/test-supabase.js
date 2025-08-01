#!/usr/bin/env node

// Quick Supabase connection test script
// Run with: node scripts/test-supabase.js

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSupabaseConnection() {
  console.log('🚀 Testing Supabase connection...\n');

  try {
    // Test 1: Database connection
    console.log('1️⃣ Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!\n');

    // Test 2: Check if tables exist
    console.log('2️⃣ Checking database tables...');
    const userCount = await prisma.user.count();
    const gameCount = await prisma.game.count();
    const locationCount = await prisma.location.count();
    
    console.log(`✅ Tables found:`);
    console.log(`   - Users: ${userCount} records`);
    console.log(`   - Games: ${gameCount} records`);
    console.log(`   - Locations: ${locationCount} records\n`);

    // Test 3: Test environment variables
    console.log('3️⃣ Checking environment variables...');
    const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
    const optionalVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
    
    const missing = requiredVars.filter(key => !process.env[key]);
    if (missing.length > 0) {
      console.log(`❌ Missing required variables: ${missing.join(', ')}`);
      process.exit(1);
    }
    
    console.log('✅ All required environment variables present');
    
    const supabaseConfigured = optionalVars.every(key => process.env[key]);
    if (supabaseConfigured) {
      console.log('✅ Supabase configuration complete');
    } else {
      console.log('⚠️  Supabase optional variables not all set (this is OK for basic usage)');
    }
    console.log();

    // Test 4: Test a simple query
    console.log('4️⃣ Testing database query...');
    const testUser = await prisma.user.findFirst();
    if (testUser) {
      console.log(`✅ Sample user found: ${testUser.username} (${testUser.email})`);
    } else {
      console.log('ℹ️  No users found (database is empty - this is normal for new setup)');
    }
    console.log();

    // Test 5: Check PostGIS (if available)
    console.log('5️⃣ Testing PostGIS extension...');
    try {
      const result = await prisma.$queryRaw`SELECT PostGIS_Version() as version`;
      console.log(`✅ PostGIS available: ${result[0]?.version || 'version detected'}`);
    } catch (error) {
      console.log('⚠️  PostGIS not available (run the SQL functions from sql/supabase_functions.sql)');
    }
    console.log();

    console.log('🎉 Supabase connection test completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. If PostGIS is not available, run the SQL from sql/supabase_functions.sql');
    console.log('2. Run: npm run seed (to add sample data)');
    console.log('3. Run: npm run dev (to start the server)');
    console.log('4. Visit: http://localhost:3000 (to test the API)');

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your DATABASE_URL in .env file');
    console.log('2. Ensure your Supabase project is active');
    console.log('3. Verify network connectivity');
    console.log('4. Run: npm run migrate (to create tables)');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testSupabaseConnection();