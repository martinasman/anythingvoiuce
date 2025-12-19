import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard'

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
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

    // Exchange code for session
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
    }

    if (user) {
      // Create or update customer record
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', user.email!)
        .single()

      if (!existingCustomer) {
        // Create new customer
        await supabase.from('customers').insert({
          email: user.email!,
          auth_user_id: user.id,
          name: user.user_metadata?.full_name || null,
        })
      } else {
        // Update auth_user_id if needed
        await supabase
          .from('customers')
          .update({ auth_user_id: user.id })
          .eq('email', user.email!)
      }
    }
  }

  // Redirect to the intended destination
  return NextResponse.redirect(new URL(redirectTo, request.url))
}
