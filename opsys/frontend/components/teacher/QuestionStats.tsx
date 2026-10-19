'use client'

import { motion } from 'framer-motion'

interface QuestionStat {
  id: string
  type: string
  levelId: number
  stem: string
  totalAnswers: number
  correctAnswers: number | null
  accuracy: string
}

interface QuestionStatsProps {
  data: QuestionStat[]
}

export default function QuestionStats({ data }: QuestionStatsProps) {
  return (
    <motion.div
      key="questions"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-2"
    >
      {data.map((q) => (
        <div key={q.id} className="card-glass p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-200 truncate">{q.stem}</p>
              <p className="text-xs text-zinc-500 mt-1">
                Lv.{q.levelId} · {q.type === 'choice' ? '选择' : q.type === 'judge' ? '判断' : '匹配'} · {q.totalAnswers} 人次作答
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-sm font-bold ${parseFloat(q.accuracy) >= 60 ? 'text-green-400' : parseFloat(q.accuracy) >= 30 ? 'text-yellow-400' : 'text-red-400'}`}>
                {q.accuracy}%
              </p>
              <p className="text-xs text-zinc-500">
                {q.correctAnswers ?? 0}/{q.totalAnswers} 正确
              </p>
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  )
}