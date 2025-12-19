#!/usr/bin/env node
/**
 * Configure Vapi Assistant Server URL via API
 * This sets where Vapi sends webhook events (end-of-call reports)
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
const PRODUCTION_URL = process.argv[2];

if (!VAPI_PRIVATE_KEY) {
  console.error('❌ VAPI_PRIVATE_KEY not found in .env.local');
  process.exit(1);
}

if (!PRODUCTION_URL) {
  console.log('Usage: node configure-vapi-webhook.js https://your-production-url.com');
  process.exit(1);
}

async function configureVapi() {
  const serverUrl = `${PRODUCTION_URL}/api/webhook/vapi`;

  console.log('🔧 Configuring Vapi Webhook\n');
  console.log(`Server URL: ${serverUrl}\n`);

  try {
    // First, get all assistants
    console.log('📋 Fetching assistants...\n');

    const listResponse = await fetch('https://api.vapi.ai/assistant', {
      headers: {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
      }
    });

    if (!listResponse.ok) {
      const error = await listResponse.text();
      console.error('❌ Failed to fetch assistants:', error);
      process.exit(1);
    }

    const assistants = await listResponse.json();

    if (!assistants || assistants.length === 0) {
      console.log('❌ No assistants found in your Vapi account');
      console.log('   Create an assistant at https://vapi.ai/dashboard');
      process.exit(1);
    }

    console.log(`Found ${assistants.length} assistant(s):\n`);

    for (const assistant of assistants) {
      console.log(`📱 ${assistant.name || 'Unnamed Assistant'}`);
      console.log(`   ID: ${assistant.id}`);
      console.log(`   Current Server URL: ${assistant.serverUrl || 'Not set'}\n`);
    }

    // Update each assistant
    console.log(`\n🔄 Updating all assistants with new webhook URL...\n`);

    for (const assistant of assistants) {
      try {
        const updateResponse = await fetch(`https://api.vapi.ai/assistant/${assistant.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serverUrl: serverUrl
          })
        });

        if (updateResponse.ok) {
          console.log(`✅ Updated: ${assistant.name || assistant.id}`);
        } else {
          const error = await updateResponse.text();
          console.log(`❌ Failed to update ${assistant.name || assistant.id}: ${error}`);
        }
      } catch (error) {
        console.log(`❌ Error updating ${assistant.name || assistant.id}:`, error.message);
      }
    }

    console.log('\n✅ Vapi configuration complete!\n');
    console.log('📋 Webhook Events:');
    console.log('   - status-update: Call status changes');
    console.log('   - end-of-call-report: Transcript and summary');
    console.log('   - transcript: Real-time transcript updates\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

configureVapi();
