'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { apiFetch } from '@/lib/api'
import OverviewCards from '@/components/teacher/OverviewCards'
import LevelSummary from '@/components/teacher/LevelSummary'
import StudentList from '@/components/teacher/StudentList'
import QuestionStats from '@/components/teacher/QuestionStats'

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

interface LevelSummaryItem {
  levelId: number
  studentCount: number
  accuracy: string
}

interface Overview {
  studentCount: number
  students: StudentSummary[]
  overallAccuracy: string
  questionStats: QuestionStat[]
  levelSummaries: LevelSummaryItem[]
}

export default function TeacherDashboard() {
  const { teacher, logout } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'questions'>('overview')

  useEffect(() => {
    if (!teacher) {
      router.replace('/teacher/login')
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

        <OverviewCards
          studentCount={data.studentCount}
          overallAccuracy={data.overallAccuracy}
          levelCount={data.levelSummaries.length}
          questionCount={data.questionStats.length}
        />

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

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && <LevelSummary data={data.levelSummaries} />}
          {activeTab === 'students' && <StudentList data={data.students} />}
          {activeTab === 'questions' && <QuestionStats data={data.questionStats} />}
        </AnimatePresence>
      </div>
    </main>
  )
}