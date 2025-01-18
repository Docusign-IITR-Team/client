"use client"
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { NextAuthProvider } from '@/components/providers/NextAuthProvider'
import { CustomSidebar } from './components/CustomSidebar'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

const metadata: Metadata = {
  title: 'Agreement Management System',
  description: 'Securely manage and track your agreements',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextAuthProvider>
          <div className="flex min-h-screen">
            <main className="flex-1 overflow-x-hidden">
              {children}
            </main>
          </div>
          <Toaster richColors />
        </NextAuthProvider>
      </body>
    </html>
  )
}
