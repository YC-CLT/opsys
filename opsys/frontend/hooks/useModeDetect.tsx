'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { detectMode, getStoredMode, setStoredMode, type AppMode } from '@/lib/api'

interface ModeContextValue {
  mode: AppMode | null
  setMode: (m: AppMode) => void
  loading: boolean
}

const ModeContext = createContext<ModeContextValue>({
  mode: null,
  setMode: () => {},
  loading: true,
})

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<AppMode | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = getStoredMode()
    if (stored) {
      setModeState(stored)
      setLoading(false)
      return
    }

    detectMode().then((detected) => {
      setModeState(detected)
      setStoredMode(detected)
      setLoading(false)
    })
  }, [])

  const setMode = (m: AppMode) => {
    setModeState(m)
    setStoredMode(m)
  }

  return (
    <ModeContext.Provider value={{ mode, setMode, loading }}>
      {children}
    </ModeContext.Provider>
  )
}

export function useModeDetect() {
  return useContext(ModeContext)
}