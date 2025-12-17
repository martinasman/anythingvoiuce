-- AI Voice Receptionist Outreach Pipeline
-- Initial Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Industry enum
CREATE TYPE industry_type AS ENUM (
  'restaurant',
  'salon',
  'clinic',
  'contractor',
  'auto',
  'realestate',
  'other'
);

-- Business status enum
CREATE TYPE business_status AS ENUM (
  'pending',
  'scraped',
  'agent_created',
  'email_sent',
  'interested',
  'contacted',
  'customer',
  'declined'
);

-- Businesses table - The companies we're targeting
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Source & Identity
  source_url TEXT NOT NULL,
  name TEXT,
  slug TEXT UNIQUE,

  -- Business Info
  industry industry_type DEFAULT 'other',
  description TEXT,
  services JSONB DEFAULT '[]'::jsonb,
  hours JSONB DEFAULT '{}'::jsonb,

  -- Contact Info
  address TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  booking_url TEXT,

  -- Vapi Integration
  vapi_assistant_id TEXT,
  agent_prompt TEXT,
  preview_url TEXT,

  -- Tracking Timestamps
  email_sent_at TIMESTAMPTZ,
  email_opened_at TIMESTAMPTZ,
  preview_viewed_at TIMESTAMPTZ,
  preview_call_started_at TIMESTAMPTZ,
  preview_call_duration_seconds INTEGER,
  cta_clicked_at TIMESTAMPTZ,

  -- Status & Contact Person
  status business_status DEFAULT 'pending',
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT
);

-- Lead events table - Activity log
CREATE TABLE lead_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Call transcripts table - What prospects said to the AI
CREATE TABLE call_transcripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  vapi_call_id TEXT UNIQUE,
  duration_seconds INTEGER,
  transcript JSONB DEFAULT '[]'::jsonb,
  summary TEXT
);

-- Indexes for performance
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_businesses_industry ON businesses(industry);
CREATE INDEX idx_businesses_created_at ON businesses(created_at DESC);
CREATE INDEX idx_businesses_cta_clicked_at ON businesses(cta_clicked_at DESC NULLS LAST);

CREATE INDEX idx_lead_events_business_id ON lead_events(business_id);
CREATE INDEX idx_lead_events_event_type ON lead_events(event_type);
CREATE INDEX idx_lead_events_created_at ON lead_events(created_at DESC);

CREATE INDEX idx_call_transcripts_business_id ON call_transcripts(business_id);
CREATE INDEX idx_call_transcripts_vapi_call_id ON call_transcripts(vapi_call_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to businesses table
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_transcripts ENABLE ROW LEVEL SECURITY;

-- Policies for service role (backend access with service_role key)
-- These allow full access when using the service role key
CREATE POLICY "Service role has full access to businesses"
  ON businesses FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to lead_events"
  ON lead_events FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to call_transcripts"
  ON call_transcripts FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE businesses IS 'Companies being targeted for AI voice receptionist outreach';
COMMENT ON TABLE lead_events IS 'Activity log tracking all interactions with leads';
COMMENT ON TABLE call_transcripts IS 'Transcripts from demo calls with prospects';
COMMENT ON COLUMN businesses.status IS 'Pipeline status: pending -> scraped -> agent_created -> email_sent -> interested -> contacted -> customer/declined';
