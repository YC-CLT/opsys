import { Hono } from 'hono'
import { serve } from '@hono/node-server'

const app = new Hono()

app.get('/', (c) => c.json({ ok: true }))

const port = parseInt(process.env.PORT || '3000')
console.log(`Backend listening on http://localhost:${port}`)
serve({ fetch: app.fetch, port })

export default app