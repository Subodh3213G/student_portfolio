import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

import { logout } from '@/app/auth/actions'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center mx-auto px-8 md:px-20">
          <div className="mr-4 flex">
            <Link className="mr-6 flex items-center space-x-2 font-bold" href="/">
              StudentPortfolio
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {user ? (
                <>
                  <Link href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60">
                     Go to Dashboard
                  </Link>
                  <form action={logout}>
                    <button type="submit" className="transition-colors hover:text-foreground/80 text-foreground/60">
                      Logout
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" className="transition-colors hover:text-foreground/80 text-foreground/60">
                    Login
                  </Link>
                  <Link href="/signup" className="transition-colors hover:text-foreground/80 text-foreground/60">
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Build your professional student portfolio in minutes.
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Showcase your projects, skills, and experience with a beautiful, whitelabeled portfolio. 
              Upload your resume and let AI build it for you.
            </p>
            <div className="space-x-4">
              <Link href={user ? "/dashboard" : "/signup"} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8">
                Get Started
              </Link>
              <Link href="/demo" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-11 px-8">
                View Demo
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
