import type { QuestionData } from '@/components/quiz/types'

const QUIZ_DATA_KEY = 'opsys-static-quiz'
const RECORDS_KEY = 'opsys-static-records'
const PROGRESS_KEY = 'opsys-static-progress'

export function storeQuizQuestions(questions: QuestionData[]): void {
  localStorage.setItem(QUIZ_DATA_KEY, JSON.stringify(questions))
}

export function getStoredQuestions(): QuestionData[] | null {
  try {
    const raw = localStorage.getItem(QUIZ_DATA_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export interface StaticRecord {
  questionId: string
  studentAnswer: unknown
  isCorrect: boolean
  skipped: boolean
  answeredAt: string
}

export function getStaticRecords(): StaticRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addStaticRecord(record: StaticRecord): void {
  const records = getStaticRecords()
  records.push(record)
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records))
}

export function addSkipRecord(questionId: string): void {
  addStaticRecord({
    questionId,
    studentAnswer: null,
    isCorrect: false,
    skipped: true,
    answeredAt: new Date().toISOString(),
  })
}

export function hasAnswered(questionId: string): boolean {
  return getStaticRecords().some((r) => r.questionId === questionId)
}

export function getStaticProgress(): number[] {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function setStaticProgress(levels: number[]): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(levels))
}

export function clearStaticData(): void {
  localStorage.removeItem(QUIZ_DATA_KEY)
  localStorage.removeItem(RECORDS_KEY)
  localStorage.removeItem(PROGRESS_KEY)
}