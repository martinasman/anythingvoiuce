export type IndustryType =
  | 'restaurant'
  | 'salon'
  | 'clinic'
  | 'contractor'
  | 'auto'
  | 'realestate'
  | 'other'

export type BusinessStatus =
  | 'pending'
  | 'scraped'
  | 'agent_created'
  | 'email_sent'
  | 'interested'
  | 'contacted'
  | 'customer'
  | 'declined'

export interface Business {
  id: string
  created_at: string
  updated_at: string
  source_url: string
  name: string | null
  slug: string | null
  industry: IndustryType
  description: string | null
  services: ServiceItem[]
  hours: BusinessHours
  address: string | null
  city: string | null
  phone: string | null
  email: string | null
  website: string | null
  booking_url: string | null
  vapi_assistant_id: string | null
  agent_prompt: string | null
  preview_url: string | null
  email_sent_at: string | null
  email_opened_at: string | null
  preview_viewed_at: string | null
  preview_call_started_at: string | null
  preview_call_duration_seconds: number | null
  cta_clicked_at: string | null
  status: BusinessStatus
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  email_tracking_token: string | null
}

export interface ServiceItem {
  name: string
  description?: string
  price?: string
}

export interface BusinessHours {
  monday?: string
  tuesday?: string
  wednesday?: string
  thursday?: string
  friday?: string
  saturday?: string
  sunday?: string
}

export interface LeadEvent {
  id: string
  created_at: string
  business_id: string
  event_type: string
  metadata: Record<string, unknown>
}

export interface CallTranscript {
  id: string
  created_at: string
  business_id: string
  vapi_call_id: string
  duration_seconds: number | null
  transcript: TranscriptMessage[]
  summary: string | null
}

export interface TranscriptMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: number
}

// Supabase Database type for type-safe queries
export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: Business
        Insert: Omit<Business, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Business, 'id' | 'created_at' | 'updated_at'>>
      }
      lead_events: {
        Row: LeadEvent
        Insert: Omit<LeadEvent, 'id' | 'created_at'>
        Update: Partial<Omit<LeadEvent, 'id' | 'created_at'>>
      }
      call_transcripts: {
        Row: CallTranscript
        Insert: Omit<CallTranscript, 'id' | 'created_at'>
        Update: Partial<Omit<CallTranscript, 'id' | 'created_at'>>
      }
    }
    Enums: {
      industry_type: IndustryType
      business_status: BusinessStatus
    }
  }
}
