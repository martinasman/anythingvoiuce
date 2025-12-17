import { createSupabaseServerClient } from '@/lib/supabase/server'

// Swedish character mappings
const SWEDISH_CHAR_MAP: Record<string, string> = {
  'å': 'a',
  'ä': 'a',
  'ö': 'o',
  'Å': 'a',
  'Ä': 'a',
  'Ö': 'o',
  'é': 'e',
  'è': 'e',
  'ë': 'e',
  'ü': 'u',
  'ï': 'i',
  'ç': 'c',
}

/**
 * Normalize Swedish characters to ASCII equivalents
 */
export function normalizeSwedish(text: string): string {
  return text
    .split('')
    .map((char) => SWEDISH_CHAR_MAP[char] || char)
    .join('')
}

/**
 * Create a URL-safe slug from a business name
 */
export function createSlug(name: string): string {
  return normalizeSwedish(name)
    .toLowerCase()
    .trim()
    // Replace common business suffixes
    .replace(/\s+(ab|hb|kb|ek\.?\s*för\.?|handelsbolag|aktiebolag)$/gi, '')
    // Replace spaces and special characters with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length
    .substring(0, 50)
}

/**
 * Generate a unique slug by checking the database
 */
export async function generateUniqueSlug(name: string): Promise<string> {
  const supabase = await createSupabaseServerClient()
  const baseSlug = createSlug(name)

  if (!baseSlug) {
    // Fallback for empty names
    return `business-${Date.now()}`
  }

  let slug = baseSlug
  let counter = 1

  while (true) {
    const { data } = await supabase
      .from('businesses')
      .select('slug')
      .eq('slug', slug)
      .single()

    if (!data) {
      // Slug is available
      return slug
    }

    // Try next number
    counter++
    slug = `${baseSlug}-${counter}`

    // Safety limit
    if (counter > 100) {
      return `${baseSlug}-${Date.now()}`
    }
  }
}
