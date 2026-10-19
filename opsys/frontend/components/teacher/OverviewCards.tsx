'use client'

interface OverviewCardsProps {
  studentCount: number
  overallAccuracy: string
  levelCount: number
  questionCount: number
}

export default function OverviewCards({ studentCount, overallAccuracy, levelCount, questionCount }: OverviewCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="card-glass p-4 text-center">
        <p className="text-2xl font-bold text-accent">{studentCount}</p>
        <p className="text-xs text-zinc-500 mt-1">参与学生</p>
      </div>
      <div className="card-glass p-4 text-center">
        <p className="text-2xl font-bold text-green-400">{overallAccuracy}%</p>
        <p className="text-xs text-zinc-500 mt-1">整体正确率</p>
      </div>
      <div className="card-glass p-4 text-center">
        <p className="text-2xl font-bold text-yellow-400">{levelCount}</p>
        <p className="text-xs text-zinc-500 mt-1">关卡数量</p>
      </div>
      <div className="card-glass p-4 text-center">
        <p className="text-2xl font-bold text-blue-400">{questionCount}</p>
        <p className="text-xs text-zinc-500 mt-1">题目总数</p>
      </div>
    </div>
  )
}