import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getSuggestedQuestions } from '@/lib/vapi/prompts'
import { DemoContent } from './demo-content'
import type { Industry } from '@/lib/claude/schemas'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function DemoPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  // Fetch business by slug
  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !business || !business.vapi_assistant_id) {
    notFound()
  }

  // Track preview view
  await supabase
    .from('businesses')
    .update({ preview_viewed_at: new Date().toISOString() })
    .eq('id', business.id)

  await supabase.from('lead_events').insert({
    business_id: business.id,
    event_type: 'preview_viewed',
    metadata: { timestamp: new Date().toISOString() },
  })

  const suggestedQuestions = getSuggestedQuestions(business.industry as Industry)

  return (
    <DemoContent
      business={{
        id: business.id,
        name: business.name || 'Unnamed Business',
        description: business.description || '',
        industry: business.industry as Industry,
        vapi_assistant_id: business.vapi_assistant_id,
      }}
      suggestedQuestions={suggestedQuestions}
    />
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('name, description')
    .eq('slug', slug)
    .single()

  if (!business) {
    return {
      title: 'Demo - AI Receptionist',
    }
  }

  return {
    title: `${business.name} - AI Receptionist Demo`,
    description: business.description || `Try the AI receptionist demo for ${business.name}`,
  }
}
