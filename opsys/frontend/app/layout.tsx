'use client'

import { Geist, Geist_Mono } from 'next/font/google'
import RootProvider from '@/components/RootProvider'
import Mascot from '@/components/ui/Mascot'
import SettingsPanel from '@/components/ui/SettingsPanel'
import { useTerminal } from '@/components/ui/TerminalOverlay'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

function TerminalIcon() {
  const { toggle } = useTerminal()
  return (
    <button
      onClick={toggle}
      className="fixed bottom-20 right-4 z-40 w-10 h-10 rounded-full bg-black/80 border border-green-500/40 text-green-400 hover:text-green-300 hover:border-green-500/60 hover:bg-black/90 transition-all flex items-center justify-center font-mono text-sm shadow-lg"
      title="终端 (Ctrl+K)"
      aria-label="打开终端"
    >
      {'>'}
    </button>
  )
}

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
          <TerminalIcon />
        </RootProvider>
      </body>
    </html>
  )
}