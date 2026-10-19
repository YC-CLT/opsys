'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useModeDetect } from '@/hooks/useModeDetect'
import { apiFetch } from '@/lib/api'
import ChoiceQuiz from '@/components/quiz/ChoiceQuiz'
import JudgeQuiz from '@/components/quiz/JudgeQuiz'
import MatchQuiz from '@/components/quiz/MatchQuiz'
import QuizFeedback from '@/components/quiz/QuizFeedback'
import Terminal from '@/components/ui/Terminal'
import { useAudio } from '@/components/AudioProvider'

interface QuestionData {
  id: string
  type: 'choice' | 'judge' | 'match'
  difficulty: string
  levelId: number
  content: {
    stem: string
    options?: string[]
    pairs?: { left: string; right: string }[]
  }
  explanation: string
}

interface AnswerResult {
  correct: boolean
  explanation: string
}

function QuizPageContent() {
  const params = useParams()
  const router = useRouter()
  const { student } = useAuth()
  const { mode } = useModeDetect()
  const { playSFX } = useAudio()

  const levelId = parseInt(params.level as string)

  const [questions, setQuestions] = useState<QuestionData[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedAnswer, setSelectedAnswer] = useState<string | boolean | Record<string, string> | undefined>()
  const [submittedAnswer, setSubmittedAnswer] = useState<string | boolean | Record<string, string> | undefined>()
  const [result, setResult] = useState<AnswerResult | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (!student) {
      router.replace('/login/student')
      return
    }
    loadQuestions()
  }, [levelId, student])

  const loadQuestions = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<{ questions: QuestionData[] }>(`/api/quiz/${levelId}`)
      setQuestions(data.questions)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载题库失败')
    } finally {
      setLoading(false)
    }
  }

  const currentQuestion = questions[currentIndex]

  const handleAnswer = useCallback(async (answer: string | boolean | Record<string, string>) => {
    if (submitting) return

    setSelectedAnswer(answer)
    setSubmitting(true)

    try {
      const token = student?.token
      let payload: { questionId: string; answer: unknown }

      if (typeof answer === 'boolean') {
        payload = { questionId: currentQuestion.id, answer }
      } else if (typeof answer === 'object') {
        payload = { questionId: currentQuestion.id, answer }
      } else {
        payload = { questionId: currentQuestion.id, answer }
      }

      const res = await apiFetch<AnswerResult>('/api/quiz/submit', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })

      setResult(res)
      setSubmittedAnswer(answer)
      setShowResult(true)
      setScore((prev) => ({
        correct: prev.correct + (res.correct ? 1 : 0),
        total: prev.total + 1,
      }))
      playSFX(res.correct ? '/audio/SUCCESS.mp3' : '/audio/FAIL.wav')
    } catch (err) {
      console.error('Submit error:', err)
    } finally {
      setSubmitting(false)
    }
  }, [currentQuestion, student, submitting])

  const handleNext = () => {
    setSelectedAnswer(undefined)
    setSubmittedAnswer(undefined)
    setResult(null)
    setShowResult(false)

    if (currentIndex + 1 >= questions.length) {
      setFinished(true)
    } else {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const correctAnswer = currentQuestion ? (result?.correct !== undefined ? (result.correct ? selectedAnswer : undefined) : undefined) : undefined

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-400 animate-pulse">加载关卡 Lv.{levelId} ...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error}</p>
        <button onClick={() => router.push('/student')} className="text-sm text-accent hover:underline">
          返回星图
        </button>
      </main>
    )
  }

  if (finished) {
    const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0
    router.replace(`/student/result?level=${levelId}&correct=${score.correct}&total=${score.total}`)
    return null
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8 gap-6">
      <div className="w-full max-w-2xl flex items-center justify-between">
        <button
          onClick={() => router.push('/student')}
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          ← 返回星图
        </button>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-zinc-500">Lv.{levelId}</span>
          <div className="w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              initial={{ width: `${((currentIndex) / questions.length) * 100}%` }}
              animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-zinc-400 font-mono">{currentIndex + 1}/{questions.length}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentQuestion && !showResult && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="w-full max-w-2xl"
          >
            {currentQuestion.type === 'choice' && (
              <ChoiceQuiz
                stem={currentQuestion.content.stem}
                options={currentQuestion.content.options || []}
                onAnswer={handleAnswer}
                disabled={submitting}
                selectedAnswer={typeof selectedAnswer === 'string' ? selectedAnswer : undefined}
              />
            )}

            {currentQuestion.type === 'judge' && (
              <JudgeQuiz
                stem={currentQuestion.content.stem}
                onAnswer={handleAnswer}
                disabled={submitting}
                selectedAnswer={typeof selectedAnswer === 'boolean' ? selectedAnswer : undefined}
              />
            )}

            {currentQuestion.type === 'match' && (
              <MatchQuiz
                stem={currentQuestion.content.stem}
                pairs={currentQuestion.content.pairs || []}
                answer={(() => {
                  try {
                    return currentQuestion.content.pairs?.reduce((acc, p) => ({ ...acc, [p.left]: p.right }), {}) || {}
                  } catch { return {} }
                })()}
                onAnswer={handleAnswer}
                disabled={submitting}
                submittedAnswer={typeof submittedAnswer === 'object' ? submittedAnswer as Record<string, string> : undefined}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-2xl">
        <QuizFeedback
          correct={result?.correct || false}
          explanation={result?.explanation || ''}
          onNext={handleNext}
          visible={showResult}
        />
      </div>

      {submitting && (
        <div className="text-sm text-zinc-500 animate-pulse">正在提交...</div>
      )}

      <div className="w-full max-w-2xl mt-4 opacity-30">
        <Terminal />
      </div>
    </main>
  )
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-400 animate-pulse">加载中...</p>
      </main>
    }>
      <QuizPageContent />
    </Suspense>
  )
}