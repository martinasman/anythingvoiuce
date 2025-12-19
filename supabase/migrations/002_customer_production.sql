-- Customer Production Solution
-- Adds customers, phone numbers, production calls, usage tracking, and voice options

-- Enable UUID extension (in case not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- NEW ENUMS
-- ============================================

-- Subscription status for customers
CREATE TYPE subscription_status AS ENUM (
  'trial',
  'active',
  'paused',
  'cancelled'
);

-- Phone number status
CREATE TYPE phone_number_status AS ENUM (
  'pending',
  'active',
  'suspended',
  'released'
);

-- Phone provider
CREATE TYPE phone_provider AS ENUM (
  '46elks',
  'twilio',
  'vapi'
);

-- Call direction
CREATE TYPE call_direction AS ENUM (
  'inbound',
  'outbound'
);

-- Call sentiment
CREATE TYPE call_sentiment AS ENUM (
  'positive',
  'neutral',
  'negative'
);

-- ============================================
-- NEW TABLES
-- ============================================

-- Customers table - Business owners using our platform
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Auth & Identity
  email TEXT UNIQUE NOT NULL,
  auth_user_id UUID UNIQUE, -- Links to Supabase Auth

  -- Profile
  name TEXT,
  company_name TEXT,
  phone TEXT,
  whatsapp_phone TEXT, -- For notifications (E.164 format)

  -- Notification Preferences
  whatsapp_notifications_enabled BOOLEAN DEFAULT true,
  email_notifications_enabled BOOLEAN DEFAULT false,

  -- Subscription & Billing
  subscription_status subscription_status DEFAULT 'trial',
  subscription_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  stripe_customer_id TEXT, -- For future billing

  -- Settings
  timezone TEXT DEFAULT 'Europe/Stockholm',
  language TEXT DEFAULT 'sv'
);

-- Phone numbers table - Allocated phone numbers for customers
CREATE TABLE phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ownership
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,

  -- Phone Number Details
  phone_number TEXT UNIQUE NOT NULL, -- E.164 format: +46701234567
  phone_number_display TEXT, -- Human readable: 070-123 45 67
  country_code TEXT DEFAULT 'SE',

  -- Provider Info
  provider phone_provider NOT NULL DEFAULT '46elks',
  provider_number_id TEXT, -- External ID from provider
  provider_config JSONB DEFAULT '{}'::jsonb, -- SIP credentials, webhook URLs, etc.

  -- Status
  status phone_number_status DEFAULT 'pending',
  activated_at TIMESTAMPTZ,

  -- Monthly cost tracking (in cents/öre)
  monthly_cost_cents INTEGER DEFAULT 300 -- ~3 EUR default
);

-- Customer calls table - Production calls (not demos)
CREATE TABLE customer_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Relations
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  phone_number_id UUID REFERENCES phone_numbers(id) ON DELETE SET NULL,

  -- Call Details
  vapi_call_id TEXT UNIQUE,
  direction call_direction DEFAULT 'inbound',
  caller_phone TEXT,
  caller_name TEXT,

  -- Timing
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Content
  transcript JSONB DEFAULT '[]'::jsonb,
  summary TEXT,
  topic TEXT, -- AI-extracted topic
  sentiment call_sentiment DEFAULT 'neutral',

  -- AI Analysis
  action_items JSONB DEFAULT '[]'::jsonb,
  follow_up_required BOOLEAN DEFAULT false,

  -- Costs (in cents/öre)
  cost_cents INTEGER DEFAULT 0,

  -- Notification Status
  whatsapp_notified_at TIMESTAMPTZ,
  email_notified_at TIMESTAMPTZ
);

-- Usage records table - Monthly aggregates for billing
CREATE TABLE usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,

  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Metrics
  total_calls INTEGER DEFAULT 0,
  total_minutes INTEGER DEFAULT 0,
  total_cost_cents INTEGER DEFAULT 0,

  -- Breakdown
  vapi_cost_cents INTEGER DEFAULT 0,
  phone_cost_cents INTEGER DEFAULT 0,
  whatsapp_cost_cents INTEGER DEFAULT 0,

  UNIQUE(customer_id, period_start, period_end)
);

-- Voice options table - Curated list of available voices
CREATE TABLE voice_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Voice Details
  name TEXT NOT NULL,
  voice_id TEXT NOT NULL, -- ElevenLabs voice ID
  provider TEXT DEFAULT '11labs',

  -- Display
  display_name TEXT NOT NULL,
  description TEXT,
  preview_url TEXT, -- Audio sample URL

  -- Categorization
  gender TEXT, -- male, female, neutral
  accent TEXT, -- swedish, american, british
  tone TEXT, -- professional, friendly, warm

  -- Availability
  available_for_industries industry_type[] DEFAULT ARRAY[]::industry_type[],
  is_active BOOLEAN DEFAULT true,

  sort_order INTEGER DEFAULT 0
);

-- ============================================
-- MODIFY EXISTING TABLES
-- ============================================

-- Add customer relationship and production fields to businesses
ALTER TABLE businesses
ADD COLUMN customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
ADD COLUMN is_production BOOLEAN DEFAULT false,
ADD COLUMN production_enabled_at TIMESTAMPTZ,
ADD COLUMN voice_id TEXT,
ADD COLUMN custom_first_message TEXT,
ADD COLUMN custom_system_prompt TEXT;

