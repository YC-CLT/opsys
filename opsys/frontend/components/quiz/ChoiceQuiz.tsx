'use client'

import { motion } from 'framer-motion'

interface ChoiceQuizProps {
  stem: string
  options: string[]
  onAnswer: (answer: string) => void
  disabled: boolean
  selectedAnswer?: string
  correctAnswer?: string
}

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

export default function ChoiceQuiz({ stem, options, onAnswer, disabled, selectedAnswer, correctAnswer }: ChoiceQuizProps) {
  const getOptionStyle = (index: number) => {
    const label = LABELS[index]
    if (!selectedAnswer) return 'border-zinc-600/40 bg-surface hover:bg-surface/70 hover:border-accent/40'
    if (label === correctAnswer) return 'border-green-500/60 bg-green-500/10 text-green-300'
    if (label === selectedAnswer && label !== correctAnswer) return 'border-red-500/60 bg-red-500/10 text-red-300'
    return 'border-zinc-600/20 bg-zinc-800/30 opacity-50'
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      <div className="card-glass p-6">
        <p className="text-lg text-zinc-200 leading-relaxed">{stem}</p>
      </div>

      <div className="space-y-3">
        {options.map((opt, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => !disabled && onAnswer(LABELS[i])}
            disabled={disabled}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${getOptionStyle(i)} ${
              disabled ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-accent/20 text-accent text-sm font-bold mr-3">
              {LABELS[i]}
            </span>
            <span className="text-sm">{opt}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}