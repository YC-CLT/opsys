'use client'

import { ModeProvider } from '@/hooks/useModeDetect'
import { AuthProvider } from '@/hooks/useAuth'
import { AudioProvider } from './ui/AudioProvider'
import { ToastProvider } from './ui/Toast'

export default function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ModeProvider>
      <AuthProvider>
        <AudioProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AudioProvider>
      </AuthProvider>
    </ModeProvider>
  )
}