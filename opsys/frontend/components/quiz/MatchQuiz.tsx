'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
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
  { stroke: '#3b82f6', bg: 'bg-blue-500/10', border: 'border-blue-500', text: 'text-blue-300', dot: 'bg-blue-500' },
  { stroke: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500', text: 'text-emerald-300', dot: 'bg-emerald-500' },
  { stroke: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500', text: 'text-amber-300', dot: 'bg-amber-500' },
  { stroke: '#a855f7', bg: 'bg-purple-500/10', border: 'border-purple-500', text: 'text-purple-300', dot: 'bg-purple-500' },
  { stroke: '#f43f5e', bg: 'bg-rose-500/10', border: 'border-rose-500', text: 'text-rose-300', dot: 'bg-rose-500' },
  { stroke: '#06b6d4', bg: 'bg-cyan-500/10', border: 'border-cyan-500', text: 'text-cyan-300', dot: 'bg-cyan-500' },
]

type LineData = { x1: number; y1: number; x2: number; y2: number; color: string }

export default function MatchQuiz({ stem, pairs, answer, onAnswer, disabled, submittedAnswer }: MatchQuizProps) {
  const leftItems = useMemo(() => pairs.map(p => p.left), [pairs])
  const rightOptions = useMemo(() => shuffle(pairs.map(p => p.right)), [pairs])

  const [selections, setSelections] = useState<Record<string, string>>({})
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [lines, setLines] = useState<LineData[]>([])

  const leftRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const rightRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const rowsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSelections({})
    setSelectedLeft(null)
  }, [pairs])

  const isSubmitted = !!submittedAnswer
  const allSelected = leftItems.every(l => selections[l])
  const colorIdx = (left: string) => leftItems.indexOf(left) % COLORS.length

  const updateLines = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const cr = container.getBoundingClientRect()
    const newLines: LineData[] = []
    for (const left of leftItems) {
      const right = selections[left]
      if (!right) continue
      const le = leftRefs.current[left]
      const re = rightRefs.current[right]
      if (!le || !re) continue
      const lr = le.getBoundingClientRect()
      const rr = re.getBoundingClientRect()
      const ci = leftItems.indexOf(left) % COLORS.length
      newLines.push({
        x1: lr.right - cr.left,
        y1: lr.top + lr.height / 2 - cr.top,
        x2: rr.left - cr.left,
        y2: rr.top + rr.height / 2 - cr.top,
        color: COLORS[ci].stroke,
      })
    }
    setLines(newLines)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftItems, selections])

  useEffect(() => {
    const timer = requestAnimationFrame(updateLines)
    window.addEventListener('resize', updateLines)
    return () => {
      cancelAnimationFrame(timer)
      window.removeEventListener('resize', updateLines)
    }
  }, [updateLines])

  useEffect(() => {
    if (isSubmitted) updateLines()
  }, [isSubmitted, updateLines])

  const makeMatch = (left: string, right: string) => {
    if (disabled || isSubmitted) return
    const existingLeftForRight = Object.entries(selections).find(([, v]) => v === right)?.[0]
    const next = { ...selections, [left]: right }
    if (existingLeftForRight && existingLeftForRight !== left) delete next[existingLeftForRight]
    setSelections(next)
    setSelectedLeft(null)
    requestAnimationFrame(updateLines)
  }

  const handleLeftClick = (left: string) => {
    if (disabled || isSubmitted) return
    if (selections[left]) {
      const next = { ...selections }
      delete next[left]
      setSelections(next)
      setSelectedLeft(null)
      requestAnimationFrame(updateLines)
      return
    }
    setSelectedLeft(prev => prev === left ? null : left)
  }

  const handleRightClick = (right: string) => {
    if (disabled || isSubmitted) return
    if (!selectedLeft) {
      const existingLeft = Object.entries(selections).find(([, v]) => v === right)?.[0]
      if (existingLeft) {
        const next = { ...selections }
        delete next[existingLeft]
        setSelections(next)
        requestAnimationFrame(updateLines)
      }
      return
    }
    makeMatch(selectedLeft, right)
  }

  const handleSubmit = () => {
    if (allSelected) onAnswer(selections)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-5"
    >
      <div className="card-glass p-5">
        <p className="text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">连线匹配题</p>
        <p className="text-lg text-zinc-200 leading-relaxed">{stem}</p>
        {!isSubmitted && (
          <p className="text-xs text-zinc-500 mt-2">
            {selectedLeft
              ? `已选中「${selectedLeft}」→ 点击右侧选项完成匹配`
              : '点击左侧项，再点击右侧选项完成连线匹配'}
          </p>
        )}
      </div>

      <div ref={containerRef} className="relative">
        {/* SVG lines */}
        <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%', zIndex: 5 }}>
          {lines.map((l, i) => (
            <line
              key={i}
              x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke={l.color}
              strokeWidth={2.5}
              opacity={0.6}
            />
          ))}
        </svg>

        <div ref={rowsRef} className="flex gap-8 items-start">
          {/* Left column */}
          <div className="flex-1 space-y-3">
            {leftItems.map((left) => {
              const matched = !!selections[left]
              const isSelected = selectedLeft === left
              const ci = colorIdx(left)
              return (
                <div
                  key={left}
                  ref={el => { leftRefs.current[left] = el }}
                  onClick={() => handleLeftClick(left)}
                  className={[
                    'relative px-4 py-3 rounded-xl border-2 transition-all select-none cursor-pointer',
                    matched
                      ? `${COLORS[ci].border} ${COLORS[ci].bg}`
                      : isSelected
                        ? 'border-accent bg-accent/15 ring-1 ring-accent/50 scale-[1.02]'
                        : 'border-zinc-700/40 bg-surface/60 hover:border-zinc-500/60',
                    matched ? 'text-zinc-200' : 'text-zinc-200',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${matched ? COLORS[ci].dot : 'bg-zinc-500'}`}
                    />
                    <span className="text-sm font-medium">{left}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right column */}
          <div className="flex-1 space-y-3">
            {rightOptions.map((right) => {
              const existingLeft = Object.entries(selections).find(([, v]) => v === right)?.[0]
              const matched = !!existingLeft
              const ci = existingLeft ? colorIdx(existingLeft) : -1
              return (
                <div
                  key={right}
                  ref={el => { rightRefs.current[right] = el }}
                  onClick={() => handleRightClick(right)}
                  className={[
                    'relative px-4 py-3 rounded-xl border-2 transition-all select-none cursor-pointer',
                    matched
                      ? `${COLORS[ci].border} ${COLORS[ci].bg}`
                      : selectedLeft
                        ? 'border-dashed border-accent/40 bg-accent/5 hover:bg-accent/10 text-zinc-200'
                        : 'border-zinc-700/40 bg-surface/60 hover:border-zinc-500/60 text-zinc-200',
                  ].join(' ')}
                >
                  <span className="text-sm">{right}</span>
                  {matched && existingLeft && (
                    <span className={`absolute top-1 right-2 text-[10px] opacity-60 ${COLORS[ci].text}`}>
                      ← {existingLeft}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
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
          {allSelected ? '提交匹配' : `请完成全部 ${leftItems.length} 项匹配`}
        </motion.button>
      )}
    </motion.div>
  )
}