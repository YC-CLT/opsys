'use client'

import { Suspense, useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { apiFetch } from '@/lib/api'

interface StudentRecord {
  questionId: string
  type: string
  difficulty: string
  levelId: number
  stem: string
  isCorrect: boolean
  answeredAt: string
  explanation: string
}

interface StudentDetail {
  studentId: string
  records: StudentRecord[]
}

function DetailContent() {
  const { teacher, loading: authLoading } = useAuth()
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const studentId = id || ''
  const [data, setData] = useState<StudentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong'>('all')

  useEffect(() => {
    if (!authLoading && !teacher) {
      router.replace('/teacher/login')
      return
    }
    if (teacher) {
      loadStudent()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacher, studentId, authLoading])

  const loadStudent = async () => {
    try {
      const res = await apiFetch<StudentDetail>(`/api/teacher/student/${studentId}`, {
        headers: { Authorization: `Bearer ${teacher?.token}` },
      })
      setData(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !teacher) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-400 animate-pulse">加载学生答题记录...</p>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-400 animate-pulse">加载学生答题记录...</p>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error || '加载失败'}</p>
        <button onClick={() => router.push('/teacher/dashboard')} className="text-sm text-accent hover:underline">返回仪表盘</button>
      </main>
    )
  }

  const filtered = data.records.filter((r) => {
    if (filter === 'correct') return r.isCorrect
    if (filter === 'wrong') return !r.isCorrect
    return true
  })

  const correct = data.records.filter((r) => r.isCorrect).length
  const total = data.records.length
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0

  const TYPE_LABEL: Record<string, string> = { choice: '选择', judge: '判断', match: '匹配' }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => router.push('/teacher/dashboard')} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-2">
              ← 返回仪表盘
            </button>
            <h1 className="text-2xl font-bold glow-text">学生详情</h1>
            <p className="text-sm text-zinc-500">学号：{data.studentId}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="card-glass p-4 text-center">
            <p className="text-2xl font-bold text-accent">{total}</p>
            <p className="text-xs text-zinc-500">答题总数</p>
          </div>
          <div className="card-glass p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{correct}</p>
            <p className="text-xs text-zinc-500">正确</p>
          </div>
          <div className="card-glass p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{pct}%</p>
            <p className="text-xs text-zinc-500">正确率</p>
          </div>
        </div>

        <div className="flex gap-1 bg-surface rounded-xl p-1 w-fit">
          {(['all', 'correct', 'wrong'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f ? 'bg-accent/25 text-accent' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {f === 'all' ? '全部' : f === 'correct' ? '正确' : '错误'}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map((r, i) => (
            <motion.div
              key={`${r.questionId}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`card-glass p-4 border-l-2 ${
                r.isCorrect ? 'border-l-green-500' : 'border-l-red-500'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-200">{r.stem}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {TYPE_LABEL[r.type] || r.type}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      Lv.{r.levelId}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {new Date(r.answeredAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                </div>
                <span className={`text-sm font-bold shrink-0 ${r.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {r.isCorrect ? '✓' : '✗'}
                </span>
              </div>
              {!r.isCorrect && r.explanation && (
                <p className="mt-2 text-xs text-zinc-500 italic border-t border-zinc-700/30 pt-2">
                  {r.explanation}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  )
}

export default function TeacherStudentDetail() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-400 animate-pulse">加载中...</p>
      </main>
    }>
      <DetailContent />
    </Suspense>
  )
}