import { Hono } from 'hono'
import { getDb } from '../db'
import { validateStudentId, sanitize, signToken, checkLoginRateLimit, recordLoginFailure, resetLoginFailures, verifyTeacherPassword } from '../security'

const auth = new Hono()

auth.post('/student', async (c) => {
  const body = await c.req.json()
  const { studentId, name } = body

  if (!studentId || !name) {
    return c.json({ error: '学号和姓名不能为空' }, 400)
  }

  if (!validateStudentId(studentId)) {
    return c.json({ error: '学号格式错误，需为 12 位数字' }, 400)
  }

  const safeId = sanitize(studentId)
  const safeName = sanitize(name).slice(0, 50)

  const db = getDb()
  db.prepare(
    'INSERT OR REPLACE INTO students (student_id, name) VALUES (?, ?)'
  ).run(safeId, safeName)

  const records = db.prepare(
    'SELECT DISTINCT q.level_id FROM quiz_records r JOIN questions q ON r.question_id = q.id WHERE r.student_id = ? AND r.is_correct = 1'
  ).all(safeId) as { level_id: number }[]
  const progress = records.map(r => r.level_id)

  const token = signToken({ studentId: safeId, name: safeName })

  return c.json({ token, progress })
})

auth.post('/teacher', async (c) => {
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'

  if (!checkLoginRateLimit(ip)) {
    return c.json({ error: '登录失败次数过多，请 1 分钟后再试' }, 429)
  }

  const body = await c.req.json()
  const { password } = body

  if (!password || typeof password !== 'string') {
    return c.json({ error: '请输入密码' }, 400)
  }

  if (!verifyTeacherPassword(password)) {
    recordLoginFailure(ip)
    return c.json({ error: '密码错误' }, 401)
  }

  resetLoginFailures(ip)
  const token = signToken({ role: 'teacher' })

  return c.json({ token })
})

export default auth