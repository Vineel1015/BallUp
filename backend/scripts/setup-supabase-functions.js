#!/usr/bin/env node

// Setup Supabase SQL functions automatically
// Run with: node scripts/setup-supabase-functions.js

const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupSupabaseFunctions() {
  console.log('🔧 Setting up Supabase SQL functions...\n');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../sql/supabase_functions.sql');
    if (!fs.existsSync(sqlPath)) {
      throw new Error('SQL file not found at: ' + sqlPath);
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split by semicolons and filter out empty statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'))
      .map(stmt => stmt + ';');

    console.log(`📄 Found ${statements.length} SQL statements to execute...\n`);

    let successCount = 0;
    let skipCount = 0;

    // Execute statements one by one
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.trim().startsWith('--') || statement.trim().length < 5) {
        continue;
      }

      try {
        console.log(`[${i + 1}/${statements.length}] Executing statement...`);
        
        // Extract statement type for logging
        const statementType = statement.trim().split(' ')[0].toUpperCase();
        
        await prisma.$executeRawUnsafe(statement);
        successCount++;
        
        console.log(`✅ ${statementType} executed successfully`);
        
      } catch (error) {
        // Some errors are expected (like "already exists")
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate key') ||
            error.message.includes('relation') && error.message.includes('already exists')) {
          console.log(`⚠️  Skipped (already exists): ${error.message.split('\n')[0]}`);
          skipCount++;
        } else {
          console.log(`❌ Failed: ${error.message.split('\n')[0]}`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`🎉 Supabase functions setup completed!`);
    console.log(`✅ Successfully executed: ${successCount} statements`);
    console.log(`⚠️  Skipped (already exists): ${skipCount} statements`);
    
    // Test PostGIS
    console.log('\n🧪 Testing PostGIS extension...');
    try {
      const result = await prisma.$queryRaw`SELECT PostGIS_Version() as version`;
      console.log(`✅ PostGIS is available: ${result[0]?.version || 'version detected'}`);
    } catch (error) {
      console.log('⚠️  PostGIS test failed - may not be fully configured');
    }

    // Test our custom functions
    console.log('\n🧪 Testing custom functions...');
    try {
      // Test find_nearby_games function
      const nearbyGames = await prisma.$queryRaw`
        SELECT * FROM find_nearby_games(40.7831, -73.9712, 5) LIMIT 1
      `;
      console.log('✅ find_nearby_games function is working');
      
      // Test find_nearby_courts function  
      const nearbyCourts = await prisma.$queryRaw`
        SELECT * FROM find_nearby_courts(40.7831, -73.9712, 10) LIMIT 1
      `;
      console.log('✅ find_nearby_courts function is working');
      
    } catch (error) {
      console.log(`⚠️  Custom functions test: ${error.message.split('\n')[0]}`);
    }

    console.log('\n📋 Next steps:');
    console.log('1. Run: npm run seed (to add sample data)');
    console.log('2. Run: npm run dev (to start the server)');
    console.log('3. Test the geospatial queries with sample data');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n🔧 Manual setup required:');
    console.log('1. Go to your Supabase Dashboard → SQL Editor');
    console.log('2. Copy and paste the contents of sql/supabase_functions.sql');
    console.log('3. Execute the SQL manually');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupSupabaseFunctions();