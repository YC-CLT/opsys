'use client'

import { motion } from 'framer-motion'

interface StudentSummary {
  student_id: string
  name: string
  answered: number
  correct: number
  levels_done: number
  accuracy: string
}

interface StudentListProps {
  data: StudentSummary[]
}

export default function StudentList({ data }: StudentListProps) {
  return (
    <motion.div
      key="students"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-2"
    >
      {data.length === 0 && (
        <p className="text-zinc-500 text-center py-8">暂无学生数据</p>
      )}
      {data.map((s) => (
        <div key={s.student_id} className="card-glass p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-zinc-200">{s.name}</p>
            <p className="text-xs text-zinc-500">{s.student_id}</p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-zinc-300">{s.answered}</p>
              <p className="text-xs text-zinc-500">已答</p>
            </div>
            <div className="text-center">
              <p className="text-green-400">{s.correct}</p>
              <p className="text-xs text-zinc-500">正确</p>
            </div>
            <div className="text-center">
              <p className="text-accent font-bold">{s.accuracy}%</p>
              <p className="text-xs text-zinc-500">正确率</p>
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  )
}