-- Add call_type to distinguish demo vs production calls in existing table
ALTER TABLE call_transcripts
ADD COLUMN call_type TEXT DEFAULT 'demo',
ADD COLUMN customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

-- ============================================
-- INDEXES
-- ============================================

-- Customers
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_auth_user_id ON customers(auth_user_id);
CREATE INDEX idx_customers_subscription_status ON customers(subscription_status);

-- Phone numbers
CREATE INDEX idx_phone_numbers_customer_id ON phone_numbers(customer_id);
CREATE INDEX idx_phone_numbers_business_id ON phone_numbers(business_id);
CREATE INDEX idx_phone_numbers_phone_number ON phone_numbers(phone_number);
CREATE INDEX idx_phone_numbers_status ON phone_numbers(status);

-- Customer calls
CREATE INDEX idx_customer_calls_customer_id ON customer_calls(customer_id);
CREATE INDEX idx_customer_calls_business_id ON customer_calls(business_id);
CREATE INDEX idx_customer_calls_vapi_call_id ON customer_calls(vapi_call_id);
CREATE INDEX idx_customer_calls_created_at ON customer_calls(created_at DESC);
CREATE INDEX idx_customer_calls_started_at ON customer_calls(started_at DESC);

-- Usage records
CREATE INDEX idx_usage_records_customer_id ON usage_records(customer_id);
CREATE INDEX idx_usage_records_period ON usage_records(period_start, period_end);

-- Voice options
CREATE INDEX idx_voice_options_is_active ON voice_options(is_active);
CREATE INDEX idx_voice_options_sort_order ON voice_options(sort_order);

-- Businesses (new indexes)
CREATE INDEX idx_businesses_customer_id ON businesses(customer_id);
CREATE INDEX idx_businesses_is_production ON businesses(is_production);

-- ============================================
-- TRIGGERS
-- ============================================

-- Apply updated_at trigger to new tables
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_phone_numbers_updated_at
  BEFORE UPDATE ON phone_numbers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_options ENABLE ROW LEVEL SECURITY;

-- Service role policies (full access for backend)
CREATE POLICY "Service role has full access to customers"
  ON customers FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to phone_numbers"
  ON phone_numbers FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to customer_calls"
  ON customer_calls FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to usage_records"
  ON usage_records FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to voice_options"
  ON voice_options FOR ALL
  USING (true)
  WITH CHECK (true);

-- Customer-specific policies (for authenticated users)
CREATE POLICY "Customers can view own profile"
  ON customers FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Customers can update own profile"
  ON customers FOR UPDATE
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Customers can view own phone numbers"
  ON phone_numbers FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can view own calls"
  ON customer_calls FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can view own usage"
  ON usage_records FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can view own businesses"
  ON businesses FOR SELECT
  USING (
    customer_id IS NULL OR
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can update own businesses"
  ON businesses FOR UPDATE
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

-- Everyone can view active voice options
CREATE POLICY "Anyone can view active voice options"
  ON voice_options FOR SELECT
  USING (is_active = true);

-- ============================================
-- SEED DATA - Voice Options
-- ============================================

INSERT INTO voice_options (name, voice_id, display_name, description, gender, accent, tone, available_for_industries, sort_order) VALUES
('Roger', 'CwhRBWXzGAHq8TQ4Fs17', 'Roger', 'Varm och professionell manlig röst, perfekt för service och hantverk', 'male', 'swedish', 'professional', ARRAY['restaurant', 'contractor', 'auto']::industry_type[], 1),
('Sarah', 'EXAVITQu4vr4xnSDxMaL', 'Sarah', 'Vänlig och välkomnande kvinnlig röst, utmärkt för kundmottagning', 'female', 'swedish', 'friendly', ARRAY['salon', 'other']::industry_type[], 2),
('Charlotte', 'XB0fDUnXU5powFXDhCwa', 'Charlotte', 'Elegant och lugn kvinnlig röst, passar kliniker och mäklare', 'female', 'swedish', 'warm', ARRAY['clinic', 'realestate']::industry_type[], 3),
('Adam', '21m00Tcm4TlvDq8ikWAM', 'Adam', 'Tydlig och energisk manlig röst', 'male', 'american', 'professional', ARRAY['restaurant', 'contractor', 'auto', 'other']::industry_type[], 4),
('Nicole', 'piTKgcLEGmPE4e6mEKli', 'Nicole', 'Professionell och lugn kvinnlig röst', 'female', 'american', 'professional', ARRAY['clinic', 'realestate', 'salon']::industry_type[], 5);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE customers IS 'Business owners using the AI receptionist platform';
COMMENT ON TABLE phone_numbers IS 'Phone numbers allocated to customers via 46elks/Twilio';
COMMENT ON TABLE customer_calls IS 'Production inbound calls handled by AI receptionists';
COMMENT ON TABLE usage_records IS 'Monthly usage aggregates for billing purposes';
COMMENT ON TABLE voice_options IS 'Available ElevenLabs voices for customer selection';

COMMENT ON COLUMN customers.whatsapp_phone IS 'Phone number for WhatsApp notifications in E.164 format';
COMMENT ON COLUMN phone_numbers.provider_config IS 'Provider-specific config: SIP credentials, webhook URLs, etc.';
COMMENT ON COLUMN customer_calls.action_items IS 'AI-extracted action items from the call';
COMMENT ON COLUMN businesses.is_production IS 'True if this business has a production phone number and is live';
