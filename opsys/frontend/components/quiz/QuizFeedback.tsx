'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface QuizFeedbackProps {
  correct: boolean
  explanation: string
  onNext: () => void
  visible: boolean
}

export default function QuizFeedback({ correct, explanation, onNext, visible }: QuizFeedbackProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="card-glass p-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className={`text-3xl ${correct ? '' : 'grayscale'}`}
            >
              {correct ? '🎉' : '💡'}
            </motion.div>
            <div>
              <h3 className={`text-xl font-bold ${correct ? 'text-green-400' : 'text-yellow-400'}`}>
                {correct ? '回答正确！' : '再想想～'}
              </h3>
              <p className="text-sm text-zinc-400">
                {correct ? '你对 OS 的理解又深了一层' : '没关系，看看解析巩固一下'}
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/30"
          >
            <p className="text-xs text-zinc-500 mb-1.5 font-mono"># 解析</p>
            <p className="text-sm text-zinc-300 leading-relaxed">{explanation}</p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={onNext}
            className="w-full py-3 rounded-xl bg-accent/20 border border-accent/40 text-accent font-medium hover:bg-accent/30 transition-colors"
          >
            {correct ? '下一题' : '继续下一题'}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}