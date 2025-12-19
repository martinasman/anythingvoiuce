#!/usr/bin/env node
/**
 * Production Setup Script
 * Configures 46elks and Vapi for production use
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Read .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

async function setup() {
  console.log('🚀 Production Setup for AI Voice Receptionist\n');
  console.log('This script will configure 46elks and Vapi to work together.\n');

  // Step 1: Get production URL
  const productionUrl = await question('Enter your production URL (e.g., https://yourapp.vercel.app): ');

  if (!productionUrl.startsWith('http')) {
    console.log('❌ URL must start with https://');
    process.exit(1);
  }

  console.log('\n📋 Current Configuration:\n');
  console.log(`✅ Vapi US Number: ${envVars.VAPI_PHONE_NUMBER || 'Not set'}`);
  console.log(`✅ Vapi Number ID: ${envVars.VAPI_PHONE_NUMBER_ID || 'Not set'}`);
  console.log(`✅ 46elks Username: ${envVars.ELKS_API_USERNAME || 'Not set'}`);
  console.log(`✅ Production URL: ${productionUrl}`);

  if (!envVars.VAPI_PHONE_NUMBER || !envVars.VAPI_PHONE_NUMBER_ID) {
    console.log('\n❌ Vapi phone number not configured!');
    console.log('Please set VAPI_PHONE_NUMBER and VAPI_PHONE_NUMBER_ID in your .env.local');
    process.exit(1);
  }

  if (!envVars.ELKS_API_USERNAME || !envVars.ELKS_API_PASSWORD) {
    console.log('\n❌ 46elks credentials not configured!');
    console.log('Please set ELKS_API_USERNAME and ELKS_API_PASSWORD in your .env.local');
    process.exit(1);
  }

  // Step 2: Update 46elks webhook
  console.log('\n\n🔧 Step 1: Configuring 46elks Webhook\n');

  const authHeader = 'Basic ' + Buffer.from(`${envVars.ELKS_API_USERNAME}:${envVars.ELKS_API_PASSWORD}`).toString('base64');

  // List numbers
  const listResponse = await fetch('https://api.46elks.com/a1/numbers', {
    headers: { 'Authorization': authHeader }
  });

  const numbers = await listResponse.json();

  if (!numbers.data || numbers.data.length === 0) {
    console.log('❌ No 46elks numbers found. You need to allocate a Swedish number first.');
    console.log('   Visit: https://46elks.com/account or activate a customer via the admin dashboard');
    process.exit(1);
  }

  console.log(`Found ${numbers.data.length} 46elks number(s):\n`);

  for (const num of numbers.data) {
    console.log(`📱 ${num.number}`);
    console.log(`   ID: ${num.id}`);
    console.log(`   Status: ${num.active}`);
    console.log(`   Current webhook: ${num.voice_start || 'Not set'}\n`);
  }

  const webhookUrl = `${productionUrl}/api/webhook/46elks`;

  const proceed = await question(`\nUpdate all active numbers to use webhook: ${webhookUrl}? (y/n): `);

  if (proceed.toLowerCase() !== 'y') {
    console.log('Cancelled.');
    process.exit(0);
  }

  console.log('\n📞 Updating 46elks numbers...\n');

  for (const num of numbers.data) {
    if (num.active === 'yes') {
      try {
        const updateResponse = await fetch(`https://api.46elks.com/a1/numbers/${num.id}`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            voice_start: webhookUrl
          }).toString()
        });

        if (updateResponse.ok) {
          console.log(`✅ Updated ${num.number} → ${webhookUrl}`);
        } else {
          const error = await updateResponse.text();
          console.log(`❌ Failed to update ${num.number}: ${error}`);
        }
      } catch (error) {
        console.log(`❌ Error updating ${num.number}:`, error.message);
      }
    }
  }

  // Step 3: Check Vapi configuration
  console.log('\n\n🔧 Step 2: Verifying Vapi Configuration\n');

  console.log('Your Vapi US number will receive forwarded calls from 46elks.');
  console.log('Make sure the Vapi assistant is properly configured in the dashboard.\n');

  console.log('✅ Vapi webhook endpoint: ' + productionUrl + '/api/webhook/vapi');
  console.log('   (Configure this in your Vapi dashboard under Server URL)\n');

  // Step 4: Update environment variable reminder
  console.log('\n🔧 Step 3: Update Production Environment Variables\n');

  console.log('Make sure your production deployment has these environment variables set:\n');
  console.log(`NEXT_PUBLIC_APP_URL=${productionUrl}`);
  console.log(`VAPI_PHONE_NUMBER=${envVars.VAPI_PHONE_NUMBER}`);
  console.log(`VAPI_PHONE_NUMBER_ID=${envVars.VAPI_PHONE_NUMBER_ID}`);
  console.log(`ELKS_API_USERNAME=${envVars.ELKS_API_USERNAME}`);
  console.log(`ELKS_API_PASSWORD=${envVars.ELKS_API_PASSWORD}`);
  console.log(`NEXT_PUBLIC_SUPABASE_URL=${envVars.NEXT_PUBLIC_SUPABASE_URL}`);
  console.log(`SUPABASE_SERVICE_ROLE_KEY=${envVars.SUPABASE_SERVICE_ROLE_KEY}`);

  if (envVars.VAPI_PRIVATE_KEY) {
    console.log(`VAPI_PRIVATE_KEY=${envVars.VAPI_PRIVATE_KEY}`);
  }

  // Summary
  console.log('\n\n✅ Setup Complete!\n');
  console.log('━'.repeat(60));
  console.log('📋 CALL FLOW:\n');
  console.log('1. Customer calls Swedish number (46elks)');
  console.log(`   → ${numbers.data[0]?.number || 'Your 46elks number'}`);
  console.log('');
  console.log('2. 46elks hits your webhook');
  console.log(`   → ${webhookUrl}`);
  console.log('');
  console.log('3. Your webhook tells 46elks to connect to Vapi');
  console.log(`   → ${envVars.VAPI_PHONE_NUMBER}`);
  console.log('');
  console.log('4. Vapi AI assistant handles the call');
  console.log('');
  console.log('5. When call ends, Vapi sends webhook to you');
  console.log(`   → ${productionUrl}/api/webhook/vapi`);
  console.log('');
  console.log('6. You store transcript and send notifications');
  console.log('━'.repeat(60));

  console.log('\n🧪 TESTING:\n');
  console.log(`Call this number to test: ${numbers.data[0]?.number || 'Your 46elks number'}`);
  console.log('You should hear the AI assistant answer!\n');

  console.log('🔍 MONITORING:\n');
  console.log('- Check Vercel logs for webhook calls');
  console.log('- Check 46elks dashboard for call logs');
  console.log('- Check Vapi dashboard for assistant logs');
  console.log('- Check Supabase for stored call records\n');

  rl.close();
}

setup().catch(err => {
  console.error('❌ Error:', err.message);
  rl.close();
  process.exit(1);
});
