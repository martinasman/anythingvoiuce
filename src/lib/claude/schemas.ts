import { z } from 'zod'

export const IndustrySchema = z.enum([
  'restaurant',
  'salon',
  'clinic',
  'contractor',
  'auto',
  'realestate',
  'other',
])

export const BusinessHoursSchema = z.object({
  monday: z.string().optional(),
  tuesday: z.string().optional(),
  wednesday: z.string().optional(),
  thursday: z.string().optional(),
  friday: z.string().optional(),
  saturday: z.string().optional(),
  sunday: z.string().optional(),
})

export const ServiceSchema = z.object({
  name: z.string(),
  description: z.string().optional().nullable(),
  price: z.string().optional().nullable(),
})

export const FAQSchema = z.object({
  question: z.string(),
  answer: z.string(),
})

export const ExtractedBusinessDataSchema = z.object({
  name: z.string(),
  industry: IndustrySchema,
  description: z.string().nullable(),
  services: z.array(ServiceSchema).optional().nullable(),
  hours: BusinessHoursSchema.optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  booking_url: z.string().optional().nullable(),
  faqs: z.array(FAQSchema).optional(),
  tone: z.enum(['professional', 'friendly', 'casual', 'formal']).optional(),
  language: z.enum(['swedish', 'english', 'both']).optional(),
  contact_name: z.string().optional().nullable(),
  contact_email: z.string().optional().nullable(),
  contact_phone: z.string().optional().nullable(),
})

export type ExtractedBusinessData = z.infer<typeof ExtractedBusinessDataSchema>
export type Industry = z.infer<typeof IndustrySchema>
export type ServiceItem = z.infer<typeof ServiceSchema>
export type FAQ = z.infer<typeof FAQSchema>
