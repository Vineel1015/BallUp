#!/usr/bin/env node

const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function runBasicFunctions() {
  console.log('🔧 Setting up basic SQL functions...\n');
  
  try {
    const sql = fs.readFileSync('sql/basic_functions.sql', 'utf8');
    const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));
    
    let successCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (stmt) {
        try {
          await prisma.$executeRawUnsafe(stmt + ';');
          console.log(`✅ [${i + 1}/${statements.length}] Executed successfully`);
          successCount++;
        } catch (err) {
          if (err.message.includes('already exists')) {
            console.log(`⚠️  [${i + 1}/${statements.length}] Already exists (skipped)`);
          } else {
            console.log(`❌ [${i + 1}/${statements.length}] ${err.message.split('\n')[0]}`);
          }
        }
      }
    }
    
    console.log(`\n🎉 Basic functions setup completed! (${successCount} successful)`);
    
    // Test the functions
    console.log('\n🧪 Testing basic functions...');
    try {
      const analytics = await prisma.$queryRaw`SELECT * FROM get_basic_analytics()`;
      console.log('✅ get_basic_analytics function is working');
      console.log('📊 Current stats:', analytics[0]);
    } catch (err) {
      console.log('⚠️  Analytics function test failed:', err.message.split('\n')[0]);
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

runBasicFunctions();