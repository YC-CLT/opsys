'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { apiFetch } from '@/lib/api'

interface StudentSummary {
  student_id: string
  name: string
  answered: number
  correct: number
  levels_done: number
  accuracy: string
}

interface QuestionStat {
  id: string
  type: string
  levelId: number
  stem: string
  totalAnswers: number
  correctAnswers: number | null
  accuracy: string
}

interface LevelSummary {
  levelId: number
  studentCount: number
  accuracy: string
}

interface Overview {
  studentCount: number
  students: StudentSummary[]
  overallAccuracy: string
  questionStats: QuestionStat[]
  levelSummaries: LevelSummary[]
}

const LEVEL_NAMES = ['', '引论', '发展历程', '基本特性', '运行环境', '体系结构', '系统调用']

export default function TeacherDashboard() {
  const { teacher, logout } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'questions'>('overview')

  useEffect(() => {
    if (!teacher) {
      router.replace('/login/teacher')
      return
    }
    loadData()
  }, [teacher])

  const loadData = async () => {
    try {
      const res = await apiFetch<Overview>('/api/teacher/overview', {
        headers: { Authorization: `Bearer ${teacher?.token}` },
      })
      setData(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-400 animate-pulse">加载仪表盘数据...</p>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error || '加载失败'}</p>
        <button onClick={loadData} className="text-sm text-accent hover:underline">重试</button>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold glow-text">教师仪表盘</h1>
            <p className="text-sm text-zinc-500">OS Challenge — 教学数据总览</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg border border-zinc-600/40 text-zinc-400 text-sm hover:text-zinc-200 transition-colors"
          >
            退出登录
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card-glass p-4 text-center">
            <p className="text-2xl font-bold text-accent">{data.studentCount}</p>
            <p className="text-xs text-zinc-500 mt-1">参与学生</p>
          </div>
          <div className="card-glass p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{data.overallAccuracy}%</p>
            <p className="text-xs text-zinc-500 mt-1">整体正确率</p>
          </div>
          <div className="card-glass p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{data.levelSummaries.length}</p>
            <p className="text-xs text-zinc-500 mt-1">关卡数量</p>
          </div>
          <div className="card-glass p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{data.questionStats.length}</p>
            <p className="text-xs text-zinc-500 mt-1">题目总数</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface rounded-xl p-1 w-fit">
          {(['overview', 'students', 'questions'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-accent/25 text-accent'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab === 'overview' ? '关卡总览' : tab === 'students' ? '学生列表' : '题目统计'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {data.levelSummaries.map((lv) => (
                <div key={lv.levelId} className="card-glass p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-zinc-200">Lv.{lv.levelId} {LEVEL_NAMES[lv.levelId]}</p>
                    <p className="text-xs text-zinc-500">{lv.studentCount} 名学生参与</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-accent">{lv.accuracy}%</p>
                    <p className="text-xs text-zinc-500">正确率</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'students' && (
            <motion.div
              key="students"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              {data.students.length === 0 && (
                <p className="text-zinc-500 text-center py-8">暂无学生数据</p>
              )}
              {data.students.map((s) => (
                <div key={s.student_id} className="card-glass p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-zinc-200">{s.name}</p>
                    <p className="text-xs text-zinc-500">{s.student_id}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-zinc-300">{s.answered}</p>
                      <p className="text-xs text-zinc-500">已答</p>
                    </div>
                    <div className="text-center">
                      <p className="text-green-400">{s.correct}</p>
                      <p className="text-xs text-zinc-500">正确</p>
                    </div>
                    <div className="text-center">
                      <p className="text-accent font-bold">{s.accuracy}%</p>
                      <p className="text-xs text-zinc-500">正确率</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'questions' && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              {data.questionStats.map((q) => (
                <div key={q.id} className="card-glass p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-200 truncate">{q.stem}</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Lv.{q.levelId} · {q.type === 'choice' ? '选择' : q.type === 'judge' ? '判断' : '匹配'} · {q.totalAnswers} 人次作答
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-bold ${parseFloat(q.accuracy) >= 60 ? 'text-green-400' : parseFloat(q.accuracy) >= 30 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {q.accuracy}%
                      </p>
                      <p className="text-xs text-zinc-500">
                        {q.correctAnswers ?? 0}/{q.totalAnswers} 正确
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}