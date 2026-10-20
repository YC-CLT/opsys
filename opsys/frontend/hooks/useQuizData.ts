'use client'

import { useState, useEffect, useCallback } from 'react'
import { useModeDetect } from '@/hooks/useModeDetect'
import { apiFetch } from '@/lib/api'
import { getStoredQuestions, storeQuizQuestions, addStaticRecord, addSkipRecord, hasAnswered } from '@/lib/staticStore'
import { checkAnswer, getStaticQuestions } from '@/lib/quiz-engine'
import type { QuestionData } from '@/components/quiz/types'

export function useQuizData(levelId: number) {
  const { mode } = useModeDetect()
  const [questions, setQuestions] = useState<QuestionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!mode) return
    setLoading(true)
    try {
      if (mode === 'static') {
        let qs = getStoredQuestions()
        if (qs && qs.length > 0) {
          qs = qs.filter((q: QuestionData) => q.levelId === levelId)
        }
        if (!qs || qs.length === 0) {
          qs = await getStaticQuestions(levelId) as QuestionData[]
          if (qs && qs.length > 0) {
            storeQuizQuestions(qs)
          }
        }
        setQuestions(qs || [])
      } else {
        const data = await apiFetch<{ questions: QuestionData[] }>(`/api/quiz/${levelId}`)
        setQuestions(data.questions || [])
      }
    } catch (err) {
      if (mode === 'static') {
        setQuestions([])
        setError('静态模式下无可用的题库缓存')
      } else {
        setError(err instanceof Error ? err.message : '加载题库失败')
      }
    } finally {
      setLoading(false)
    }
  }, [mode, levelId])

  useEffect(() => {
    load()
  }, [load])

  const submitAnswer = async (questionId: string, answer: unknown, token?: string) => {
    if (mode === 'static') {
      if (hasAnswered(questionId)) {
        return { error: 'already_answered', correct: false, explanation: '该题已作答' }
      }

      const result = await checkAnswer(questionId, answer)
      if (!result) throw new Error('题目不存在')

      addStaticRecord({
        questionId,
        studentAnswer: answer,
        isCorrect: result.correct,
        skipped: false,
        answeredAt: new Date().toISOString(),
      })
      return result
    }

    return apiFetch<{ correct: boolean; explanation: string }>('/api/quiz/submit', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ questionId, answer }),
    })
  }

  const skipQuestion = (questionId: string) => {
    if (mode === 'static') {
      if (hasAnswered(questionId)) return
      addSkipRecord(questionId)
    }
  }

  return { questions, loading, error, submitAnswer, skipQuestion, reload: load, mode }
}