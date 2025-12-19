# 🚀 Quick Start - Development Testing

## Setup (One-time)

### 1. Add Environment Variables to Vercel

Go to Vercel → Project Settings → Environment Variables and add:

```bash
# Shared dev numbers (won't buy new ones)
VAPI_PHONE_NUMBER=+19459998113
VAPI_PHONE_NUMBER_ID=50a328c2-c420-4e45-8b2c-6b90020bccbe
DEV_ELKS_PHONE_NUMBER=+46850924581
DEV_ELKS_PHONE_NUMBER_ID=n0882c8d776f7c5a42b061f0ec6569f16

# Production URL
NEXT_PUBLIC_APP_URL=https://anythingvoice-dae5knnty-martinasman-1431s-projects.vercel.app

# Existing vars (keep these)
ELKS_API_USERNAME=u0be45692e23b6895d6209d2c6405ea36
ELKS_API_PASSWORD=28C6B6A6523675B227FE5BFF4D64A1E8
NEXT_PUBLIC_SUPABASE_URL=https://wjvljktmtsnpkeyedarn.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key-here
VAPI_PRIVATE_KEY=7bf23851-9fe5-4477-a98c-f29554be3c4a
# ... etc
```

**IMPORTANT:** After adding, click "Redeploy" in Vercel!

### 2. Fix Phone Number Format (Critical!)

In Vercel environment variables, make sure `VAPI_PHONE_NUMBER` has **NO SPACE**:

❌ Wrong: `VAPI_PHONE_NUMBER=+1945999 8113`
✅ Correct: `VAPI_PHONE_NUMBER=+19459998113`

### 3. Webhooks Already Configured ✓

These are already done:
- ✅ 46elks webhook → Your Vercel URL
- ✅ Vapi assistant webhook → Your Vercel URL

## Testing (Daily Workflow)

### 1. Open Admin Dashboard

Visit: `https://your-vercel-url.com/admin/leads`

### 2. Activate a Business

1. Find any business with "Agent skapad" status
2. Click **"Aktivera"** button
3. Fill in test customer info:
   ```
   Email: test@example.com
   Name: Test Customer
   WhatsApp: (optional)
   Telegram: (optional)
   ```
4. Click submit

**Result:** Business is now linked to the shared dev phone number!

### 3. Test the Call

Call the Swedish number: **0850-924 58 1**

Expected behavior:
- ✅ Call connects in 2-3 seconds
- ✅ AI assistant greets you
- ✅ You can have a conversation
- ✅ Transcript saved after hanging up

### 4. Switch to Different Business

Simply click "Aktivera" on another business!

The system will:
- Unlink the first business
- Link the new business
- Same phone number now routes to new assistant

## Checking Results

### View Call Logs in Supabase

1. Go to Supabase dashboard
2. Open `customer_calls` table
3. See transcripts and summaries

### View in Vapi Dashboard

1. Go to https://vapi.ai/dashboard
2. Check call logs
3. See real-time transcripts

## Common Issues

### "Number Busy"

**Fix:**
1. Check VAPI_PHONE_NUMBER has no space (see setup step 2)
2. Redeploy Vercel after fixing
3. Try calling again

### "No Phone Numbers Available"

**Fix:**
1. Add `DEV_ELKS_PHONE_NUMBER` to Vercel env vars
2. Redeploy
3. Try activating again

### Wrong Business Answers

This is normal! You need to switch which business is active:
1. Click "Aktivera" on the correct business
2. The shared number will now route there

## Current Shared Numbers

**Swedish (46elks):** 0850-924 58 1
- This is the number customers call
- Configured to forward to your webhook
- Then connects to Vapi US number

**US (Vapi):** +1 (945) 999-8113
- Receives forwarded calls from 46elks
- Runs the AI assistant
- Sends transcripts back to you

## Cost Savings

✅ **Development (Now):**
- 1 Swedish number: ~3 EUR/month
- 1 Vapi US number: ~$1/month
- **Total: ~$5/month** for unlimited testing

❌ **Without This System:**
- Would buy new numbers for each test
- 10 tests = 10 × $5 = $50/month
- 100 tests = $500/month 😱

## When Ready for Production

See [DEV-SETUP.md](./DEV-SETUP.md) for switching to per-customer numbers.

Quick summary:
1. Remove `DEV_ELKS_PHONE_NUMBER` from environment
2. Enable number allocation code
3. Each customer gets unique numbers automatically

---

**Need help?** Check:
- [DEV-SETUP.md](./DEV-SETUP.md) - Detailed development guide
- [FIX-BUSY-NUMBER.md](./FIX-BUSY-NUMBER.md) - Troubleshooting busy signal
- [PRODUCTION-SETUP.md](./PRODUCTION-SETUP.md) - Full production setup
