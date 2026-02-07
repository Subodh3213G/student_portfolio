import Link from 'next/link'
import React from 'react'

export default function WhitelabelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <main className="min-h-[calc(100vh-60px)]">
        {children}
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>
          Powered by{' '}
          <Link href="/" className="font-semibold hover:underline">
            StudentPortfolio
          </Link>
        </p>
      </footer>
    </div>
  )
}
