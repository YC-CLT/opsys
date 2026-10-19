'use client'

import { motion } from 'framer-motion'

interface LevelSummaryItem {
  levelId: number
  studentCount: number
  accuracy: string
}

const LEVEL_NAMES = ['', '引论', '发展历程', '基本特性', '运行环境', '体系结构', '系统调用']

interface LevelSummaryProps {
  data: LevelSummaryItem[]
}

export default function LevelSummary({ data }: LevelSummaryProps) {
  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-3"
    >
      {data.map((lv) => (
        <div key={lv.levelId} className="card-glass p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-zinc-200">Lv.{lv.levelId} {LEVEL_NAMES[lv.levelId]}</p>
            <p className="text-xs text-zinc-500">{lv.studentCount} 名学生参与</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-accent">{lv.accuracy}%</p>
            <p className="text-xs text-zinc-500">正确率</p>
          </div>
        </div>
      ))}
    </motion.div>
  )
}