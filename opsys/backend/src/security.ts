import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const TEACHER_PASSWORD_HASH = process.env.TEACHER_PASSWORD_HASH || crypto.createHash('sha256').update('admin123').digest('hex')

export function validateStudentId(id: string): boolean {
  return /^\d{12}$/.test(id)
}

export function sanitize(s: string): string {
  return s.replace(/[<>&"']/g, '')
}

export function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyToken(token: string): { studentId?: string; role?: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { studentId?: string; role?: string }
  } catch {
    return null
  }
}

const rateMap = new Map<string, { count: number; reset: number }>()

export function rateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + 60000 })
    return true
  }
  if (entry.count >= 60) return false
  entry.count++
  return true
}

const loginFailMap = new Map<string, { count: number; lockedUntil: number }>()

export function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = loginFailMap.get(ip)
  if (entry && now < entry.lockedUntil) return false
  return true
}

export function recordLoginFailure(ip: string): void {
  const now = Date.now()
  const entry = loginFailMap.get(ip)
  if (!entry || now > entry.lockedUntil) {
    loginFailMap.set(ip, { count: 1, lockedUntil: 0 })
  } else {
    entry.count++
    if (entry.count >= 5) {
      entry.lockedUntil = now + 60000
    }
  }
}

export function resetLoginFailures(ip: string): void {
  loginFailMap.delete(ip)
}

export function verifyTeacherPassword(password: string): boolean {
  const hash = crypto.createHash('sha256').update(password).digest('hex')
  return hash === TEACHER_PASSWORD_HASH
}