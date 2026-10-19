'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'

interface Pair {
  left: string
  right: string
}

interface MatchQuizProps {
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

const COLORS = [
  'border-blue-500/50 bg-blue-500/10 text-blue-300',
  'border-emerald-500/50 bg-emerald-500/10 text-emerald-300',
  'border-amber-500/50 bg-amber-500/10 text-amber-300',
  'border-purple-500/50 bg-purple-500/10 text-purple-300',
  'border-rose-500/50 bg-rose-500/10 text-rose-300',
  'border-cyan-500/50 bg-cyan-500/10 text-cyan-300',
]

export default function MatchQuiz({ stem, pairs, answer, onAnswer, disabled, submittedAnswer }: MatchQuizProps) {
  const leftItems = useMemo(() => pairs.map(p => p.left), [pairs])
  const rightOptions = useMemo(() => shuffle(pairs.map(p => p.right)), [pairs])

  const [selections, setSelections] = useState<Record<string, string>>({})
  const [dragLeft, setDragLeft] = useState<string | null>(null)
  const [hoverRight, setHoverRight] = useState<string | null>(null)

  useEffect(() => {
    setSelections({})
  }, [pairs])

  const isSubmitted = !!submittedAnswer
  const allSelected = leftItems.every(l => selections[l])

  const makeMatch = (left: string, right: string) => {
    if (disabled || isSubmitted) return
    const prevLeft = Object.entries(selections).find(([, v]) => v === right)?.[0]
    const next = { ...selections, [left]: right }
    if (prevLeft && prevLeft !== left) delete next[prevLeft]
    setSelections(next)
  }

  const removeMatch = (left: string) => {
    if (disabled || isSubmitted) return
    const next = { ...selections }
    delete next[left]
    setSelections(next)
  }

  const handleSubmit = () => {
    if (allSelected) onAnswer(selections)
  }

  const handleDragStart = (left: string) => setDragLeft(left)
  const handleDragEnd = () => { setDragLeft(null); setHoverRight(null) }

  const handleDragOver = (e: React.DragEvent) => e.preventDefault()

  const handleDrop = (right: string) => {
    if (dragLeft) makeMatch(dragLeft, right)
    setDragLeft(null)
    setHoverRight(null)
  }

  const getColorIndex = (left: string) => {
    const idx = leftItems.indexOf(left)
    return idx >= 0 ? idx % COLORS.length : 0
  }

  const getLeftForRight = (right: string) =>
    Object.entries(selections).find(([, v]) => v === right)?.[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-5"
    >
      <div className="card-glass p-5">
        <p className="text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">拖拽匹配题</p>
        <p className="text-lg text-zinc-200 leading-relaxed">{stem}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-xs text-zinc-500 font-medium mb-2">左边项（拖拽到右边匹配）</p>
          {leftItems.map((left, i) => {
            const matched = !!selections[left]
            return (
              <motion.div
                key={left}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                draggable={!disabled && !isSubmitted}
                onDragStart={() => handleDragStart(left)}
                onDragEnd={handleDragEnd}
                onDoubleClick={() => removeMatch(left)}
                className={[
                  'relative p-3 rounded-xl border cursor-grab active:cursor-grabbing transition-all select-none',
                  matched
                    ? `${COLORS[getColorIndex(left)]} opacity-50`
                    : 'border-zinc-700/40 bg-surface/60 hover:border-accent/40 text-zinc-200',
                  dragLeft === left ? 'opacity-30 scale-95' : '',
                ].join(' ')}
                title={matched ? '双击取消匹配' : '拖拽到右侧匹配'}
              >
                <span className="text-sm font-medium">{left}</span>
                {matched && (
                  <span className="absolute top-1 right-2 text-[10px] opacity-60">
                    已匹配 → {selections[left]}
                  </span>
                )}
              </motion.div>
            )
          })}
        </div>

        <div className="space-y-2">
          <p className="text-xs text-zinc-500 font-medium mb-2">
            右边选项
            <span className="ml-2 font-normal text-zinc-600">
              {Object.keys(selections).length}/{leftItems.length} 已匹配
            </span>
          </p>
          {rightOptions.map((right, i) => {
            const left = getLeftForRight(right)
            const matched = !!left
            const colorIdx = left ? getColorIndex(left) : -1
            return (
              <motion.div
                key={right}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onDragEnter={() => setHoverRight(right)}
                onDragLeave={() => { if (hoverRight === right) setHoverRight(null) }}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(right)}
                className={[
                  'relative p-3 rounded-xl border transition-all select-none',
                  matched
                    ? COLORS[colorIdx]
                    : hoverRight === right
                      ? 'border-accent/60 bg-accent/10'
                      : 'border-zinc-700/40 bg-surface/60 text-zinc-200',
                  dragLeft && !isSubmitted ? 'border-dashed' : 'border-solid',
                ].join(' ')}
              >
                <span className="text-sm">{right}</span>
                {matched && left && (
                  <span className="absolute top-1 right-2 text-[10px] opacity-60">
                    ← {left}
                  </span>
                )}
                {hoverRight === right && !matched && (
                  <span className="absolute inset-0 flex items-center justify-center text-xs text-accent/60">
                    释放以匹配
                  </span>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {isSubmitted && (
        <div className="space-y-2">
          {leftItems.map((left) => {
            const correct = answer[left] === selections[left]
            return (
              <div
                key={left}
                className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${
                  correct ? 'border-green-500/30 bg-green-500/5 text-green-300' : 'border-red-500/30 bg-red-500/5 text-red-300'
                }`}
              >
                <span className="font-medium">{left}</span>
                <span>→</span>
                <span>{selections[left] || '未作答'}</span>
                {!correct && <span className="ml-auto text-green-400/70 text-xs">正确: {answer[left]}</span>}
              </div>
            )
          })}
        </div>
      )}

      {!isSubmitted && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleSubmit}
          disabled={!allSelected || disabled}
          className="w-full py-3 rounded-xl bg-accent/20 border border-accent/40 text-accent font-medium hover:bg-accent/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {allSelected ? '提交匹配' : `请拖拽完成全部 ${leftItems.length} 项匹配`}
        </motion.button>
      )}
    </motion.div>
  )
}