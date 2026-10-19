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

export default function Mascot() {
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
    <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-2">
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm rounded-2xl px-4 py-3 max-w-[260px] shadow-lg border border-zinc-200 dark:border-zinc-700"
          >
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{quote}</p>
            <div className="absolute bottom-[-8px] left-6 w-4 h-4 bg-white/90 dark:bg-zinc-800/90 border-r border-b border-zinc-200 dark:border-zinc-700 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="relative cursor-pointer group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        onClick={() => {
          setQuote(quotes[Math.floor(Math.random() * quotes.length)])
          setShowBubble(true)
          setTimeout(() => setShowBubble(false), 5000)
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/img/mascot.png"
          alt="OS Challenge 吉祥物"
          width={80}
          height={100}
          className="object-contain"
          onError={(e) => {
            const t = e.currentTarget
            t.style.display = 'none'
          }}
        />
      </motion.div>
    </div>
  )
}