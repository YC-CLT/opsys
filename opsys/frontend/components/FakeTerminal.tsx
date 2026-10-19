'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const messages = [
  { type: 'info', text: 'INIT kernel v4.19.0 — booting...' },
  { type: 'info', text: 'Loading module: scheduler [OK]' },
  { type: 'info', text: 'Loading module: memory_mgr [OK]' },
  { type: 'info', text: 'Loading module: fs_driver [OK]' },
  { type: 'info', text: 'Loading module: net_stack [OK]' },
  { type: 'warn', text: 'WARNING: swap space utilization at 34%' },
  { type: 'info', text: 'OS Challenge System v1.0 ready.' },
  { type: 'dim', text: '  --------------------------------' },
  { type: 'dim', text: '  "The best way to learn an OS' },
  { type: 'dim', text: '   is to implement one."' },
  { type: 'dim', text: '            — Andrew S. Tanenbaum' },
  { type: 'dim', text: '  --------------------------------' },
]

export default function FakeTerminal() {
  const [visibleLines, setVisibleLines] = useState<number>(0)

  useEffect(() => {
    if (visibleLines >= messages.length) return
    const timer = setTimeout(() => {
      setVisibleLines((prev) => prev + 1)
    }, 180)
    return () => clearTimeout(timer)
  }, [visibleLines])

  return (
    <motion.div
      className="bg-black/85 backdrop-blur-sm rounded-lg border border-green-500/30 p-4 font-mono text-xs leading-5 overflow-hidden shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-1.5 mb-3 border-b border-green-500/20 pb-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <span className="ml-2 text-green-500/50 text-[10px] tracking-wider">terminal — user@oskernel</span>
      </div>

      <div className="space-y-0.5">
        {messages.slice(0, visibleLines).map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={
              msg.type === 'info'
                ? 'text-green-400'
                : msg.type === 'warn'
                ? 'text-yellow-400'
                : 'text-green-500/60'
            }
          >
            {msg.text}
            {i === visibleLines - 1 && (
              <motion.span
                className="inline-block w-2 h-3 bg-green-400 ml-0.5 align-middle"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}