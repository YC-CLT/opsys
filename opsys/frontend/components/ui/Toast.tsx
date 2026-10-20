'use client'

import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ToastItem {
  id: number
  type: 'success' | 'error' | 'warn'
  message: string
}

interface ToastContextValue {
  toast: {
    success: (msg: string) => void
    error: (msg: string) => void
    warn: (msg: string) => void
  }
}

const ToastContext = createContext<ToastContextValue>({
  toast: {
    success: () => {},
    error: () => {},
    warn: () => {},
  },
})

export function useToast() {
  return useContext(ToastContext)
}

const MAX_TOASTS = 3
const AUTO_DISMISS_MS = 3000

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const addToast = useCallback((type: ToastItem['type'], message: string) => {
    const id = ++idRef.current
    setToasts((prev) => {
      const next = [...prev, { id, type, message }]
      if (next.length > MAX_TOASTS) {
        return next.slice(next.length - MAX_TOASTS)
      }
      return next
    })

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, AUTO_DISMISS_MS)
  }, [])

  const toast = {
    success: (msg: string) => addToast('success', msg),
    error: (msg: string) => addToast('error', msg),
    warn: (msg: string) => addToast('warn', msg),
  }

  const borderColor = {
    success: 'border-l-green-500',
    error: 'border-l-red-500',
    warn: 'border-l-yellow-500',
  }

  const textColor = {
    success: 'text-green-400',
    error: 'text-red-400',
    warn: 'text-yellow-400',
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className={`pointer-events-auto bg-black/80 backdrop-blur border-l-4 ${borderColor[t.type]} px-4 py-3 rounded-r-lg shadow-lg min-w-[260px] max-w-[400px]`}
            >
              <p className={`text-sm font-mono ${textColor[t.type]}`}>{t.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}