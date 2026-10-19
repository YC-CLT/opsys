import { Hono } from 'hono'
import { getDb } from '../db'
import { verifyToken } from '../security'

const quiz = new Hono()

quiz.get('/:level', (c) => {
  const level = parseInt(c.req.param('level'))
  if (isNaN(level) || level < 1 || level > 6) {
    return c.json({ error: '无效的关卡编号' }, 400)
  }

  const db = getDb()
  const questions = db.prepare(
    'SELECT id, type, difficulty, level_id, content_json, explanation FROM questions WHERE level_id = ? ORDER BY id'
  ).all(level) as { id: string; type: string; difficulty: string; level_id: number; content_json: string; explanation: string }[]

  return c.json({
    questions: questions.map(q => ({
      id: q.id,
      type: q.type,
      difficulty: q.difficulty,
      levelId: q.level_id,
      content: JSON.parse(q.content_json),
      explanation: q.explanation,
    })),
  })
})

quiz.post('/submit', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: '未登录' }, 401)
  }

  const token = authHeader.slice(7)
  const payload = verifyToken(token)
  if (!payload || !payload.studentId) {
    return c.json({ error: '登录已过期，请重新登录' }, 401)
  }

  const body = await c.req.json()
  const { questionId, answer } = body

  if (!questionId || answer === undefined) {
    return c.json({ error: '缺少 questionId 或 answer' }, 400)
  }

  const db = getDb()

  const question = db.prepare(
    'SELECT id, answer_json, explanation FROM questions WHERE id = ?'
  ).get(questionId) as { id: string; answer_json: string; explanation: string } | undefined

  if (!question) {
    return c.json({ error: '题目不存在' }, 404)
  }

  const existing = db.prepare(
    'SELECT id FROM quiz_records WHERE student_id = ? AND question_id = ?'
  ).get(payload.studentId, questionId)

  if (existing) {
    return c.json({ error: '该题已作答，不可重复提交' }, 409)
  }

  const correctAnswer = JSON.parse(question.answer_json)
  let isCorrect = false

  if (typeof correctAnswer === 'boolean') {
    isCorrect = answer === correctAnswer
  } else if (typeof correctAnswer === 'string') {
    isCorrect = String(answer).toUpperCase() === correctAnswer.toUpperCase()
  } else if (typeof correctAnswer === 'object') {
    if (typeof answer === 'object') {
      const keys = Object.keys(correctAnswer)
      isCorrect = keys.length === Object.keys(answer).length &&
        keys.every(k => String(answer[k] || '').trim() === String(correctAnswer[k]).trim())
    }
  }

  db.prepare(
    'INSERT INTO quiz_records (student_id, question_id, student_answer_json, is_correct) VALUES (?, ?, ?, ?)'
  ).run(payload.studentId, questionId, JSON.stringify(answer), isCorrect ? 1 : 0)

  return c.json({
    correct: isCorrect,
    explanation: question.explanation,
  })
})

export default quiz