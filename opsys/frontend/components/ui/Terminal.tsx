'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAudio } from '@/components/AudioProvider'
import { useRouter } from 'next/navigation'

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

const HELP_TEXT = [
  'Available commands:',
  '  ls           — list available levels',
  '  cd level<N>  — enter a level (1-6)',
  '  clear        — clear terminal screen',
  '  whoami       — show current user info',
  '  help         — show this help',
]

const LEVEL_NAMES = ['', '第一章·引论', '发展历程', '基本特性', '运行环境', '体系结构', '系统调用']

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
  const [bootPhase, setBootPhase] = useState<'booting' | 'ready'>('booting')
  const [bootIndex, setBootIndex] = useState(0)
  const [lines, setLines] = useState<LogLine[]>([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const [lineCounter, setLineCounter] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasPlayedAudio = useRef(false)

  const addLine = useCallback((type: LogLine['type'], text: string, isCommand?: boolean) => {
    setLineCounter((prev) => prev + 1)
    setLines((prev) => [...prev, { id: Date.now() + Math.random(), type, text, isCommand }])
  }, [])

  // Boot sequence
  useEffect(() => {
    if (bootPhase === 'booting') {
      if (!hasPlayedAudio.current) {
        playSFX('/audio/InitTerminal.wav')
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

  const executeCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim()
    if (!trimmed) {
      addLine('input', '$ ')
      return
    }

    addLine('input', `$ ${trimmed}`, true)
    setHistory((prev) => [...prev, trimmed])
    setHistoryIdx(-1)

    const lower = trimmed.toLowerCase()

    if (lower === 'help') {
      HELP_TEXT.forEach((h) => addLine('output', h))
    } else if (lower === 'ls') {
      addLine('output', 'Available levels:')
      for (let i = 1; i <= 6; i++) {
        addLine('output', `  level${i}  —  ${LEVEL_NAMES[i]}`)
      }
    } else if (lower === 'clear') {
      setLines([])
      addLine('output', 'os-challenge@kernel:~$ ')
      return
    } else if (lower === 'whoami') {
      if (userName && studentId) {
        addLine('output', `uid=${studentId} name=${userName}`)
      } else {
        addLine('output', 'os-challenge@kernel (not logged in)')
      }
    } else if (/^cd level[1-6]$/.test(lower)) {
      const level = parseInt(lower.replace('cd level', ''))
      addLine('output', `Entering ${LEVEL_NAMES[level]}...`)
      if (onEnterLevel) {
        onEnterLevel(level)
      } else {
        router.push(`/student/${level}`)
      }
    } else {
      addLine('error', `bash: ${trimmed.split(' ')[0]}: command not found`)
    }

    addLine('output', 'os-challenge@kernel:~$ ')
  }, [addLine, onEnterLevel, router, userName, studentId])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input)
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
            <motion.span
              className="inline-block w-2 h-3 bg-green-400 ml-0.5"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}