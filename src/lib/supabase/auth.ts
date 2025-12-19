import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Customer } from '@/types/database'

/**
 * Create a Supabase client for authentication (uses anon key)
 * This is for customer-facing auth operations
 */
export async function createSupabaseAuthClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Components cannot set cookies
          }
        },
      },
    }
  )
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const supabase = await createSupabaseAuthClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

/**
 * Get the current authenticated customer profile
 */
export async function getCurrentCustomer(): Promise<Customer | null> {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const supabase = await createSupabaseAuthClient()
  const { data: customer, error } = await supabase
    .from('customers')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (error || !customer) {
    return null
  }

  return customer as Customer
}

/**
 * Send a magic link to the user's email
 */
export async function sendMagicLink(email: string, redirectTo?: string) {
  const supabase = await createSupabaseAuthClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    },
  })

  if (error) {
    throw error
  }

  return { success: true }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = await createSupabaseAuthClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }

  return { success: true }
}

/**
 * Create or get customer record for authenticated user
 */
export async function getOrCreateCustomer(email: string, authUserId: string): Promise<Customer> {
  const supabase = await createSupabaseAuthClient()

  // First, try to find existing customer
  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('*')
    .eq('email', email)
    .single()

  if (existingCustomer) {
    // Update auth_user_id if not set
    if (!existingCustomer.auth_user_id) {
      await supabase
        .from('customers')
        .update({ auth_user_id: authUserId })
        .eq('id', existingCustomer.id)
    }
    return existingCustomer as Customer
  }

  // Create new customer
  const { data: newCustomer, error } = await supabase
    .from('customers')
    .insert({
      email,
      auth_user_id: authUserId,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return newCustomer as Customer
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}

/**
 * Get user session
 */
export async function getSession() {
  const supabase = await createSupabaseAuthClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    return null
  }

  return session
}
