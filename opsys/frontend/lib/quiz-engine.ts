const SALT = 'os-challenge-static-2026'

interface Question {
  id: string
  type: string
  answerHash: string
  explanation: string
}

let questionMap: Map<string, Question> | null = null

async function loadQuestions(): Promise<Map<string, Question>> {
  if (questionMap) return questionMap
  const res = await fetch('/data/questions.json')
  const data = await res.json()
  questionMap = new Map()
  for (const q of data.questions) {
    questionMap.set(q.id, q)
  }
  return questionMap
}

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text + SALT)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function checkAnswer(
  questionId: string,
  userAnswer: unknown
): Promise<{ correct: boolean; explanation: string } | null> {
  const map = await loadQuestions()
  const q = map.get(questionId)
  if (!q) return null

  const answerStr = JSON.stringify(userAnswer)
  const userHash = await sha256(answerStr)

  return {
    correct: userHash === q.answerHash,
    explanation: q.explanation,
  }
}

export async function getStaticQuestions(levelId: number) {
  const map = await loadQuestions()
  const all = Array.from(map.values()).filter((q: any) => q.levelId === levelId)
  return all.map(({ answerHash, ...rest }) => rest)
}