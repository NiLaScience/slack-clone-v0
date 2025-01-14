import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { initBotUser } from '@/lib/bot'

const inter = Inter({ subsets: ['latin'] })

// Initialize bot user when server starts
if (process.env.NODE_ENV !== 'production') {
  initBotUser().catch(console.error)
}

export const metadata: Metadata = {
  title: 'Slack Clone',
  description: 'A modern Slack clone built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  )
}



import './globals.css'