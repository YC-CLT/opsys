'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { asset } from '@/lib/asset-path'

const quotes = [
  '并发是逻辑上同时发生，并行是物理上同时发生。',
  '没有 OS 的计算机，只是一堆"裸机"。',
  '虚拟化：让每个进程都觉得自己独占 CPU。',
  '管态是内核的地盘，目态是用户的领地。',
  'PV 操作——信号量机制的灵魂。',
  '中断就像电话铃声，告诉 CPU 有急事需要处理。',
  '死锁：大家都在等对方释放资源，结果谁也动不了。',
]

const STORAGE_KEY = 'mascot-position'
const DEFAULT_POS = { x: 16, y: 16 }

function loadSavedPosition(): { x: number; y: number } | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return null
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

export default function Mascot() {
  const [quote, setQuote] = useState('')
  const [showBubble, setShowBubble] = useState(false)
  const [position, setPosition] = useState(DEFAULT_POS)
  const [isDragging, setIsDragging] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 })
  const hasMoved = useRef(false)

  const savePosition = useCallback((x: number, y: number) => {
    setPosition({ x, y })
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ x, y }))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    const saved = loadSavedPosition()
    if (saved) setPosition(saved)
  }, [])

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

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    hasMoved.current = false
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMoved.current = true
    }
    const vw = window.innerWidth
    const vh = window.innerHeight
    const newX = clamp(dragStart.current.posX + dx, 0, vw - 140)
    const newY = clamp(dragStart.current.posY + dy, 0, vh - 180)
    setPosition({ x: newX, y: newY })
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false)
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    savePosition(position.x, position.y)
  }

  const handleClick = () => {
    if (hasMoved.current) return
    setQuote(quotes[Math.floor(Math.random() * quotes.length)])
    setShowBubble(true)
    setTimeout(() => setShowBubble(false), 5000)
  }

  const motionProps = isDragging
    ? {
        animate: {
          rotate: [-3, 3, -5, 5, -3, 3, 0],
          scaleX: [1, 1.06, 0.94, 1.06, 1],
          scaleY: [1, 0.94, 1.06, 0.94, 1],
        },
        transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' as const },
      }
    : {
        animate: {
          rotate: [0, -5, 5, -3, 3, 0, 0, -4, 4, 0],
          scaleX: [1, 1, 1.03, 1, 0.97, 1, 1, 1.02, 1, 1],
          scaleY: [1, 0.97, 1, 1.03, 1, 1, 0.98, 1, 1, 1],
        },
        transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const },
      }

  return (
    <div
      ref={containerRef}
      className="fixed z-50 flex flex-col items-start gap-2 select-none"
      style={{ left: position.x, bottom: `calc(100vh - ${position.y}px - 180px)` }}
    >
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
        className="relative cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
        {...motionProps}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset('/img/mascot.png')}
          alt="OS Challenge 吉祥物"
          width={120}
          height={150}
          className="object-contain pointer-events-none"
          draggable={false}
          onError={(e) => {
            const t = e.currentTarget
            t.style.display = 'none'
          }}
        />
      </motion.div>
    </div>
  )
}