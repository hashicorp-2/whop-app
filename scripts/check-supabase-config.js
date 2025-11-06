#!/usr/bin/env node

/**
 * Quick script to validate Supabase configuration
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');

console.log('🔍 Checking Supabase Configuration...\n');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found');
  console.log('   Create it in the project root with your Supabase credentials');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    envVars[key] = value;
  }
});

const url = envVars.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

console.log('📋 Current Configuration:\n');

if (!url) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL: Missing');
} else {
  const isValid = url.startsWith('https://') && 
                  url.includes('.supabase.co') && 
                  !url.endsWith('/') &&
                  url !== 'https://placeholder.supabase.co';
  
  if (isValid) {
    console.log(`✅ NEXT_PUBLIC_SUPABASE_URL: ${url}`);
    console.log(`   Status: Valid format`);
  } else {
    console.log(`⚠️  NEXT_PUBLIC_SUPABASE_URL: ${url}`);
    if (url === 'https://placeholder.supabase.co') {
      console.log(`   Status: Placeholder - needs real URL`);
    } else {
      console.log(`   Status: Invalid format`);
      console.log(`   Expected: https://xxxxx.supabase.co (no trailing slash)`);
    }
  }
}

if (!anonKey) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY: Missing');
} else if (anonKey.length < 50) {
  console.log(`⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${anonKey.substring(0, 20)}...`);
  console.log(`   Status: Too short - may be invalid`);
} else {
  console.log(`✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${anonKey.substring(0, 20)}...`);
  console.log(`   Status: Present (length: ${anonKey.length} chars)`);
}

if (!serviceKey) {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY: Missing');
} else if (serviceKey.length < 50) {
  console.log(`⚠️  SUPABASE_SERVICE_ROLE_KEY: ${serviceKey.substring(0, 20)}...`);
  console.log(`   Status: Too short - may be invalid`);
} else {
  console.log(`✅ SUPABASE_SERVICE_ROLE_KEY: ${serviceKey.substring(0, 20)}...`);
  console.log(`   Status: Present (length: ${serviceKey.length} chars)`);
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (!url || url === 'https://placeholder.supabase.co' || !anonKey || !serviceKey) {
  console.log('❌ Configuration incomplete!');
  console.log('\n📝 Next Steps:');
  console.log('   1. Go to https://supabase.com/dashboard');
  console.log('   2. Create/select a project');
  console.log('   3. Go to Settings → API');
  console.log('   4. Copy Project URL, anon key, and service_role key');
  console.log('   5. Update .env.local with real values');
  console.log('   6. Run this script again to verify');
  console.log('\n📖 See SETUP_SUPABASE.md for detailed instructions\n');
  process.exit(1);
} else {
  console.log('✅ Configuration looks good!');
  console.log('\n💡 Test your Supabase URL:');
  console.log(`   Open: ${url}`);
  console.log('   Should show Supabase status page or API docs');
  console.log('\n🚀 Restart your dev server after updating .env.local\n');
  process.exit(0);
}
