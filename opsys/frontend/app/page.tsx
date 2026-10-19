'use client'

import { motion } from 'framer-motion'
import FakeTerminal from '@/components/FakeTerminal'
import { useModeDetect } from '@/hooks/useModeDetect'

export default function Home() {
  const { mode, loading } = useModeDetect()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight glow-text mb-4">
          OS Challenge
        </h1>
        <p className="text-lg text-zinc-400 max-w-md mx-auto">
          操作系统知识闯关学习系统 — 从引论到文件系统
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full max-w-md"
      >
        <FakeTerminal />
      </motion.div>

      {loading ? (
        <p className="text-zinc-500 text-sm animate-pulse">正在检测运行模式...</p>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-4"
        >
          <button className="px-8 py-3 rounded-xl bg-accent/20 border border-accent/40 text-accent hover:bg-accent/30 transition-colors font-medium">
            学生入口
          </button>
          <button className="px-8 py-3 rounded-xl bg-surface border border-zinc-600/40 text-zinc-300 hover:bg-surface/80 transition-colors font-medium">
            教师入口
          </button>
        </motion.div>
      )}

      <p className="text-xs text-zinc-600 mt-8">
        运行模式：{loading ? '检测中...' : mode === 'live' ? '🟢 在线模式' : '🟡 静态模式'}
      </p>
    </main>
  )
}