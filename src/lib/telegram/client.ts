/**
 * Telegram Bot API Client
 *
 * Sends call notifications to customers via Telegram.
 * Set up your bot at https://t.me/BotFather
 */

interface TelegramResponse {
  ok: boolean
  result?: unknown
  description?: string
}

interface CallSummary {
  businessName: string
  callerPhone: string
  duration: string
  summary: string
  topic?: string
  sentiment?: 'positive' | 'neutral' | 'negative'
  timestamp: Date
}

/**
 * Send a message via Telegram Bot API
 */
async function sendMessage(
  chatId: string,
  text: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML'
): Promise<{ success: boolean; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN

  if (!botToken) {
    console.warn('Telegram bot token not configured')
    return { success: false, error: 'Telegram bot token not configured' }
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: parseMode,
        }),
      }
    )

    const data: TelegramResponse = await response.json()

    if (!data.ok) {
      console.error('Telegram API error:', data.description)
      return { success: false, error: data.description }
    }

    return { success: true }
  } catch (error) {
    console.error('Telegram send error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message',
    }
  }
}

/**
 * Send a call notification to a Telegram chat
 */
export async function sendCallNotification(
  chatId: string,
  call: CallSummary
): Promise<{ success: boolean; error?: string }> {
  const sentimentEmoji = {
    positive: '🟢',
    neutral: '🟡',
    negative: '🔴',
  }

  const formattedTime = call.timestamp.toLocaleString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
  })

  // Build the message in HTML format
  const message = `
🔔 <b>Nytt samtal till ${escapeHtml(call.businessName)}</b>

📞 <b>Uppringare:</b> ${escapeHtml(call.callerPhone)}
⏱️ <b>Längd:</b> ${escapeHtml(call.duration)}
🕐 <b>Tid:</b> ${formattedTime}
${call.topic ? `📋 <b>Ämne:</b> ${escapeHtml(call.topic)}` : ''}
${call.sentiment ? `${sentimentEmoji[call.sentiment]} <b>Känsla:</b> ${getSentimentLabel(call.sentiment)}` : ''}

<b>Sammanfattning:</b>
${escapeHtml(call.summary)}
`.trim()

  return sendMessage(chatId, message, 'HTML')
}

/**
 * Send a test message to verify Telegram setup
 */
export async function sendTestMessage(
  chatId: string
): Promise<{ success: boolean; error?: string }> {
  const message = `
✅ <b>Telegram-integration aktiverad!</b>

Du kommer nu att få notifikationer om nya samtal till din AI-receptionist.

<i>Skickat från AnythingVoice</i>
`.trim()

  return sendMessage(chatId, message, 'HTML')
}

/**
 * Get chat ID from Telegram update (for /start command handling)
 */
export function extractChatId(update: { message?: { chat?: { id?: number } } }): string | null {
  return update.message?.chat?.id?.toString() || null
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Get Swedish label for sentiment
 */
function getSentimentLabel(sentiment: 'positive' | 'neutral' | 'negative'): string {
  switch (sentiment) {
    case 'positive':
      return 'Positiv'
    case 'neutral':
      return 'Neutral'
    case 'negative':
      return 'Negativ'
  }
}

/**
 * Format phone number for display
 */
export function formatPhoneForTelegram(phone: string): string {
  // Remove non-digit characters for cleaner display
  if (phone.startsWith('+46')) {
    return phone.replace(/(\+46)(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
  }
  return phone
}

/**
 * Format duration for display
 */
export function formatDurationForTelegram(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes === 0) {
    return `${remainingSeconds} sek`
  }

  return `${minutes} min ${remainingSeconds} sek`
}
