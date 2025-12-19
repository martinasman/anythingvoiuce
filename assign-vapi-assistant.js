#!/usr/bin/env node
/**
 * Assign a Vapi assistant to the phone number
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

// Assistant ID for "Bröt Stockholm" (from database)
const ASSISTANT_ID = process.argv[2] || '4866c7b8-d32a-4079-812e-b142834cdcf0';

if (!VAPI_PRIVATE_KEY) {
  console.error('❌ VAPI_PRIVATE_KEY not found');
  process.exit(1);
}

async function assignAssistant() {
  console.log('🔧 Assigning Vapi Assistant to Phone Number\n');
  console.log(`Phone Number ID: ${VAPI_PHONE_NUMBER_ID}`);
  console.log(`Assistant ID: ${ASSISTANT_ID}\n`);

  try {
    const response = await fetch(`https://api.vapi.ai/phone-number/${VAPI_PHONE_NUMBER_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistantId: ASSISTANT_ID
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.log(`❌ Failed to assign assistant: ${error}`);
      return;
    }

    const data = await response.json();
    console.log('✅ Successfully assigned assistant!\n');
    console.log('Phone Number Details:');
    console.log(`   Number: ${data.number || data.phoneNumber}`);
    console.log(`   Assistant ID: ${data.assistantId}`);
    console.log(`   Status: ${data.status || 'active'}`);

    console.log('\n🎉 The phone number should now answer calls with the AI assistant!');
    console.log('\nTry calling: 0850-924 58 1');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

assignAssistant();
