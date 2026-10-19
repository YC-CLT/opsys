export interface QuestionContent {
  stem: string
  options?: string[]
  pairs?: { left: string; right: string }[]
}

export interface Question {
  id: string
  type: 'choice' | 'judge' | 'match'
  difficulty: 'basic' | 'intermediate' | 'discriminate'
  levelId: number
  content: QuestionContent
  answer: string | boolean | Record<string, string>
  explanation: string
}

export interface QuizBank {
  version: string
  chapter: string
  questions: Question[]
}

export interface StudentLoginReq {
  studentId: string
  name: string
}

export interface TeacherLoginReq {
  password: string
}

export interface QuizSubmitReq {
  questionId: string
  answer: string | boolean | Record<string, string>
}

export interface ProgressReq {
  levelId: number
}

export interface QuestionRow {
  id: string
  type: string
  difficulty: string
  level_id: number
  content_json: string
  answer_json: string
  explanation: string
}

export interface StudentRow {
  student_id: string
  name: string
  created_at: string
}

export interface QuizRecordRow {
  id: number
  student_id: string
  question_id: string
  student_answer_json: string
  is_correct: number
  answered_at: string
}