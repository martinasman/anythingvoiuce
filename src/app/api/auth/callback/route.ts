import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard'

  console.log('Auth callback received:', { code: code?.substring(0, 8) + '...', redirectTo })

  if (!code) {
    console.error('No code provided in auth callback')
    return NextResponse.redirect(new URL('/login?error=no_code', request.url))
  }

  const cookieStore = await cookies()

  // Auth client for session exchange (uses anon key)
  const supabaseAuth = createServerClient(
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
          } catch (error) {
            console.error('Failed to set cookies:', error)
          }
        },
      },
    }
  )

  // Exchange code for session
  const { data: { user, session }, error } = await supabaseAuth.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Auth callback error:', error.message, error)
    return NextResponse.redirect(new URL('/login?error=auth_failed&message=' + encodeURIComponent(error.message), request.url))
  }

  if (!user || !session) {
    console.error('No user or session after code exchange')
    return NextResponse.redirect(new URL('/login?error=no_session', request.url))
  }

  console.log('Auth successful for user:', user.email)

  // Use service role client for database operations (bypasses RLS)
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
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

  // Create or update customer record
  const { data: existingCustomer, error: selectError } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('email', user.email!)
    .single()

  if (selectError && selectError.code !== 'PGRST116') {
    // PGRST116 = no rows found, which is expected for new users
    console.error('Error checking existing customer:', selectError)
  }

  if (!existingCustomer) {
    // Create new customer
    const { error: insertError } = await supabaseAdmin.from('customers').insert({
      email: user.email!,
      auth_user_id: user.id,
      name: user.user_metadata?.full_name || null,
    })

    if (insertError) {
      console.error('Failed to create customer:', insertError)
      // Don't fail the login, just log the error
    } else {
      console.log('Created new customer for:', user.email)
    }
  } else {
    // Update auth_user_id if needed
    const { error: updateError } = await supabaseAdmin
      .from('customers')
      .update({ auth_user_id: user.id })
      .eq('email', user.email!)

    if (updateError) {
      console.error('Failed to update customer:', updateError)
    } else {
      console.log('Updated existing customer:', user.email)
    }
  }

  // Redirect to the intended destination
  console.log('Redirecting to:', redirectTo)
  return NextResponse.redirect(new URL(redirectTo, request.url))
}
