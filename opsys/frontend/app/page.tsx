'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Terminal from '@/components/ui/Terminal'
import { useModeDetect } from '@/hooks/useModeDetect'

export default function Home() {
  const { mode, loading } = useModeDetect()
  const router = useRouter()
  const [role, setRole] = useState<'student' | 'teacher'>('student')

  const handleEnter = () => {
    if (role === 'student') {
      router.push('/student')
    } else {
      router.push('/teacher/login')
    }
  }

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
        <Terminal />
      </motion.div>

      {loading ? (
        <p className="text-zinc-500 text-sm animate-pulse">正在检测运行模式...</p>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex gap-4"
          >
            <motion.button
              onClick={() => setRole('student')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 px-6 py-5 rounded-2xl border-2 transition-all text-left ${
                role === 'student'
                  ? 'border-accent/60 bg-accent/10 shadow-lg shadow-accent/10'
                  : 'border-zinc-700/40 bg-surface/50 hover:bg-surface/70'
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">🎓</span>
                <span className={`font-bold ${role === 'student' ? 'text-accent' : 'text-zinc-300'}`}>学生入口</span>
              </div>
              <p className="text-xs text-zinc-500">学号 + 姓名登录，开启闯关学习</p>
            </motion.button>

            <motion.button
              onClick={() => setRole('teacher')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 px-6 py-5 rounded-2xl border-2 transition-all text-left ${
                role === 'teacher'
                  ? 'border-accent/60 bg-accent/10 shadow-lg shadow-accent/10'
                  : 'border-zinc-700/40 bg-surface/50 hover:bg-surface/70'
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">📊</span>
                <span className={`font-bold ${role === 'teacher' ? 'text-accent' : 'text-zinc-300'}`}>教师入口</span>
              </div>
              <p className="text-xs text-zinc-500">密码登录，查看班级数据</p>
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col items-center gap-3"
          >
            <p className="text-xs text-zinc-500">
              {role === 'student'
                ? '不是学生？点击教师卡片切换身份'
                : '不是老师？点击学生卡片切换身份'}
            </p>
            <button
              onClick={handleEnter}
              className="px-10 py-3 rounded-xl bg-accent/25 border border-accent/40 text-accent font-medium hover:bg-accent/35 transition-colors"
            >
              {role === 'student' ? '开始闯关' : '进入仪表盘'}
            </button>
          </motion.div>
        </>
      )}

      <p className="text-xs text-zinc-600 mt-4">
        运行模式：{loading ? '检测中...' : mode === 'live' ? '🟢 在线模式' : '🟡 静态模式'}
      </p>
    </main>
  )
}