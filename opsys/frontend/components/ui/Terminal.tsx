'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAudio } from '@/components/ui/AudioProvider'
import { asset } from '@/lib/asset-path'
import { useRouter } from 'next/navigation'
import { executeCommand, type CommandContext } from '@/lib/terminal-commands'
import { useAuth } from '@/hooks/useAuth'
import { useModeDetect } from '@/hooks/useModeDetect'

interface LogLine {
  id: number
  type: 'info' | 'warn' | 'dim' | 'error' | 'input' | 'output'
  text: string
  isCommand?: boolean
}

const BOOT_SEQUENCE = [
  { type: 'info' as const, text: 'INIT kernel v4.19.0 — booting...' },
  { type: 'info' as const, text: 'Loading module: scheduler [OK]' },
  { type: 'info' as const, text: 'Loading module: memory_mgr [OK]' },
  { type: 'info' as const, text: 'Loading module: fs_driver [OK]' },
  { type: 'info' as const, text: 'Loading module: net_stack [OK]' },
  { type: 'warn' as const, text: 'WARNING: swap space utilization at 34%' },
  { type: 'info' as const, text: 'OS Challenge System v1.0 ready.' },
  { type: 'dim' as const, text: '  ————————————' },
  { type: 'dim' as const, text: '  Type "help" for commands.' },
  { type: 'dim' as const, text: '  ————————————' },
]

interface TerminalProps {
  /** Called when user enters a valid cd level<N> command */
  onEnterLevel?: (level: number) => void
  /** Current user name */
  userName?: string
  /** Current student ID */
  studentId?: string
}

export default function Terminal({ onEnterLevel, userName, studentId }: TerminalProps) {
  const router = useRouter()
  const { playSFX } = useAudio()
  const { student, loginStudent, logout: authLogout } = useAuth()
  const { mode } = useModeDetect()
  const [bootPhase, setBootPhase] = useState<'booting' | 'ready'>('booting')
  const [bootIndex, setBootIndex] = useState(0)
  const [lines, setLines] = useState<LogLine[]>([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasPlayedAudio = useRef(false)

  const addLine = useCallback((type: LogLine['type'], text: string, isCommand?: boolean) => {
    setLines((prev) => [...prev, { id: Date.now() + Math.random(), type, text, isCommand }])
  }, [])

  // Boot sequence
  useEffect(() => {
    if (bootPhase === 'booting') {
      if (!hasPlayedAudio.current) {
        playSFX(asset('/audio/InitTerminal.wav'))
        hasPlayedAudio.current = true
      }
      if (bootIndex >= BOOT_SEQUENCE.length) {
        setBootPhase('ready')
        addLine('output', 'os-challenge@kernel:~$ ')
        return
      }
      const timer = setTimeout(() => {
        addLine(BOOT_SEQUENCE[bootIndex].type, BOOT_SEQUENCE[bootIndex].text)
        setBootIndex((prev) => prev + 1)
      }, bootIndex === 0 ? 300 : 150)
      return () => clearTimeout(timer)
    }
  }, [bootPhase, bootIndex, addLine, playSFX])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  const handleCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim()
    if (!trimmed) {
      addLine('input', '$ ')
      return
    }

    addLine('input', `$ ${trimmed}`, true)
    setHistory((prev) => [...prev, trimmed])
    setHistoryIdx(-1)

    const context: CommandContext = {
      mode,
      isLoggedIn: !!student,
      userName: userName || student?.name,
      studentId: studentId || student?.studentId,
    }
    const result = executeCommand(trimmed, context)

    if (result.action === 'clear') {
      setLines([])
      addLine('output', 'os-challenge@kernel:~$ ')
      return
    }

    result.outputLines.forEach((line) => addLine('output', line))

    if (result.action === 'navigate' && result.actionPayload) {
      if (onEnterLevel) {
        const levelMatch = result.actionPayload.match(/\/level\/(\d+)/)
        if (levelMatch) onEnterLevel(parseInt(levelMatch[1]))
      } else {
        router.push(result.actionPayload)
      }
      return
    }

    if (result.action === 'close') {
      addLine('output', 'os-challenge@kernel:~$ ')
      return
    }

    if (result.action === 'login' && result.actionPayload) {
      try {
        const payload = JSON.parse(result.actionPayload) as { studentId: string; name: string }
        loginStudent(payload.studentId, payload.name)
        addLine('output', `Login successful! Welcome, ${payload.name}.`)
        addLine('output', 'Redirecting to dashboard...')
        addLine('output', 'os-challenge@kernel:~$ ')
        router.push('/student/dashboard')
        return
      } catch {
        addLine('error', 'login: failed to parse credentials')
        addLine('output', 'os-challenge@kernel:~$ ')
        return
      }
    }

    if (result.action === 'logout') {
      authLogout()
      addLine('output', 'Logged out.')
      addLine('output', 'os-challenge@kernel:~$ ')
      return
    }

    addLine('output', 'os-challenge@kernel:~$ ')
  }, [addLine, mode, student, userName, studentId, onEnterLevel, router, loginStudent, authLogout])

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
    <motion.div
      className="bg-black/85 backdrop-blur-sm rounded-lg border border-green-500/30 font-mono text-xs leading-5 overflow-hidden shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-green-500/20">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <span className="ml-2 text-green-500/50 text-[10px] tracking-wider">terminal — os-challenge@kernel</span>
        {bootPhase === 'ready' && (
          <span className="ml-auto text-green-500/40 text-[10px] tracking-wider animate-pulse">
            INPUT ACTIVE
          </span>
        )}
      </div>

      <div
        ref={scrollRef}
        className="p-3 space-y-0.5 h-64 overflow-y-auto cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line) => (
          <motion.div
            key={line.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className={
              line.type === 'info'
                ? 'text-green-400'
                : line.type === 'warn'
                ? 'text-yellow-400'
                : line.type === 'error'
                ? 'text-red-400'
                : line.type === 'input'
                ? 'text-cyan-300'
                : 'text-green-500/60'
            }
          >
            {line.text}
          </motion.div>
        ))}

        {bootPhase === 'ready' && (
          <div className="flex items-center">
            <span className="text-green-400">os-challenge@kernel:~$ </span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-cyan-300 caret-green-400 font-mono text-xs"
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}