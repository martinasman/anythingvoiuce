// ============================================
// ENUMS
// ============================================

export type IndustryType =
  | 'restaurant'
  | 'salon'
  | 'clinic'
  | 'contractor'
  | 'auto'
  | 'realestate'
  | 'moving'
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

export type SubscriptionStatus =
  | 'trial'
  | 'active'
  | 'paused'
  | 'cancelled'

export type PhoneNumberStatus =
  | 'pending'
  | 'active'
  | 'suspended'
  | 'released'

export type PhoneProvider =
  | '46elks'
  | 'twilio'
  | 'vapi'

export type CallDirection =
  | 'inbound'
  | 'outbound'

export type CallSentiment =
  | 'positive'
  | 'neutral'
  | 'negative'

// ============================================
// EXISTING TYPES (Extended)
// ============================================

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
  // Scraped data for better demos
  common_call_scenarios: string[] | null
  scrape_confidence: 'high' | 'medium' | 'low' | null
  unique_selling_point: string | null
  // New production fields
  customer_id: string | null
  is_production: boolean
  production_enabled_at: string | null
  voice_id: string | null
  custom_first_message: string | null
  custom_system_prompt: string | null
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
  // New fields
  call_type: 'demo' | 'production'
  customer_id: string | null
}

export interface TranscriptMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: number
}

// ============================================
// NEW TYPES
// ============================================

export interface Customer {
  id: string
  created_at: string
  updated_at: string
  email: string
  auth_user_id: string | null
  name: string | null
  company_name: string | null
  phone: string | null
  whatsapp_phone: string | null
  whatsapp_notifications_enabled: boolean
  email_notifications_enabled: boolean
  subscription_status: SubscriptionStatus
  subscription_started_at: string | null
  trial_ends_at: string | null
  stripe_customer_id: string | null
  timezone: string
  language: string
  // Telegram notifications
  telegram_chat_id: string | null
  telegram_notifications_enabled: boolean
}

export interface PhoneNumber {
  id: string
  created_at: string
  updated_at: string
  customer_id: string | null
  business_id: string | null
  phone_number: string
  phone_number_display: string | null
  country_code: string
  provider: PhoneProvider
  provider_number_id: string | null
  provider_config: Record<string, unknown>
  status: PhoneNumberStatus
  activated_at: string | null
  monthly_cost_cents: number
  // Vapi phone number (US) for call forwarding
  vapi_phone_number: string | null
  vapi_phone_number_id: string | null
}

export interface CustomerCall {
  id: string
  created_at: string
  customer_id: string | null
  business_id: string | null
  phone_number_id: string | null
  vapi_call_id: string | null
  provider_call_id: string | null // 46elks call ID
  direction: CallDirection
  caller_phone: string | null
  caller_name: string | null
  started_at: string | null
  ended_at: string | null
  duration_seconds: number | null
  transcript: TranscriptMessage[]
  summary: string | null
  topic: string | null
  sentiment: CallSentiment
  action_items: ActionItem[]
  follow_up_required: boolean
  cost_cents: number
  whatsapp_notified_at: string | null
  email_notified_at: string | null
  telegram_notified_at: string | null
}

export interface ActionItem {
  description: string
  priority?: 'high' | 'medium' | 'low'
  completed?: boolean
}

export interface UsageRecord {
  id: string
  created_at: string
  customer_id: string
  period_start: string
  period_end: string
  total_calls: number
  total_minutes: number
  total_cost_cents: number
  vapi_cost_cents: number
  phone_cost_cents: number
  whatsapp_cost_cents: number
}

export interface VoiceOption {
  id: string
  created_at: string
  name: string
  voice_id: string
  provider: string
  display_name: string
  description: string | null
  preview_url: string | null
  gender: 'male' | 'female' | 'neutral' | null
  accent: string | null
  tone: string | null
  available_for_industries: IndustryType[]
  is_active: boolean
  sort_order: number
}

// ============================================
// SUPABASE DATABASE TYPE
// ============================================

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: Business
        Insert: Partial<Omit<Business, 'id' | 'created_at' | 'updated_at'>> & { source_url: string }
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
      customers: {
        Row: Customer
        Insert: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>> & { email: string }
        Update: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>
      }
      phone_numbers: {
        Row: PhoneNumber
        Insert: Partial<Omit<PhoneNumber, 'id' | 'created_at' | 'updated_at'>> & { phone_number: string }
        Update: Partial<Omit<PhoneNumber, 'id' | 'created_at' | 'updated_at'>>
      }
      customer_calls: {
        Row: CustomerCall
        Insert: Partial<Omit<CustomerCall, 'id' | 'created_at'>>
        Update: Partial<Omit<CustomerCall, 'id' | 'created_at'>>
      }
      usage_records: {
        Row: UsageRecord
        Insert: Omit<UsageRecord, 'id' | 'created_at'>
        Update: Partial<Omit<UsageRecord, 'id' | 'created_at'>>
      }
      voice_options: {
        Row: VoiceOption
        Insert: Partial<Omit<VoiceOption, 'id' | 'created_at'>> & { name: string; voice_id: string; display_name: string }
        Update: Partial<Omit<VoiceOption, 'id' | 'created_at'>>
      }
    }
    Enums: {
      industry_type: IndustryType
      business_status: BusinessStatus
      subscription_status: SubscriptionStatus
      phone_number_status: PhoneNumberStatus
      phone_provider: PhoneProvider
      call_direction: CallDirection
      call_sentiment: CallSentiment
    }
  }
}

// ============================================
// HELPER TYPES
// ============================================

// Customer with related data
export interface CustomerWithBusinesses extends Customer {
  businesses: Business[]
}

// Business with customer and phone info
export interface BusinessWithRelations extends Business {
  customer: Customer | null
  phone_number: PhoneNumber | null
}

// Call with full context
export interface CustomerCallWithContext extends CustomerCall {
  business: Business | null
  phone_number: PhoneNumber | null
}

// Dashboard stats
export interface DashboardStats {
  totalCalls: number
  totalMinutes: number
  totalCostCents: number
  callsToday: number
  callsThisWeek: number
  callsThisMonth: number
  averageCallDuration: number
  followUpRequired: number
}

// Onboarding state
export interface OnboardingState {
  step: 'phone' | 'voice' | 'prompt' | 'whatsapp' | 'complete'
  customerId?: string
  businessId?: string
  phoneNumberId?: string
  selectedVoiceId?: string
  whatsappPhone?: string
}
