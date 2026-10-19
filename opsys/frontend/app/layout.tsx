'use client'

import { Geist, Geist_Mono } from 'next/font/google'
import RootProvider from '@/components/RootProvider'
import Mascot from '@/components/ui/Mascot'
import SettingsPanel from '@/components/ui/SettingsPanel'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>OS Challenge — 操作系统知识闯关</title>
      </head>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] relative">
        <div className="stars-bg" />
        <RootProvider>
          <div className="relative z-10 min-h-screen">
            {children}
          </div>
          <SettingsPanel />
          <Mascot />
        </RootProvider>
      </body>
    </html>
  )
}