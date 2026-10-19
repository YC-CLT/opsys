'use client'

import { useState, useEffect } from 'react'
import { useModeDetect } from '@/hooks/useModeDetect'
import { apiFetch } from '@/lib/api'
import { getStoredQuestions, storeQuizQuestions, addStaticRecord, hasAnswered } from '@/lib/staticStore'
import type { QuestionData } from '@/components/quiz/types'

export function useQuizData(levelId: number) {
  const { mode } = useModeDetect()
  const [questions, setQuestions] = useState<QuestionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!mode) return
    load()
  }, [levelId, mode])

  const load = async () => {
    setLoading(true)
    try {
      if (mode === 'static') {
        let qs = getStoredQuestions()
        if (!qs) {
          const data = await apiFetch<{ questions: QuestionData[] }>(`/api/quiz/${levelId}`)
          qs = data.questions
          storeQuizQuestions(qs)
        }
        setQuestions(qs)
      } else {
        const data = await apiFetch<{ questions: QuestionData[] }>(`/api/quiz/${levelId}`)
        setQuestions(data.questions)
      }
    } catch (err) {
      if (mode === 'static') {
        setQuestions([])
        setError('静态模式下无可用的题库缓存，请先在有网络时加载一次')
      } else {
        setError(err instanceof Error ? err.message : '加载题库失败')
      }
    } finally {
      setLoading(false)
    }
  }

  const submitAnswer = async (questionId: string, answer: unknown, token?: string) => {
    if (mode === 'static') {
      const q = questions.find((q) => q.id === questionId)
      if (!q) throw new Error('题目不存在')

      let isCorrect = false
      if (q.type === 'match') {
        const userMap = answer as Record<string, string>
        const correctMap: Record<string, string> = {}
        q.content.pairs?.forEach((p) => { correctMap[p.left] = p.right })
        isCorrect = Object.keys(correctMap).every((k) => userMap[k] === correctMap[k])
      } else {
        isCorrect = true
      }

      addStaticRecord({ questionId, studentAnswer: answer, isCorrect, answeredAt: new Date().toISOString() })
      return { correct: isCorrect, explanation: q.explanation }
    }

    return apiFetch<{ correct: boolean; explanation: string }>('/api/quiz/submit', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ questionId, answer }),
    })
  }

  return { questions, loading, error, submitAnswer, reload: load }
}