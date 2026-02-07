import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // CHECK ENV VARS
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Middleware Error: Missing Supabase Environment Variables')
    return response // Proceed without auth to avoid 500
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  try {
      const { data: { user } } = await supabase.auth.getUser()

      // Protected routes
      if (request.nextUrl.pathname.startsWith('/dashboard')) {
          if (!user) {
              return NextResponse.redirect(new URL('/login', request.url))
          }
      }

      // Redirect to dashboard if logged in and visiting login/signup
      if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
      }
  } catch (error) {
      console.error('Middleware Auth Error:', error)
      // On error, just return response, don't crash the app
  }
  
  return response
}
