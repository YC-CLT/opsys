'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useQuizData } from '@/hooks/useQuizData'
import ChoiceQuiz from '@/components/quiz/ChoiceQuiz'
import JudgeQuiz from '@/components/quiz/JudgeQuiz'
import MatchQuiz from '@/components/quiz/MatchQuiz'
import QuizResult from '@/components/quiz/QuizResult'
import { useAudio } from '@/components/ui/AudioProvider'
import { useToast } from '@/components/ui/Toast'
import { getStaticRecords } from '@/lib/staticStore'
import ParticleField from '@/components/effects/ParticleField'
import type { ParticleMode } from '@/components/effects/ParticleField'
import TimelineScene from '@/components/scenes/TimelineScene'
import ArchitectureScene from '@/components/scenes/ArchitectureScene'
import SyscallScene from '@/components/scenes/SyscallScene'

function QuizPageContent() {
  const params = useParams()
  const router = useRouter()
  const { student, loading: authLoading } = useAuth()
  const { playSFX } = useAudio()
  const { toast } = useToast()

  const levelId = parseInt(params.id as string)
  const { questions, loading, error, submitAnswer, skipQuestion, mode } = useQuizData(levelId)

  const [currentIndex, setCurrentIndex] = useState(0)

  type QuestionStatus = 'pending' | 'correct' | 'wrong' | 'skipped'
  const [questionsStatus, setQuestionsStatus] = useState<QuestionStatus[]>([])

  const [selectedAnswer, setSelectedAnswer] = useState<string | boolean | Record<string, string> | undefined>()
  const [submittedAnswer, setSubmittedAnswer] = useState<string | boolean | Record<string, string> | undefined>()
  const [result, setResult] = useState<{ correct: boolean; explanation: string } | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [score, setScore] = useState({ correct: 0, total: 0 })
  const prevCorrectRef = useRef(0)
  const [finished, setFinished] = useState(false)
  const [particleMode, setParticleMode] = useState<ParticleMode>('idle')

  useEffect(() => {
    if (!authLoading && !student) {
      router.replace('/student')
      return
    }
  }, [levelId, student, authLoading])

  useEffect(() => {
    if (questions.length > 0) {
      const qIds = new Set(questions.map((q) => q.id))
      const records = getStaticRecords()
      prevCorrectRef.current = records.filter(
        (r) => qIds.has(r.questionId) && r.isCorrect && !r.skipped
      ).length
    }
  }, [questions])

  useEffect(() => {
    if (finished) {
      const totalCorrect = prevCorrectRef.current + score.correct
      router.replace(`/student/result?level=${levelId}&correct=${totalCorrect}&total=${questions.length}`)
    }
  }, [finished, levelId, score.correct, questions.length, router])

  const currentQuestion = questions[currentIndex]

  const handleAnswer = useCallback(async (answer: string | boolean | Record<string, string>) => {
    if (submitting || !currentQuestion) return

    setSelectedAnswer(answer)
    setSubmitting(true)

    try {
      const token = student?.token
      const res = await submitAnswer(currentQuestion.id, answer, token)

      if ('error' in res && res.error === 'already_answered') {
        toast.warn('该题已作答')
        setSubmitting(false)
        handleNext()
        return
      }

      setResult(res)
      setSubmittedAnswer(answer)
      setShowResult(true)
      setScore((prev) => ({
        correct: prev.correct + (res.correct ? 1 : 0),
        total: prev.total + 1,
      }))
      updateQuestionStatus(currentIndex, res.correct ? 'correct' : 'wrong')
      playSFX(res.correct ? '/audio/SUCCESS.mp3' : '/audio/FAIL.wav')
      setParticleMode(res.correct ? 'gather' : 'scatter')
      setTimeout(() => setParticleMode('idle'), 1500)
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      if (message === '该题已作答，不可重复提交') {
        toast.warn('该题已作答')
        setSubmitting(false)
        handleNext()
        return
      }
      console.error('Submit error:', err)
    } finally {
      setSubmitting(false)
    }
  }, [currentQuestion, student, submitting, submitAnswer, playSFX])

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

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedAnswer(undefined)
      setSubmittedAnswer(undefined)
      setResult(null)
      setShowResult(false)
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const handleSkip = () => {
    if (submitting || !currentQuestion) return

    const qId = currentQuestion.id
    skipQuestion(qId)

    updateQuestionStatus(currentIndex, 'skipped')
    setScore((prev) => ({ correct: prev.correct, total: prev.total + 1 }))

    setSelectedAnswer(undefined)
    setSubmittedAnswer(undefined)
    setResult(null)
    setShowResult(false)

    setParticleMode('shiftLeft')
    setTimeout(() => setParticleMode('idle'), 1500)

    if (currentIndex + 1 >= questions.length) {
      setFinished(true)
    } else {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const updateQuestionStatus = (index: number, status: QuestionStatus) => {
    setQuestionsStatus((prev) => {
      const next = [...prev]
      next[index] = status
      return next
    })
  }

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
        <button onClick={() => router.push('/student/dashboard')} className="text-sm text-accent hover:underline">
          返回星图
        </button>
      </main>
    )
  }

  if (finished) {
    return null
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8 gap-6">
      <ParticleField mode={particleMode} />
      {levelId === 2 && <TimelineScene />}
      {levelId === 5 && <ArchitectureScene />}
      {levelId === 6 && <SyscallScene />}
      <div className="w-full max-w-2xl flex items-center justify-between">
        <button
          onClick={() => router.push('/student/dashboard')}
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

      {/* Question navigator dots */}
      <div className="w-full max-w-2xl flex items-center justify-center gap-1.5 flex-wrap">
        {questions.map((q, idx) => {
          const status = questionsStatus[idx]
          const isCurrent = idx === currentIndex
          const isVisited = idx < currentIndex

          return (
            <button
              key={q.id}
              onClick={() => {
                if (idx === currentIndex) return
                setSelectedAnswer(undefined)
                setSubmittedAnswer(undefined)
                setResult(null)
                setShowResult(false)
                setCurrentIndex(idx)
              }}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                isCurrent
                  ? 'bg-accent w-3.5 scale-125'
                  : status === 'correct'
                  ? 'bg-green-500'
                  : status === 'wrong'
                  ? 'bg-red-500'
                  : status === 'skipped'
                  ? 'bg-yellow-500/60'
                  : isVisited
                  ? 'bg-zinc-600'
                  : 'bg-zinc-700'
              }`}
              title={`第 ${idx + 1} 题${status === 'correct' ? ' (✓)' : status === 'wrong' ? ' (✗)' : status === 'skipped' ? ' (已跳过)' : ''}`}
            />
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {currentQuestion && !showResult && (
          <>
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

          {/* Skip & navigation buttons */}
          <div className="w-full max-w-2xl flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← 上一题
            </button>
            <button
              onClick={handleSkip}
              disabled={submitting}
              className="px-4 py-2 text-sm text-yellow-500/70 hover:text-yellow-400 transition-colors disabled:opacity-30"
            >
              跳过 ▸
            </button>
          </div>
        </>
        )}
      </AnimatePresence>

      <div className="w-full max-w-2xl">
        <QuizResult
          correct={result?.correct || false}
          explanation={result?.explanation || ''}
          onNext={handleNext}
          visible={showResult}
        />
      </div>

      {submitting && (
        <div className="text-sm text-zinc-500 animate-pulse">正在提交...</div>
      )}
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