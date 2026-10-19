import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { seedQuestions } from './seed'
import authRoutes from './routes/auth'
import quizRoutes from './routes/quiz'
import teacherRoutes from './routes/teacher'

const app = new Hono()

app.use('/api/*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.get('/', (c) => c.json({ ok: true }))

app.route('/api/auth', authRoutes)
app.route('/api/quiz', quizRoutes)
app.route('/api/teacher', teacherRoutes)

const port = parseInt(process.env.PORT || '3000')

seedQuestions()

console.log(`Backend listening on http://localhost:${port}`)
serve({ fetch: app.fetch, port })

export default app