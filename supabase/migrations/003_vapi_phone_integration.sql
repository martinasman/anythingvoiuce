-- Vapi Phone Integration
-- Adds columns to support 46elks -> Vapi US number forwarding

-- Add Vapi phone number columns to phone_numbers table
-- This stores the US Vapi number that 46elks will forward calls to
ALTER TABLE phone_numbers
ADD COLUMN IF NOT EXISTS vapi_phone_number TEXT, -- Vapi US phone number (E.164)
ADD COLUMN IF NOT EXISTS vapi_phone_number_id TEXT; -- Vapi phone number ID for API calls

-- Add provider_call_id to customer_calls for linking 46elks calls
ALTER TABLE customer_calls
ADD COLUMN IF NOT EXISTS provider_call_id TEXT; -- External call ID from 46elks/Twilio

-- Add Telegram notification columns to customers
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT, -- Telegram chat ID for notifications
ADD COLUMN IF NOT EXISTS telegram_notifications_enabled BOOLEAN DEFAULT false;

-- Add Telegram notification timestamp to customer_calls
ALTER TABLE customer_calls
ADD COLUMN IF NOT EXISTS telegram_notified_at TIMESTAMPTZ;

-- Index for faster lookup by provider call ID
CREATE INDEX IF NOT EXISTS idx_customer_calls_provider_call_id ON customer_calls(provider_call_id);

-- Comments
COMMENT ON COLUMN phone_numbers.vapi_phone_number IS 'US Vapi phone number that receives forwarded calls from 46elks';
COMMENT ON COLUMN phone_numbers.vapi_phone_number_id IS 'Vapi API phone number ID for managing the number';
COMMENT ON COLUMN customer_calls.provider_call_id IS 'External call ID from the phone provider (46elks callid)';
COMMENT ON COLUMN customers.telegram_chat_id IS 'Telegram chat ID for receiving call notifications';
