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
  { border: 'border-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-300', stroke: '#3b82f6' },
  { border: 'border-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-300', stroke: '#10b981' },
  { border: 'border-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-300', stroke: '#f59e0b' },
  { border: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-300', stroke: '#a855f7' },
  { border: 'border-rose-500', bg: 'bg-rose-500/10', text: 'text-rose-300', stroke: '#f43f5e' },
  { border: 'border-cyan-500', bg: 'bg-cyan-500/10', text: 'text-cyan-300', stroke: '#06b6d4' },
]

type LineData = { x1: number; y1: number; x2: number; y2: number }

export default function MatchQuiz({ stem, pairs, answer, onAnswer, disabled, submittedAnswer }: MatchQuizProps) {
  const leftItems = useMemo(() => pairs.map(p => p.left), [pairs])
  const rightOptions = useMemo(() => shuffle(pairs.map(p => p.right)), [pairs])

  const [selections, setSelections] = useState<Record<string, string>>({})
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [lines, setLines] = useState<LineData[]>([])

  const leftRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const rightRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSelections({})
    setSelectedLeft(null)
  }, [pairs])

  const isSubmitted = !!submittedAnswer
  const allSelected = leftItems.every(l => selections[l])

  const updateLines = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const containerRect = container.getBoundingClientRect()
    const newLines: LineData[] = []
    for (const left of leftItems) {
      const right = selections[left]
      if (!right) continue
      const le = leftRefs.current[left]
      const re = rightRefs.current[right]
      if (!le || !re) continue
      const lr = le.getBoundingClientRect()
      const rr = re.getBoundingClientRect()
      newLines.push({
        x1: lr.right - containerRect.left,
        y1: lr.top + lr.height / 2 - containerRect.top,
        x2: rr.left - containerRect.left,
        y2: rr.top + rr.height / 2 - containerRect.top,
      })
    }
    setLines(newLines)
  }, [leftItems, selections])

  useEffect(() => {
    updateLines()
    window.addEventListener('resize', updateLines)
    return () => window.removeEventListener('resize', updateLines)
  }, [updateLines])

  useEffect(() => {
    if (isSubmitted) updateLines()
  }, [isSubmitted, updateLines])

  const makeMatch = (left: string, right: string) => {
    if (disabled || isSubmitted) return
    const prevLeft = Object.entries(selections).find(([, v]) => v === right)?.[0]
    const next = { ...selections, [left]: right }
    if (prevLeft && prevLeft !== left) delete next[prevLeft]
    setSelections(next)
    setSelectedLeft(null)
    requestAnimationFrame(updateLines)
  }

  const removeMatch = (left: string) => {
    if (disabled || isSubmitted) return
    const next = { ...selections }
    delete next[left]
    setSelections(next)
    requestAnimationFrame(updateLines)
  }

  const handleSubmit = () => {
    if (allSelected) onAnswer(selections)
  }

  const handleLeftClick = (left: string) => {
    if (disabled || isSubmitted) return
    if (selections[left]) {
      removeMatch(left)
      return
    }
    setSelectedLeft(prev => prev === left ? null : left)
  }

  const handleRightClick = (right: string) => {
    if (disabled || isSubmitted) return
    if (selectedLeft) {
      makeMatch(selectedLeft, right)
      return
    }
    const existingLeft = Object.entries(selections).find(([, v]) => v === right)?.[0]
    if (existingLeft) {
      removeMatch(existingLeft)
      return
    }
  }

  const handleDragStart = (left: string, e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', left)
    e.dataTransfer.effectAllowed = 'link'
    setSelectedLeft(null)
  }

  const handleRightDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'link'
  }

  const handleRightDrop = (right: string, e: React.DragEvent) => {
    e.preventDefault()
    const left = e.dataTransfer.getData('text/plain')
    if (left && leftItems.includes(left)) {
      makeMatch(left, right)
    }
  }

  const getColorIdx = (left: string) => leftItems.indexOf(left) % COLORS.length

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
              : '点击左侧项 → 再点右侧项匹配，或直接拖拽左侧到右侧'}
          </p>
        )}
      </div>

      <div ref={containerRef} className="relative grid grid-cols-[1fr_60px_1fr] gap-2">
        {/* SVG lines overlay */}
        <svg className="absolute inset-0 pointer-events-none z-10" style={{ width: '100%', height: '100%' }}>
          {lines.map((l, i) => (
            <line
              key={i}
              x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke={COLORS[leftItems.indexOf(Object.keys(selections)[i]) % COLORS.length]?.stroke ?? '#6b7280'}
              strokeWidth={2}
              strokeDasharray={isSubmitted ? '0' : '6 3'}
              opacity={0.7}
            />
          ))}
        </svg>

        {/* Left column */}
        <div className="space-y-2 relative z-20">
          {leftItems.map((left, i) => {
            const matched = !!selections[left]
            const isSelected = selectedLeft === left
            const ci = getColorIdx(left)
            return (
              <div
                key={left}
                ref={el => { leftRefs.current[left] = el }}
                draggable={!disabled && !isSubmitted}
                onDragStart={e => handleDragStart(left, e)}
                onClick={() => handleLeftClick(left)}
                className={[
                  'relative p-3 rounded-xl border-2 transition-all select-none cursor-pointer',
                  matched
                    ? `${COLORS[ci].border} ${COLORS[ci].bg}`
                    : isSelected
                      ? 'border-accent bg-accent/15 ring-1 ring-accent/50'
                      : 'border-zinc-700/40 bg-surface/60 hover:border-zinc-500/60',
                  matched ? 'opacity-80' : 'text-zinc-200',
                  isSelected ? 'scale-[1.02]' : '',
                ].join(' ')}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${matched ? `bg-${COLORS[ci].stroke.replace('#', '')}` : 'bg-zinc-600'}`} style={matched ? { backgroundColor: COLORS[ci].stroke } : {}} />
                  <span className="text-sm font-medium">{left}</span>
                </div>
                {matched && (
                  <span className={`absolute top-1 right-2 text-[10px] opacity-60 ${COLORS[ci].text}`}>
                    → {selections[left]}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Center column: connection indicator */}
        <div className="flex flex-col items-center justify-center gap-2">
          {leftItems.map((left) => {
            const matched = !!selections[left]
            return (
              <div key={left} className="flex items-center justify-center h-[52px]">
                <span className={`text-lg ${matched ? 'opacity-70' : 'opacity-20'}`}>
                  {matched ? '─●─' : '───'}
                </span>
              </div>
            )
          })}
        </div>

        {/* Right column */}
        <div className="space-y-2 relative z-20">
          {rightOptions.map((right, i) => {
            const existingLeft = Object.entries(selections).find(([, v]) => v === right)?.[0]
            const matched = !!existingLeft
            const ci = existingLeft ? getColorIdx(existingLeft) : -1
            return (
              <div
                key={right}
                ref={el => { rightRefs.current[right] = el }}
                onDragOver={handleRightDragOver}
                onDrop={e => handleRightDrop(right, e)}
                onClick={() => handleRightClick(right)}
                className={[
                  'relative p-3 rounded-xl border-2 transition-all select-none cursor-pointer',
                  matched
                    ? `${COLORS[ci].border} ${COLORS[ci].bg}`
                    : selectedLeft
                      ? 'border-dashed border-accent/50 bg-accent/5 hover:bg-accent/10 text-zinc-200'
                      : 'border-zinc-700/40 bg-surface/60 hover:border-zinc-500/60 text-zinc-200',
                  selectedLeft ? 'scale-[1.02]' : '',
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