# Development Setup - Shared Phone Numbers

## Overview

For development/testing, we use **ONE set of shared phone numbers** that can be switched between different test customers. This prevents buying expensive numbers for every test.

## Configuration

### Required Environment Variables

Add these to your `.env.local` and production environment:

```bash
# Vapi US Number (shared for dev)
VAPI_PHONE_NUMBER=+19459998113
VAPI_PHONE_NUMBER_ID=50a328c2-c420-4e45-8b2c-6b90020bccbe

# 46elks Swedish Number (shared for dev)
DEV_ELKS_PHONE_NUMBER=+46850924581
DEV_ELKS_PHONE_NUMBER_ID=n0882c8d776f7c5a42b061f0ec6569f16

# Production URL
NEXT_PUBLIC_APP_URL=https://anythingvoice-dae5knnty-martinasman-1431s-projects.vercel.app
```

## How It Works

### Development Flow:

1. **Create demo business** in admin panel
2. **Click "Aktivera" button** on any business
3. **System uses shared numbers:**
   - Swedish number: 0850-924 58 1 (from `DEV_ELKS_PHONE_NUMBER`)
   - Vapi US number: +1945999 8113 (from `VAPI_PHONE_NUMBER`)
4. **Switch between customers:**
   - Activating a different business unlinks the previous one
   - The shared numbers now route to the new business
   - Only ONE business can be active at a time in dev

### Call Flow:

```
Customer calls: 0850-924 58 1
       ↓
    46elks receives call
       ↓
    Webhook: /api/webhook/46elks
       ↓
    Looks up which business owns this number
       ↓
    Returns: Connect to +19459998113
       ↓
    46elks forwards to Vapi
       ↓
    Vapi assistant (assigned to this business) answers
       ↓
    Call transcript sent to webhook
       ↓
    Stored in database with business_id
```

## Testing

### 1. Activate a Test Customer

In admin dashboard:
1. Find a business with an assistant created
2. Click **"Aktivera"**
3. Enter customer details:
   - Email: test@example.com
   - Name: Test Customer
   - WhatsApp/Telegram (optional)
4. Submit

### 2. Call the Number

Call: **0850-924 58 1**

Expected:
- AI assistant answers
- Conversation works
- Transcript saved to database

### 3. Check Database

```sql
-- See which business is currently active
SELECT
  b.name as business_name,
  c.email as customer_email,
  p.phone_number_display,
  p.vapi_phone_number
FROM phone_numbers p
JOIN businesses b ON b.id = p.business_id
JOIN customers c ON c.id = p.customer_id
WHERE p.status = 'active'
```

### 4. Switch to Different Customer

Simply click "Aktivera" on a different business. The system will:
- Unlink the shared number from the previous business
- Link it to the new business
- Update the assistant routing

## Production Behavior

When ready for real customers, we'll:

1. **Remove `DEV_ELKS_PHONE_NUMBER`** from environment
2. **Enable number allocation** in activate-production endpoint
3. **Each customer gets:**
   - Their own unique 46elks Swedish number
   - Their own unique Vapi US number (or SIP endpoint)
   - No sharing or switching needed

## Important Notes

⚠️ **Do NOT enable auto-allocation in dev!**
- Code currently disabled in `activate-production/route.ts`
- Prevents accidentally buying numbers
- Only re-enable when launching to production customers

✅ **Current State:**
- Auto-allocation: DISABLED ✓
- Using shared dev numbers ✓
- Can switch between test customers ✓
- No risk of buying extra numbers ✓

## Troubleshooting

### "No phone numbers available"

**Solution:** Set environment variables:
```bash
DEV_ELKS_PHONE_NUMBER=+46850924581
DEV_ELKS_PHONE_NUMBER_ID=n0882c8d776f7c5a42b061f0ec6569f16
```

### Call says "busy"

**Check:**
1. VAPI_PHONE_NUMBER has no spaces: `+19459998113` ✓
2. 46elks webhook is configured: Run `node update-46elks-webhook.js <url>`
3. Vapi assistant webhook configured: Run `node configure-vapi-webhook.js <url>`

### Wrong business answers

This means you need to switch which business is active:
1. Go to admin dashboard
2. Click "Aktivera" on the correct business
3. The shared numbers will now route to that business

## Scripts

```bash
# Configure 46elks webhook
node update-46elks-webhook.js https://your-url.com

# Configure Vapi webhooks
node configure-vapi-webhook.js https://your-url.com

# Check current phone number assignments
node check-phone-assignments.js
```
