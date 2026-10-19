import { Hono } from 'hono'
import { getDb } from '../db'
import { verifyToken } from '../security'

const teacher = new Hono()

teacher.use('*', async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: '未登录' }, 401)
  }

  const payload = verifyToken(authHeader.slice(7))
  if (!payload || payload.role !== 'teacher') {
    return c.json({ error: '无权限访问' }, 403)
  }

  await next()
})

teacher.get('/overview', (c) => {
  const db = getDb()

  const studentCount = db.prepare(
    'SELECT COUNT(DISTINCT student_id) as c FROM quiz_records'
  ).get() as { c: number }

  const students = db.prepare(`
    SELECT s.student_id, s.name,
      COUNT(r.id) as answered,
      SUM(r.is_correct) as correct,
      COUNT(DISTINCT q.level_id) as levels_done
    FROM students s
    LEFT JOIN quiz_records r ON s.student_id = r.student_id
    LEFT JOIN questions q ON r.question_id = q.id AND r.is_correct = 1
    GROUP BY s.student_id, s.name
    ORDER BY correct DESC
  `).all() as { student_id: string; name: string; answered: number; correct: number; levels_done: number }[]

  const questionStats = db.prepare(`
    SELECT q.id, q.type, q.level_id, q.content_json,
      COUNT(r.id) as total_answers,
      SUM(r.is_correct) as correct_answers
    FROM questions q
    LEFT JOIN quiz_records r ON q.id = r.question_id
    GROUP BY q.id
    ORDER BY q.level_id, q.id
  `).all() as { id: string; type: string; level_id: number; content_json: string; total_answers: number; correct_answers: number }[]

  const totalAnswers = questionStats.reduce((s, q) => s + q.total_answers, 0)
  const totalCorrect = questionStats.reduce((s, q) => s + q.correct_answers, 0)

  const levelSummaries = db.prepare(`
    SELECT q.level_id,
      COUNT(DISTINCT r.student_id) as student_count,
      COUNT(r.id) as total_answers,
      SUM(r.is_correct) as correct_answers
    FROM questions q
    LEFT JOIN quiz_records r ON q.id = r.question_id
    GROUP BY q.level_id
    ORDER BY q.level_id
  `).all() as { level_id: number; student_count: number; total_answers: number; correct_answers: number }[]

  return c.json({
    studentCount: studentCount.c,
    students: students.map(s => ({
      ...s,
      accuracy: s.answered > 0 ? (s.correct / s.answered * 100).toFixed(1) : '0.0',
    })),
    overallAccuracy: totalAnswers > 0 ? (totalCorrect / totalAnswers * 100).toFixed(1) : '0.0',
    questionStats: questionStats.map(q => ({
      id: q.id,
      type: q.type,
      levelId: q.level_id,
      stem: JSON.parse(q.content_json).stem,
      totalAnswers: q.total_answers,
      correctAnswers: q.correct_answers,
      accuracy: q.total_answers > 0 ? (q.correct_answers / q.total_answers * 100).toFixed(1) : '0.0',
    })),
    levelSummaries: levelSummaries.map(l => ({
      levelId: l.level_id,
      studentCount: l.student_count,
      accuracy: l.total_answers > 0 ? (l.correct_answers / l.total_answers * 100).toFixed(1) : '0.0',
    })),
  })
})

teacher.get('/student/:studentId', (c) => {
  const studentId = c.req.param('studentId')
  const db = getDb()

  const records = db.prepare(`
    SELECT r.question_id, r.student_answer_json, r.is_correct, r.answered_at,
      q.type, q.difficulty, q.level_id, q.content_json, q.explanation
    FROM quiz_records r
    JOIN questions q ON r.question_id = q.id
    WHERE r.student_id = ?
    ORDER BY r.answered_at
  `).all(studentId) as {
    question_id: string; student_answer_json: string; is_correct: number; answered_at: string
    type: string; difficulty: string; level_id: number; content_json: string; explanation: string
  }[]

  return c.json({
    studentId,
    records: records.map(r => ({
      questionId: r.question_id,
      type: r.type,
      difficulty: r.difficulty,
      levelId: r.level_id,
      stem: JSON.parse(r.content_json).stem,
      studentAnswer: r.student_answer_json,
      isCorrect: !!r.is_correct,
      answeredAt: r.answered_at,
      explanation: r.explanation,
    })),
  })
})

export default teacher