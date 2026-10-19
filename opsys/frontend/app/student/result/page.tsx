'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

const LEVEL_NAMES = ['', '第一章·引论', '发展历程', '基本特性', '运行环境', '体系结构', '系统调用']

function ResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const levelId = parseInt(searchParams.get('level') || '1')
  const correct = parseInt(searchParams.get('correct') || '0')
  const total = parseInt(searchParams.get('total') || '0')
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="card-glass p-10 max-w-lg w-full text-center space-y-6"
      >
        <div className="text-7xl">
          {pct >= 80 ? '🌟' : pct >= 60 ? '⭐' : '📚'}
        </div>

        <h1 className="text-3xl font-bold glow-text">
          {LEVEL_NAMES[levelId] || `关卡 Lv.${levelId}`}
        </h1>

        <div className="flex items-center justify-center gap-3">
          <span className="text-5xl font-bold text-accent">{correct}</span>
          <span className="text-2xl text-zinc-500">/</span>
          <span className="text-5xl font-bold text-zinc-400">{total}</span>
        </div>

        <p className="text-xl text-zinc-300">
          正确率 <span className={`font-bold ${pct >= 60 ? 'text-green-400' : 'text-yellow-400'}`}>{pct}%</span>
        </p>

        {pct >= 60 ? (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-green-400 font-medium"
          >
            ✅ 下一关已解锁！
          </motion.p>
        ) : (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-yellow-400 text-sm"
          >
            正确率达到 60% 即可解锁下一关，再接再厉！
          </motion.p>
        )}

        <div className="space-y-3 pt-4">
          {pct >= 60 && levelId < 6 && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={() => router.push(`/student/level/${levelId + 1}`)}
              className="w-full py-3 rounded-xl bg-accent/20 border border-accent/40 text-accent font-medium hover:bg-accent/30 transition-colors"
            >
              挑战下一关
            </motion.button>
          )}
          <button
            onClick={() => router.push('/student/dashboard')}
            className="w-full py-3 rounded-xl border border-zinc-600/40 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            返回星图
          </button>
        </div>
      </motion.div>
    </main>
  )
}

export default function StudentResultPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-400 animate-pulse">加载中...</p>
      </main>
    }>
      <ResultContent />
    </Suspense>
  )
}