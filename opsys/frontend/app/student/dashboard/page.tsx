'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useAuth } from '@/hooks/useAuth'
import { useAudio } from '@/components/ui/AudioProvider'
import Terminal from '@/components/ui/Terminal'

const StarMap = dynamic(() => import('@/components/ui/StarMap'), { ssr: false })

const LEVEL_NAMES = ['', '第一章·引论', '发展历程', '基本特性', '运行环境', '体系结构', '系统调用']

export default function StudentDashboard() {
  const { student, logout } = useAuth()
  const { playBGM } = useAudio()
  const router = useRouter()

  useEffect(() => {
    if (!student) {
      router.replace('/student')
    }
  }, [student, router])

  useEffect(() => {
    playBGM('/audio/bg1.mp3', 1)
  }, [])

  if (!student) return null

  const progress = student.progress || []

  const handleSelectLevel = (level: number) => {
    const unlocked = level === 1 || progress.includes(level - 1)
    if (unlocked) {
      router.push(`/student/level/${level}`)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8 gap-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold glow-text">OS Challenge</h1>
          <p className="text-sm text-zinc-500">欢迎，{student.name}（{student.studentId}）</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 rounded-lg border border-zinc-600/40 text-zinc-400 text-sm hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
        >
          退出登录
        </button>
      </motion.div>

      {/* Star Map */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-4xl card-glass overflow-hidden"
      >
        <div className="p-4 border-b border-zinc-700/30">
          <h2 className="text-sm text-zinc-400 font-mono">
            {'>'} 星图导航 — 选择关卡
          </h2>
        </div>
        <StarMap progress={progress} onSelectLevel={handleSelectLevel} />
      </motion.div>

      {/* Progress Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-3 gap-3"
      >
        {Array.from({ length: 6 }, (_, i) => i + 1).map((level) => {
          const completed = progress.includes(level)
          const unlocked = level === 1 || progress.includes(level - 1)
          return (
            <button
              key={level}
              onClick={() => handleSelectLevel(level)}
              disabled={!unlocked}
              className={`p-4 rounded-xl border text-left transition-all ${
                completed
                  ? 'border-accent/50 bg-accent/10'
                  : unlocked
                  ? 'border-zinc-600/40 bg-surface hover:bg-surface/70'
                  : 'border-zinc-700/20 bg-zinc-800/20 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{completed ? '⭐' : unlocked ? '🌙' : '🔒'}</span>
                <div>
                  <p className={`text-sm font-medium ${completed ? 'text-accent' : 'text-zinc-300'}`}>
                    Lv.{level} {LEVEL_NAMES[level]}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {completed ? '已完成' : unlocked ? '可挑战' : '未解锁'}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </motion.div>

      {/* Terminal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="w-full max-w-4xl"
      >
        <Terminal userName={student.name} studentId={student.studentId} />
      </motion.div>
    </main>
  )
}