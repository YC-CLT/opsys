'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useModeDetect } from '@/hooks/useModeDetect'
import { executeCommand, type CommandContext } from '@/lib/terminal-commands'

interface TerminalContextValue {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

const TerminalContext = createContext<TerminalContextValue>({
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
})

export function useTerminal() {
  return useContext(TerminalContext)
}

export function TerminalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        toggle()
      }
      if (e.key === 'Escape' && isOpen) {
        close()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, toggle, close])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <TerminalContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
      <TerminalOverlay />
    </TerminalContext.Provider>
  )
}

function TerminalOverlay() {
  const { isOpen, close } = useTerminal()
  const router = useRouter()
  const { student, loginStudent, logout: authLogout } = useAuth()
  const { mode } = useModeDetect()

  const [lines, setLines] = useState<string[]>(['os-challenge@kernel:~$ '])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  const addOutput = useCallback((text: string) => {
    setLines((prev) => [...prev, text])
  }, [])

  const handleCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim()
    if (!trimmed) {
      addOutput('os-challenge@kernel:~$ ')
      return
    }

    addOutput(`$ ${trimmed}`)
    setHistory((prev) => [...prev, trimmed])
    setHistoryIdx(-1)

    const context: CommandContext = {
      mode,
      isLoggedIn: !!student,
      userName: student?.name,
      studentId: student?.studentId,
    }
    const result = executeCommand(trimmed, context)

    result.outputLines.forEach((line) => addOutput(line))

    if (result.action === 'navigate' && result.actionPayload) {
      router.push(result.actionPayload)
      close()
      return
    }

    if (result.action === 'close' || result.action === 'clear') {
      if (result.action === 'clear') {
        setLines(['os-challenge@kernel:~$ '])
      } else {
        close()
      }
      return
    }

    if (result.action === 'login' && result.actionPayload) {
      try {
        const payload = JSON.parse(result.actionPayload) as { studentId: string; name: string }
        loginStudent(payload.studentId, payload.name)
        addOutput(`Login successful! Welcome, ${payload.name}.`)
        addOutput('Redirecting to dashboard...')
        addOutput('os-challenge@kernel:~$ ')
        return
      } catch {
        addOutput('login: failed to parse credentials')
        addOutput('os-challenge@kernel:~$ ')
        return
      }
    }

    if (result.action === 'logout') {
      authLogout()
      addOutput('Logged out.')
      addOutput('os-challenge@kernel:~$ ')
      return
    }

    addOutput('os-challenge@kernel:~$ ')
  }, [addOutput, mode, student, router, close, loginStudent, authLogout])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input)
      setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const newIdx = historyIdx < history.length - 1 ? historyIdx + 1 : historyIdx
      setHistoryIdx(newIdx)
      setInput(history[history.length - 1 - newIdx] || '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIdx <= 0) {
        setHistoryIdx(-1)
        setInput('')
        return
      }
      const newIdx = historyIdx - 1
      setHistoryIdx(newIdx)
      setInput(history[history.length - 1 - newIdx] || '')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[9997] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[9998] mx-auto w-full md:w-[60vw] md:inset-0 md:top-1/2 md:bottom-auto md:-translate-y-1/2"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="bg-black/90 backdrop-blur-sm border border-green-500/30 rounded-t-xl md:rounded-xl font-mono text-xs leading-5 overflow-hidden shadow-2xl mx-0 md:mx-4">
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-green-500/20">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                <span className="ml-2 text-green-500/50 text-[10px] tracking-wider">terminal — os-challenge@kernel</span>
                <button onClick={close} className="ml-auto text-green-500/50 hover:text-green-400 text-xs px-2">✕</button>
              </div>

              <div
                ref={scrollRef}
                className="p-3 space-y-0.5 h-[40vh] md:h-[50vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {lines.map((line, i) => (
                  <div
                    key={i}
                    className={
                      line.startsWith('$ ')
                        ? 'text-cyan-300'
                        : line.startsWith('bash:')
                        ? 'text-red-400'
                        : 'text-green-400'
                    }
                  >
                    {line}
                  </div>
                ))}

                <div className="flex items-center">
                  <span className="text-green-400">os-challenge@kernel:~$ </span>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent border-none outline-none text-cyan-300 caret-green-400 font-mono text-xs"
                    spellCheck={false}
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}