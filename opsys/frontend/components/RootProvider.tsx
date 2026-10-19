'use client'

import { ModeProvider } from '@/hooks/useModeDetect'
import { AuthProvider } from '@/hooks/useAuth'
import { AudioProvider } from './AudioProvider'

export default function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ModeProvider>
      <AuthProvider>
        <AudioProvider>
          {children}
        </AudioProvider>
      </AuthProvider>
    </ModeProvider>
  )
}