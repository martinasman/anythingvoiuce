# Production Setup Checklist

## 🎯 Goal
Connect Swedish 46elks number → Vapi US number → AI Assistant

## ✅ Prerequisites

- [x] Vapi US number: `+1945999 8113`
- [x] Vapi number ID: `50a328c2-c420-4e45-8b2c-6b90020bccbe`
- [x] 46elks Swedish number: `0850-924 58 1`
- [x] App deployed to production
- [ ] Production URL: `_______________` (fill this in)

## 📋 Setup Steps

### 1. Configure Production Environment Variables

In your Vercel/hosting dashboard, set these environment variables:

```bash
# App URL (CRITICAL - this is where webhooks will be sent)
NEXT_PUBLIC_APP_URL=https://your-production-url.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://wjvljktmtsnpkeyedarn.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Vapi
VAPI_PHONE_NUMBER=+1945999 8113
VAPI_PHONE_NUMBER_ID=50a328c2-c420-4e45-8b2c-6b90020bccbe
VAPI_PRIVATE_KEY=7bf23851-9fe5-4477-a98c-f29554be3c4a
NEXT_PUBLIC_VAPI_PUBLIC_KEY=412d6ce7-b900-4d72-ae31-06d5f1cb7774

# 46elks
ELKS_API_USERNAME=u0be45692e23b6895d6209d2c6405ea36
ELKS_API_PASSWORD=28C6B6A6523675B227FE5BFF4D64A1E8

# Optional: Telegram
TELEGRAM_BOT_TOKEN=_____ (if using Telegram notifications)
```

After setting, **redeploy** your app!

### 2. Configure 46elks Webhook

Run the setup script:
```bash
node setup-production.js
```

Or manually configure at https://46elks.com/account:
- Go to your phone number settings
- Set `voice_start` to: `https://your-production-url.com/api/webhook/46elks`

### 3. Configure Vapi Assistant

In Vapi dashboard (https://vapi.ai):

1. Go to your assistant settings
2. Set **Server URL** to: `https://your-production-url.com/api/webhook/vapi`
3. Ensure the assistant is assigned to phone number `+1945999 8113`

### 4. Test the Connection

**Call the Swedish number:** `0850-924 58 1`

Expected behavior:
1. Call connects immediately
2. You hear the AI assistant greeting
3. You can have a conversation
4. After hanging up, check Supabase `customer_calls` table for the transcript

## 🔍 Troubleshooting

### Call doesn't connect
- Check Vercel logs for `/api/webhook/46elks` - should see incoming request
- Verify `NEXT_PUBLIC_APP_URL` is set correctly in production
- Check 46elks dashboard for webhook configuration

### Call connects but no AI
- Check that Vapi number `+1945999 8113` is correctly assigned to assistant
- Verify VAPI_PHONE_NUMBER environment variable in production
- Check Vapi dashboard for call logs

### Call works but no transcript saved
- Check Vercel logs for `/api/webhook/vapi` - should see end-of-call webhook
- Verify Supabase credentials in production environment
- Check `customer_calls` table in Supabase dashboard

### No notifications received
- Verify customer has `telegram_chat_id` or `whatsapp_phone` set
- Check `telegram_notifications_enabled` or `whatsapp_notifications_enabled` is true
- Set `TELEGRAM_BOT_TOKEN` in production environment

## 📊 Monitoring

### Vercel/Hosting Logs
```bash
vercel logs --follow
```

Check for:
- `[46elks] Connecting to Vapi phone: +1945999 8113`
- `[Vapi] End-of-call report received`

### 46elks Dashboard
https://46elks.com/account
- View call history
- Check call durations
- Monitor costs

### Vapi Dashboard
https://vapi.ai
- View call transcripts
- Monitor assistant performance
- Check usage

### Supabase Dashboard
- `customer_calls` table - all production calls
- `phone_numbers` table - allocated numbers
- `customers` table - customer settings

## 🚀 Call Flow Diagram

```
[Customer]
    ↓
    ↓ Dials: 0850-924 58 1
    ↓
[46elks Swedish Number]
    ↓
    ↓ HTTP POST
    ↓
[Your App: /api/webhook/46elks]
    ↓
    ↓ Returns: { connect: "+1945999 8113" }
    ↓
[46elks forwards call]
    ↓
    ↓ SIP/Phone connection
    ↓
[Vapi US Number: +1945999 8113]
    ↓
    ↓ AI Assistant handles conversation
    ↓
[Call ends]
    ↓
    ↓ HTTP POST (end-of-call-report)
    ↓
[Your App: /api/webhook/vapi]
    ↓
    ↓ Stores transcript, sends notifications
    ↓
[Supabase + Telegram/WhatsApp]
```

## 💰 Cost Breakdown

Per call (example: 3 minutes):

| Service | Cost |
|---------|------|
| 46elks number (monthly) | ~3 SEK |
| 46elks incoming call | ~0.10 SEK/min |
| 46elks outgoing to US | ~0.50 SEK/min |
| Vapi AI call | ~$0.12/min |
| **Total (3 min)** | ~**$0.36 + 5 SEK** |

## ✅ Success Criteria

- [ ] Call 0850-924 58 1 and hear AI assistant
- [ ] Have a short conversation
- [ ] Hang up and check Supabase for transcript
- [ ] (Optional) Receive Telegram notification

When all checked, you're ready for customers! 🎉
