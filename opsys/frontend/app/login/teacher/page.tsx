'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'

export default function TeacherLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginTeacher } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password) {
      setError('请输入密码')
      return
    }

    setLoading(true)
    try {
      await loginTeacher(password)
      router.replace('/teacher')
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center glow-text mb-2">
          教师登录
        </h1>
        <p className="text-center text-zinc-500 mb-8 text-sm">
          输入授权密码进入教学仪表盘
        </p>

        <form onSubmit={handleSubmit} className="card-glass p-8 space-y-5">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入教师密码"
              className="w-full bg-zinc-800/50 border border-zinc-600/40 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-colors"
              autoFocus
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-accent/25 border border-accent/40 text-accent font-medium hover:bg-accent/35 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '验证中...' : '进入仪表盘'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/')}
            className="w-full text-sm text-zinc-500 hover:text-zinc-300 transition-colors py-2"
          >
            返回首页
          </button>
        </form>
      </motion.div>
    </main>
  )
}