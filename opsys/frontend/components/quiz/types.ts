export interface QuestionData {
  id: string
  type: 'choice' | 'judge' | 'match'
  difficulty: string
  levelId: number
  content: {
    stem: string
    options?: string[]
    pairs?: { left: string; right: string }[]
  }
  explanation: string
}