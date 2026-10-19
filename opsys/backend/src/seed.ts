import fs from 'node:fs'
import path from 'node:path'
import { getDb } from './db'
import type { QuizBank } from './types'

export function seedQuestions(bankPath?: string): void {
  const db = getDb()
  const count = db.prepare('SELECT COUNT(*) as c FROM questions').get() as { c: number }
  if (count.c > 0) return

  const p = bankPath || path.join(process.cwd(), '..', '..', 'data', 'quiz-bank.json')
  const raw = fs.readFileSync(p, 'utf-8')
  const bank: QuizBank = JSON.parse(raw)

  const stmt = db.prepare(
    'INSERT INTO questions (id, type, difficulty, level_id, content_json, answer_json, explanation) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )

  const insertAll = db.transaction(() => {
    for (const q of bank.questions) {
      stmt.run(
        q.id,
        q.type,
        q.difficulty,
        q.levelId,
        JSON.stringify(q.content),
        JSON.stringify(q.answer),
        q.explanation
      )
    }
  })

  insertAll()
  console.log(`Seeded ${bank.questions.length} questions from quiz-bank.json`)
}