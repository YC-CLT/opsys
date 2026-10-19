'use client'

import { motion } from 'framer-motion'

interface JudgeQuestionProps {
  stem: string
  onAnswer: (answer: boolean) => void
  disabled: boolean
  selectedAnswer?: boolean
  correctAnswer?: boolean
}

export default function JudgeQuestion({ stem, onAnswer, disabled, selectedAnswer, correctAnswer }: JudgeQuestionProps) {
  const getButtonStyle = (value: boolean) => {
    if (selectedAnswer === undefined) return 'border-zinc-600/40 bg-surface hover:bg-surface/70 hover:border-accent/40'
    if (value === correctAnswer) return 'border-green-500/60 bg-green-500/10 text-green-300'
    if (value === selectedAnswer) return 'border-red-500/60 bg-red-500/10 text-red-300'
    return 'border-zinc-600/20 bg-zinc-800/30 opacity-50'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-8"
    >
      <div className="card-glass p-8 text-center">
        <p className="text-xl text-zinc-200 leading-relaxed">{stem}</p>
      </div>

      <div className="flex gap-4 justify-center">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => !disabled && onAnswer(true)}
          disabled={disabled}
          className={`w-40 py-5 rounded-2xl border text-lg font-bold transition-all duration-300 ${getButtonStyle(true)} ${
            disabled ? 'cursor-default' : 'cursor-pointer'
          }`}
        >
          ⭕ 正确
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => !disabled && onAnswer(false)}
          disabled={disabled}
          className={`w-40 py-5 rounded-2xl border text-lg font-bold transition-all duration-300 ${getButtonStyle(false)} ${
            disabled ? 'cursor-default' : 'cursor-pointer'
          }`}
        >
          ❌ 错误
        </motion.button>
      </div>
    </motion.div>
  )
}