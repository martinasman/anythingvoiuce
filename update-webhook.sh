#!/bin/bash
# Quick webhook update script
# Usage: ./update-webhook.sh https://your-production-url.com

if [ -z "$1" ]; then
  echo "Usage: ./update-webhook.sh https://your-production-url.com"
  exit 1
fi

PRODUCTION_URL="$1"
WEBHOOK_URL="${PRODUCTION_URL}/api/webhook/46elks"

# Load credentials from .env.local
source <(grep ELKS_API .env.local | xargs)

echo "📞 Updating 46elks webhook..."
echo "New webhook URL: $WEBHOOK_URL"
echo ""

# Get all numbers
NUMBERS=$(curl -s -u "$ELKS_API_USERNAME:$ELKS_API_PASSWORD" \
  https://api.46elks.com/a1/numbers)

echo "Your 46elks numbers:"
echo "$NUMBERS" | grep -o '"number":"[^"]*"' | sed 's/"number":"//g' | sed 's/"//g'
echo ""

# Update each active number
echo "$NUMBERS" | grep -o '"id":"[^"]*"' | sed 's/"id":"//g' | sed 's/"//g' | while read -r number_id; do
  echo "Updating number ID: $number_id"

  curl -s -u "$ELKS_API_USERNAME:$ELKS_API_PASSWORD" \
    -X POST \
    -d "voice_start=$WEBHOOK_URL" \
    "https://api.46elks.com/a1/numbers/$number_id" > /dev/null

  echo "✅ Updated!"
done

echo ""
echo "✅ Done! Call flow is now:"
echo "1. Call Swedish number → 46elks"
echo "2. 46elks → $WEBHOOK_URL"
echo "3. Webhook → Connect to Vapi +1945999 8113"
echo "4. Vapi → AI handles call"
