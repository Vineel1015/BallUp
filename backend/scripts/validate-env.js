#!/usr/bin/env node

// Environment validation script
// Run with: node scripts/validate-env.js

require('dotenv').config();

function validateEnv() {
  console.log('🔍 Validating environment variables...\n');
  
  const checks = [];
  
  // Check DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    checks.push({ name: 'DATABASE_URL', status: '❌', message: 'Missing DATABASE_URL' });
  } else if (dbUrl.includes('YOUR_DATABASE_PASSWORD')) {
    checks.push({ name: 'DATABASE_URL', status: '⚠️ ', message: 'Replace YOUR_DATABASE_PASSWORD with actual password' });
  } else if (!dbUrl.includes('hpecednbnrhaowivzegz.supabase.co')) {
    checks.push({ name: 'DATABASE_URL', status: '⚠️ ', message: 'Check if URL matches your project ref' });
  } else {
    checks.push({ name: 'DATABASE_URL', status: '✅', message: 'Looks good' });
  }
  
  // Check SUPABASE_URL
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    checks.push({ name: 'SUPABASE_URL', status: '❌', message: 'Missing SUPABASE_URL' });
  } else if (!supabaseUrl.includes('hpecednbnrhaowivzegz.supabase.co')) {
    checks.push({ name: 'SUPABASE_URL', status: '⚠️ ', message: 'Check if URL matches your project ref' });
  } else {
    checks.push({ name: 'SUPABASE_URL', status: '✅', message: 'Looks good' });
  }
  
  // Check SUPABASE_ANON_KEY
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!anonKey) {
    checks.push({ name: 'SUPABASE_ANON_KEY', status: '❌', message: 'Missing SUPABASE_ANON_KEY' });
  } else if (!anonKey.startsWith('eyJ')) {
    checks.push({ name: 'SUPABASE_ANON_KEY', status: '⚠️ ', message: 'Should start with "eyJ" (JWT format)' });
  } else {
    checks.push({ name: 'SUPABASE_ANON_KEY', status: '✅', message: 'Looks good' });
  }
  
  // Check SUPABASE_SERVICE_ROLE_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || serviceKey === 'ADD_YOUR_SERVICE_ROLE_KEY_HERE') {
    checks.push({ name: 'SUPABASE_SERVICE_ROLE_KEY', status: '⚠️ ', message: 'Replace with actual service role key' });
  } else if (!serviceKey.startsWith('eyJ')) {
    checks.push({ name: 'SUPABASE_SERVICE_ROLE_KEY', status: '⚠️ ', message: 'Should start with "eyJ" (JWT format)' });
  } else {
    checks.push({ name: 'SUPABASE_SERVICE_ROLE_KEY', status: '✅', message: 'Looks good' });
  }
  
  // Check JWT_SECRET
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    checks.push({ name: 'JWT_SECRET', status: '❌', message: 'Missing JWT_SECRET' });
  } else if (jwtSecret.length < 32) {
    checks.push({ name: 'JWT_SECRET', status: '⚠️ ', message: 'Should be at least 32 characters' });
  } else {
    checks.push({ name: 'JWT_SECRET', status: '✅', message: 'Looks good' });
  }
  
  // Display results
  console.log('📋 Environment Variable Checks:');
  checks.forEach(check => {
    console.log(`${check.status} ${check.name}: ${check.message}`);
  });
  
  const allGood = checks.every(check => check.status === '✅');
  const hasErrors = checks.some(check => check.status === '❌');
  
  console.log('\n' + '='.repeat(50));
  
  if (allGood) {
    console.log('🎉 All environment variables are properly configured!');
    console.log('✅ Ready to run: npm run test:supabase');
    return true;
  } else if (hasErrors) {
    console.log('❌ Some required environment variables are missing.');
    console.log('📖 Please check scripts/get-supabase-credentials.md for help');
    return false;
  } else {
    console.log('⚠️  Some environment variables need attention.');
    console.log('📖 Please check scripts/get-supabase-credentials.md for help');
    return false;
  }
}

validateEnv();