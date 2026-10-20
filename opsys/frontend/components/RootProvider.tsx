'use client'

import { ModeProvider } from '@/hooks/useModeDetect'
import { AuthProvider } from '@/hooks/useAuth'
import { AudioProvider } from './ui/AudioProvider'
import { ToastProvider } from './ui/Toast'
import { TerminalProvider } from './ui/TerminalOverlay'

export default function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ModeProvider>
      <AuthProvider>
        <AudioProvider>
          <ToastProvider>
            <TerminalProvider>
              {children}
            </TerminalProvider>
          </ToastProvider>
        </AudioProvider>
      </AuthProvider>
    </ModeProvider>
  )
}