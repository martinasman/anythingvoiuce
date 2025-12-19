#!/usr/bin/env node
/**
 * Debug the call flow to find why calls return "busy"
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function debug() {
  console.log('🔍 Debugging Call Flow\n');
  console.log('='.repeat(60));

  // 1. Check environment variables
  console.log('\n1️⃣ Environment Variables:\n');
  console.log(`   VAPI_PHONE_NUMBER: ${envVars.VAPI_PHONE_NUMBER || '❌ NOT SET'}`);
  console.log(`   VAPI_PHONE_NUMBER_ID: ${envVars.VAPI_PHONE_NUMBER_ID || '❌ NOT SET'}`);
  console.log(`   DEV_ELKS_PHONE_NUMBER: ${envVars.DEV_ELKS_PHONE_NUMBER || '❌ NOT SET'}`);
  console.log(`   NEXT_PUBLIC_APP_URL: ${envVars.NEXT_PUBLIC_APP_URL || '❌ NOT SET'}`);

  // Check for space in Vapi number
  if (envVars.VAPI_PHONE_NUMBER && envVars.VAPI_PHONE_NUMBER.includes(' ')) {
    console.log('\n   ⚠️ WARNING: VAPI_PHONE_NUMBER contains a space! This will cause calls to fail.');
  }

  // 2. Check phone_numbers table
  console.log('\n2️⃣ Phone Numbers in Database:\n');
  const { data: phoneNumbers, error: phoneError } = await supabase
    .from('phone_numbers')
    .select(`
      id,
      phone_number,
      phone_number_display,
      status,
      customer_id,
      business_id,
      vapi_phone_number,
      vapi_phone_number_id,
      provider,
      provider_number_id
    `)
    .order('created_at', { ascending: false });

  if (phoneError) {
    console.log(`   ❌ Error fetching phone numbers: ${phoneError.message}`);
  } else if (!phoneNumbers || phoneNumbers.length === 0) {
    console.log('   ❌ No phone numbers found in database!');
    console.log('   → You need to activate a customer first');
  } else {
    console.log(`   Found ${phoneNumbers.length} phone number(s):\n`);
    for (const phone of phoneNumbers) {
      console.log(`   📱 ${phone.phone_number} (${phone.phone_number_display || 'no display'})`);
      console.log(`      Status: ${phone.status}`);
      console.log(`      Provider: ${phone.provider}`);
      console.log(`      Business ID: ${phone.business_id || 'NOT LINKED'}`);
      console.log(`      Customer ID: ${phone.customer_id || 'NOT LINKED'}`);
      console.log(`      Vapi Number: ${phone.vapi_phone_number || 'NOT SET'}`);
      console.log(`      Vapi ID: ${phone.vapi_phone_number_id || 'NOT SET'}`);

      // Check if vapi number has space
      if (phone.vapi_phone_number && phone.vapi_phone_number.includes(' ')) {
        console.log(`      ⚠️ WARNING: vapi_phone_number has a space!`);
      }

      // Check if it matches the expected 46elks number
      if (phone.phone_number === '+46850924581') {
        console.log(`      ✅ This is the dev 46elks number (0850-924 58 1)`);
      }
      console.log('');
    }
  }

  // 3. Check businesses table for active production
  console.log('\n3️⃣ Active Production Businesses:\n');
  const { data: businesses, error: bizError } = await supabase
    .from('businesses')
    .select(`
      id,
      name,
      is_production,
      vapi_assistant_id,
      customer_id
    `)
    .eq('is_production', true);

  if (bizError) {
    console.log(`   ❌ Error fetching businesses: ${bizError.message}`);
  } else if (!businesses || businesses.length === 0) {
    console.log('   ❌ No production businesses found!');
    console.log('   → Activate a business using the admin dashboard');
  } else {
    console.log(`   Found ${businesses.length} production business(es):\n`);
    for (const biz of businesses) {
      console.log(`   🏢 ${biz.name}`);
      console.log(`      ID: ${biz.id}`);
      console.log(`      Vapi Assistant: ${biz.vapi_assistant_id || '❌ NOT SET'}`);
      console.log(`      Customer ID: ${biz.customer_id || 'NOT SET'}`);
      console.log('');
    }
  }

  // 4. Simulate webhook lookup
  console.log('\n4️⃣ Simulating Webhook Lookup for +46850924581:\n');

  const { data: phoneForWebhook, error: webhookError } = await supabase
    .from('phone_numbers')
    .select(`
      id,
      customer_id,
      business_id,
      vapi_phone_number,
      vapi_phone_number_id
    `)
    .eq('phone_number', '+46850924581')
    .eq('status', 'active')
    .single();

  if (webhookError) {
    console.log(`   ❌ Phone number lookup FAILED: ${webhookError.message}`);
    console.log('   → This explains "busy" - webhook can\'t find the number!');
    console.log('\n   Possible fixes:');
    console.log('   1. Make sure DEV_ELKS_PHONE_NUMBER is set in Vercel');
    console.log('   2. Activate a business using admin dashboard');
    console.log('   3. Check that phone_number value matches exactly: +46850924581');
  } else {
    console.log(`   ✅ Found phone number record`);
    console.log(`      Business ID: ${phoneForWebhook.business_id}`);
    console.log(`      Vapi Number: ${phoneForWebhook.vapi_phone_number}`);

    if (!phoneForWebhook.business_id) {
      console.log('   ⚠️ WARNING: No business linked to this number!');
    }

    if (!phoneForWebhook.vapi_phone_number) {
      console.log('   ⚠️ WARNING: No Vapi phone number set!');
      console.log('   → Will fall back to VAPI_PHONE_NUMBER env var');
    }

    // Check business lookup
    if (phoneForWebhook.business_id) {
      const { data: biz, error: bizLookupError } = await supabase
        .from('businesses')
        .select('id, vapi_assistant_id, name')
        .eq('id', phoneForWebhook.business_id)
        .single();

      if (bizLookupError || !biz) {
        console.log(`\n   ❌ Business lookup FAILED: ${bizLookupError?.message}`);
      } else {
        console.log(`\n   ✅ Business found: ${biz.name}`);
        console.log(`      Vapi Assistant ID: ${biz.vapi_assistant_id || '❌ NOT SET'}`);

        if (!biz.vapi_assistant_id) {
          console.log('   ⚠️ WARNING: Business has no Vapi assistant!');
          console.log('   → This will cause the call to be rejected');
        }
      }
    }
  }

  // 5. Test the actual Vapi number format
  console.log('\n5️⃣ Vapi Number Verification:\n');

  const vapiNumber = phoneForWebhook?.vapi_phone_number || envVars.VAPI_PHONE_NUMBER;

  if (!vapiNumber) {
    console.log('   ❌ No Vapi phone number available anywhere!');
    console.log('   → Calls will fail because there\'s no number to connect to');
  } else {
    console.log(`   Vapi number to connect: ${vapiNumber}`);

    if (vapiNumber.includes(' ')) {
      console.log('   ❌ NUMBER HAS A SPACE - THIS IS THE PROBLEM!');
      console.log(`   → Current: "${vapiNumber}"`);
      console.log(`   → Should be: "${vapiNumber.replace(/\s/g, '')}"`);
    } else if (!/^\+1\d{10}$/.test(vapiNumber)) {
      console.log('   ⚠️ Number format looks unusual for US number');
      console.log('   → Expected format: +1XXXXXXXXXX (11 digits total)');
    } else {
      console.log('   ✅ Number format looks correct');
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 Summary:\n');

  const issues = [];

  if (!phoneForWebhook) {
    issues.push('Phone number +46850924581 not found in database');
  }
  if (phoneForWebhook && !phoneForWebhook.business_id) {
    issues.push('Phone number has no linked business');
  }
  if (vapiNumber && vapiNumber.includes(' ')) {
    issues.push('Vapi phone number contains a space');
  }
  if (!envVars.VAPI_PHONE_NUMBER) {
    issues.push('VAPI_PHONE_NUMBER env var not set');
  }

  if (issues.length === 0) {
    console.log('   ✅ Local configuration looks correct!\n');
    console.log('   If calls still fail, check:\n');
    console.log('   1. Are env vars set in Vercel? (not just local .env.local)');
    console.log('   2. Did you redeploy Vercel after adding env vars?');
    console.log('   3. Check Vercel logs for webhook errors');
    console.log('   4. Is the Vapi number +19459998113 actually active in Vapi?');
  } else {
    console.log('   ❌ Issues found:\n');
    issues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));
  }
}

debug().catch(console.error);
