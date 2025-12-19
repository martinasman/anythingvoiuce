#!/usr/bin/env node
/**
 * Update 46elks webhook URL for a phone number
 * Usage: node update-46elks-webhook.js <phone_number_id> <new_webhook_url>
 */

const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const ELKS_API_USERNAME = envVars.ELKS_API_USERNAME;
const ELKS_API_PASSWORD = envVars.ELKS_API_PASSWORD;

if (!ELKS_API_USERNAME || !ELKS_API_PASSWORD) {
  console.error('❌ 46elks credentials not found in .env.local');
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('Usage: node update-46elks-webhook.js <new_webhook_url>');
  console.log('Example: node update-46elks-webhook.js https://abc123.ngrok.io');
  process.exit(1);
}

const newWebhookUrl = args[0];

async function listAndUpdateNumbers() {
  const authHeader = 'Basic ' + Buffer.from(`${ELKS_API_USERNAME}:${ELKS_API_PASSWORD}`).toString('base64');

  // List all numbers
  console.log('📞 Fetching your 46elks numbers...\n');

  const listResponse = await fetch('https://api.46elks.com/a1/numbers', {
    headers: { 'Authorization': authHeader }
  });

  const numbers = await listResponse.json();

  if (!numbers.data || numbers.data.length === 0) {
    console.log('❌ No phone numbers found');
    return;
  }

  console.log(`Found ${numbers.data.length} number(s):\n`);

  for (const num of numbers.data) {
    console.log(`📱 ${num.number} (ID: ${num.id})`);
    console.log(`   Current webhook: ${num.voice_start || 'Not set'}`);
    console.log(`   Status: ${num.active}\n`);
  }

  // Update all active numbers
  console.log(`\n🔧 Updating webhook URL to: ${newWebhookUrl}/api/webhook/46elks\n`);

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
            voice_start: `${newWebhookUrl}/api/webhook/46elks`
          }).toString()
        });

        if (updateResponse.ok) {
          console.log(`✅ Updated ${num.number}`);
        } else {
          const error = await updateResponse.text();
          console.log(`❌ Failed to update ${num.number}: ${error}`);
        }
      } catch (error) {
        console.log(`❌ Error updating ${num.number}:`, error.message);
      }
    }
  }

  console.log('\n✅ Done! You can now test by calling the Swedish number.');
  console.log('\n📋 Call flow:');
  console.log('   1. Call Swedish number → 46elks');
  console.log('   2. 46elks → Your webhook');
  console.log('   3. Webhook → Connect to Vapi US number');
  console.log('   4. Vapi → AI handles the call');
}

listAndUpdateNumbers().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
