'use client'

import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { apiFetch } from '@/lib/api'

interface StudentAuth {
  token: string
  studentId: string
  name: string
  progress: number[]
}

interface TeacherAuth {
  token: string
  role: 'teacher'
}

const TOKEN_KEY = 'opsys-auth'

const AuthContext = createContext<{
  student: StudentAuth | null
  teacher: TeacherAuth | null
  loginStudent: (studentId: string, name: string) => Promise<void>
  loginTeacher: (password: string) => Promise<void>
  logout: () => void
  loading: boolean
}>({
  student: null,
  teacher: null,
  loginStudent: async () => {},
  loginTeacher: async () => {},
  logout: () => {},
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [student, setStudent] = useState<StudentAuth | null>(null)
  const [teacher, setTeacher] = useState<TeacherAuth | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TOKEN_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.role === 'teacher') {
          setTeacher(parsed)
        } else {
          setStudent(parsed)
        }
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY)
    }
    setLoading(false)
  }, [])

  const loginStudent = useCallback(async (studentId: string, name: string) => {
    const res = await apiFetch<{ token: string; progress: number[] }>('/api/auth/student', {
      method: 'POST',
      body: JSON.stringify({ studentId, name }),
    })
    const auth: StudentAuth = { token: res.token, studentId, name, progress: res.progress }
    localStorage.setItem(TOKEN_KEY, JSON.stringify(auth))
    setStudent(auth)
    setTeacher(null)
  }, [])

  const loginTeacher = useCallback(async (password: string) => {
    const res = await apiFetch<{ token: string }>('/api/auth/teacher', {
      method: 'POST',
      body: JSON.stringify({ password }),
    })
    const auth: TeacherAuth = { token: res.token, role: 'teacher' }
    localStorage.setItem(TOKEN_KEY, JSON.stringify(auth))
    setTeacher(auth)
    setStudent(null)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setStudent(null)
    setTeacher(null)
  }, [])

  return (
    <AuthContext.Provider value={{ student, teacher, loginStudent, loginTeacher, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}