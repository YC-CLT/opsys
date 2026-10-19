'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'

interface Pair {
  left: string
  right: string
}

interface MatchQuestionProps {
  stem: string
  pairs: Pair[]
  answer: Record<string, string>
  onAnswer: (answer: Record<string, string>) => void
  disabled: boolean
  submittedAnswer?: Record<string, string>
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function MatchQuestion({ stem, pairs, answer, onAnswer, disabled, submittedAnswer }: MatchQuestionProps) {
  const leftItems = useMemo(() => pairs.map(p => p.left), [pairs])
  const rightOptions = useMemo(() => shuffle(pairs.map(p => p.right)), [pairs])

  const [selections, setSelections] = useState<Record<string, string>>({})

  useEffect(() => {
    setSelections({})
  }, [pairs])

  const allSelected = leftItems.every(l => selections[l])
  const isSubmitted = !!submittedAnswer

  const handleSelect = (left: string, right: string) => {
    if (disabled || isSubmitted) return
    const next = { ...selections, [left]: right }
    setSelections(next)
  }

  const handleSubmit = () => {
    if (allSelected) {
      onAnswer(selections)
    }
  }

  const getRowStyle = (left: string) => {
    if (!isSubmitted) return ''
    if (answer[left] === selections[left]) return 'border-green-500/30 bg-green-500/5'
    return 'border-red-500/30 bg-red-500/5'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-5"
    >
      <div className="card-glass p-5">
        <p className="text-sm text-zinc-400 mb-1">拖拽匹配题</p>
        <p className="text-lg text-zinc-200 leading-relaxed">{stem}</p>
      </div>

      <div className="space-y-2">
        {leftItems.map((left, i) => (
          <motion.div
            key={left}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${getRowStyle(left)} ${
              isSubmitted ? '' : 'border-zinc-700/30 bg-surface/50'
            }`}
          >
            <div className="w-1/2 bg-accent/10 border border-accent/20 rounded-lg px-4 py-3 text-sm text-zinc-200 font-medium">
              {left}
            </div>

            <span className="text-zinc-600 text-sm">→</span>

            <select
              value={selections[left] || ''}
              onChange={(e) => handleSelect(left, e.target.value)}
              disabled={disabled || isSubmitted}
              className={`w-1/2 bg-zinc-800/60 border rounded-lg px-3 py-3 text-sm transition-colors ${
                isSubmitted
                  ? selections[left] === answer[left]
                    ? 'border-green-500/50 text-green-300'
                    : 'border-red-500/50 text-red-300'
                  : 'border-zinc-600/40 text-zinc-300 focus:border-accent/50'
              }`}
            >
              <option value="">选择匹配项...</option>
              {rightOptions.map((right) => (
                <option key={right} value={right}>
                  {right}
                </option>
              ))}
            </select>

            {isSubmitted && selections[left] !== answer[left] && (
              <span className="text-xs text-green-400/80 min-w-[100px]">
                正确: {answer[left]}
              </span>
            )}
          </motion.div>
        ))}
      </div>

      {!isSubmitted && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleSubmit}
          disabled={!allSelected || disabled}
          className="w-full py-3 rounded-xl bg-accent/20 border border-accent/40 text-accent font-medium hover:bg-accent/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {allSelected ? '提交匹配' : `请完成全部 ${leftItems.length} 项匹配`}
        </motion.button>
      )}
    </motion.div>
  )
}