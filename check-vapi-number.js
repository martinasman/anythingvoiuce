#!/usr/bin/env node
/**
 * Check if Vapi phone number is properly configured
 */

const fs = require('fs');
const path = require('path');

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

const VAPI_PRIVATE_KEY = envVars.VAPI_PRIVATE_KEY;
const VAPI_PHONE_NUMBER_ID = envVars.VAPI_PHONE_NUMBER_ID;

if (!VAPI_PRIVATE_KEY) {
  console.error('❌ VAPI_PRIVATE_KEY not found');
  process.exit(1);
}

async function checkVapiNumber() {
  console.log('🔍 Checking Vapi Phone Number Configuration\n');

  try {
    // Get phone number details
    console.log('📞 Fetching phone number details...\n');

    const phoneResponse = await fetch(`https://api.vapi.ai/phone-number/${VAPI_PHONE_NUMBER_ID}`, {
      headers: {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
      }
    });

    if (!phoneResponse.ok) {
      const error = await phoneResponse.text();
      console.log(`❌ Failed to fetch phone number: ${error}`);

      // Try listing all phone numbers
      console.log('\n📋 Listing all phone numbers instead...\n');

      const listResponse = await fetch('https://api.vapi.ai/phone-number', {
        headers: {
          'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
        }
      });

      if (listResponse.ok) {
        const numbers = await listResponse.json();
        console.log(`Found ${numbers.length} phone number(s):\n`);
        numbers.forEach(num => {
          console.log(`📱 ${num.number || num.phoneNumber}`);
          console.log(`   ID: ${num.id}`);
          console.log(`   Provider: ${num.provider}`);
          console.log(`   Assistant ID: ${num.assistantId || 'NOT ASSIGNED'}`);
          console.log(`   Status: ${num.status || 'unknown'}`);
          console.log('');
        });
      }
      return;
    }

    const phoneData = await phoneResponse.json();
    console.log('Phone Number Details:');
    console.log(`   Number: ${phoneData.number || phoneData.phoneNumber}`);
    console.log(`   ID: ${phoneData.id}`);
    console.log(`   Provider: ${phoneData.provider}`);
    console.log(`   Assistant ID: ${phoneData.assistantId || '❌ NOT ASSIGNED'}`);
    console.log(`   Status: ${phoneData.status || 'unknown'}`);

    if (!phoneData.assistantId) {
      console.log('\n⚠️ WARNING: Phone number has no assistant assigned!');
      console.log('   Calls to this number will fail because there\'s no AI to answer.');
      console.log('\n   To fix: Go to Vapi dashboard → Phone Numbers → Assign an assistant');
    }

    // If assistant is assigned, get assistant details
    if (phoneData.assistantId) {
      console.log('\n📤 Fetching assistant details...\n');

      const assistantResponse = await fetch(`https://api.vapi.ai/assistant/${phoneData.assistantId}`, {
        headers: {
          'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
        }
      });

      if (assistantResponse.ok) {
        const assistant = await assistantResponse.json();
        console.log('Assistant Details:');
        console.log(`   Name: ${assistant.name}`);
        console.log(`   ID: ${assistant.id}`);
        console.log(`   Server URL: ${assistant.serverUrl || 'NOT SET'}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkVapiNumber();
