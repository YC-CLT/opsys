'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const quotes = [
  '并发是逻辑上同时发生，并行是物理上同时发生。',
  '没有 OS 的计算机，只是一堆"裸机"。',
  '虚拟化：让每个进程都觉得自己独占 CPU。',
  '管态是内核的地盘，目态是用户的领地。',
  'PV 操作——信号量机制的灵魂。',
  '中断就像电话铃声，告诉 CPU 有急事需要处理。',
  '死锁：大家都在等对方释放资源，结果谁也动不了。',
]

export default function KanbanMusume() {
  const [quote, setQuote] = useState('')
  const [showBubble, setShowBubble] = useState(false)

  useEffect(() => {
    const show = () => {
      setQuote(quotes[Math.floor(Math.random() * quotes.length)])
      setShowBubble(true)
      setTimeout(() => setShowBubble(false), 5000)
    }
    show()
    const interval = setInterval(show, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm rounded-2xl px-4 py-3 max-w-[260px] shadow-lg border border-zinc-200 dark:border-zinc-700"
          >
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{quote}</p>
            <div className="absolute bottom-[-8px] right-6 w-4 h-4 bg-white/90 dark:bg-zinc-800/90 border-r border-b border-zinc-200 dark:border-zinc-700 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="relative cursor-pointer group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setQuote(quotes[Math.floor(Math.random() * quotes.length)])
          setShowBubble(true)
          setTimeout(() => setShowBubble(false), 5000)
        }}
      >
        <motion.svg
          width="80"
          height="100"
          viewBox="0 0 80 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Hair */}
          <ellipse cx="40" cy="22" rx="24" ry="20" fill="#2d1b4e" />
          <rect x="16" y="22" width="48" height="12" rx="4" fill="#2d1b4e" />

          {/* Face */}
          <ellipse cx="40" cy="28" rx="18" ry="15" fill="#fddcb5" />

          {/* Eyes */}
          <motion.g
            animate={{ scaleY: [1, 0.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, delay: 2 }}
          >
            <circle cx="33" cy="26" r="3" fill="#333" />
            <circle cx="47" cy="26" r="3" fill="#333" />
          </motion.g>

          {/* Eye shines */}
          <circle cx="32" cy="25" r="1" fill="white" />
          <circle cx="46" cy="25" r="1" fill="white" />

          {/* Blush */}
          <ellipse cx="28" cy="32" rx="4" ry="2.5" fill="#ffb3b3" opacity="0.6" />
          <ellipse cx="52" cy="32" rx="4" ry="2.5" fill="#ffb3b3" opacity="0.6" />

          {/* Mouth */}
          <motion.path
            d="M36 34 Q40 38 44 34"
            stroke="#cc6666"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            animate={{ d: ['M36 34 Q40 38 44 34', 'M37 35 Q40 36 43 35', 'M36 34 Q40 38 44 34'] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Body */}
          <rect x="28" y="42" width="24" height="30" rx="8" fill="#5b3a8c" />

          {/* Collar */}
          <path d="M32 42 L40 52 L48 42" fill="#7b5ea7" stroke="#4a2d75" strokeWidth="1" />

          {/* Arms */}
          <motion.ellipse
            cx="22"
            cy="55"
            rx="7"
            ry="4"
            fill="#5b3a8c"
            animate={{ rotate: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '28px 50px' }}
          />
          <motion.ellipse
            cx="58"
            cy="55"
            rx="7"
            ry="4"
            fill="#5b3a8c"
            animate={{ rotate: [0, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '52px 50px' }}
          />

          {/* OS Book */}
          <rect x="33" y="60" width="14" height="10" rx="1" fill="#e8d5f5" stroke="#7b5ea7" strokeWidth="0.5" />
          <text x="40" y="68" textAnchor="middle" fontSize="5" fill="#5b3a8c" fontWeight="bold">OS</text>

          {/* Legs */}
          <rect x="33" y="72" width="5" height="12" rx="2" fill="#3d2860" />
          <rect x="42" y="72" width="5" height="12" rx="2" fill="#3d2860" />

          {/* Shoes */}
          <ellipse cx="35.5" cy="86" rx="4.5" ry="2.5" fill="#1a1a2e" />
          <ellipse cx="44.5" cy="86" rx="4.5" ry="2.5" fill="#1a1a2e" />
        </motion.svg>
      </motion.div>
    </div>
  )
}