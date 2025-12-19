-- Add email tracking token to businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS email_tracking_token UUID DEFAULT uuid_generate_v4();

-- Create index for fast lookups by tracking token
CREATE INDEX IF NOT EXISTS idx_businesses_email_tracking_token ON businesses(email_tracking_token);

-- Add comment for documentation
COMMENT ON COLUMN businesses.email_tracking_token IS 'Unique token for tracking email opens and clicks';
