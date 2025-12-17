interface SlackBlock {
  type: string
  text?: {
    type: string
    text: string
    emoji?: boolean
  }
  fields?: Array<{
    type: string
    text: string
  }>
  elements?: Array<{
    type: string
    text?: {
      type: string
      text: string
      emoji?: boolean
    }
    url?: string
    action_id?: string
  }>
}

interface LeadNotification {
  businessName: string
  businessId: string
  industry: string
  city?: string | null
  phone?: string | null
  email?: string | null
  previewUrl?: string | null
  callDuration?: number | null
}

export async function notifySlackNewLead(lead: LeadNotification): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn('SLACK_WEBHOOK_URL not configured, skipping notification')
    return false
  }

  const industryEmoji: Record<string, string> = {
    restaurant: '🍽️',
    salon: '💇',
    clinic: '🏥',
    contractor: '🔧',
    auto: '🚗',
    realestate: '🏠',
    other: '🏢',
  }

  const emoji = industryEmoji[lead.industry] || '🏢'

  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🔥 NY INTRESSERAD LEAD!',
        emoji: true,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Företag:*\n${lead.businessName}`,
        },
        {
          type: 'mrkdwn',
          text: `*Bransch:*\n${emoji} ${lead.industry}`,
        },
        {
          type: 'mrkdwn',
          text: `*Stad:*\n${lead.city || 'Ej angiven'}`,
        },
        {
          type: 'mrkdwn',
          text: `*Telefon:*\n${lead.phone || 'Ej angiven'}`,
        },
      ],
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Email:* ${lead.email || 'Ej angiven'}`,
      },
    },
  ]

  if (lead.callDuration) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Samtalstid:* ${Math.floor(lead.callDuration / 60)}m ${lead.callDuration % 60}s`,
      },
    })
  }

  if (lead.previewUrl) {
    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '🎧 Öppna demo-sidan',
            emoji: true,
          },
          url: lead.previewUrl,
          action_id: 'open_preview',
        },
      ],
    })
  }

  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: '📞 *Ring dem NU!*',
    },
  })

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    })

    if (!response.ok) {
      console.error('Slack webhook failed:', response.status, await response.text())
      return false
    }

    return true
  } catch (error) {
    console.error('Slack notification error:', error)
    return false
  }
}

export async function notifySlackPipelineComplete(
  count: number,
  successCount: number,
  failureCount: number
): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL

  if (!webhookUrl) {
    return false
  }

  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '✅ Pipeline Batch Complete',
        emoji: true,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Total:*\n${count}`,
        },
        {
          type: 'mrkdwn',
          text: `*Success:*\n${successCount}`,
        },
        {
          type: 'mrkdwn',
          text: `*Failed:*\n${failureCount}`,
        },
        {
          type: 'mrkdwn',
          text: `*Rate:*\n${Math.round((successCount / count) * 100)}%`,
        },
      ],
    },
  ]

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    })

    return response.ok
  } catch (error) {
    console.error('Slack notification error:', error)
    return false
  }
}
