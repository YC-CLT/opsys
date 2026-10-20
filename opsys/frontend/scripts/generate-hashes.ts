import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

interface Question {
  id: string
  type: string
  levelId: number
  answerHash: string
}

interface HashEntry {
  id: string
  hash: string
  type: string
  levelId: number
}

const questionsPath = join(__dirname, '..', 'data', 'questions.json')
const outputDir = join(__dirname, '..', 'public', 'data')
const outputPath = join(outputDir, 'question-hashes.json')

const raw = readFileSync(questionsPath, 'utf-8')
const data = JSON.parse(raw)
const questions: Question[] = data.questions

const entries: HashEntry[] = questions.map((q) => ({
  id: q.id,
  hash: q.answerHash,
  type: q.type,
  levelId: q.levelId,
}))

mkdirSync(outputDir, { recursive: true })
writeFileSync(outputPath, JSON.stringify({ version: '1.0', entries }, null, 2), 'utf-8')

console.log(`Generated ${entries.length} hash entries → ${outputPath}`)

let mismatches = 0
for (const q of questions) {
  const actual = q.answerHash
  if (!actual || actual.length !== 64) {
    console.warn(`⚠ Q${q.id}: missing or invalid hash`)
    mismatches++
    continue
  }
}

if (mismatches === 0) {
  console.log('All hashes validated.')
} else {
  console.warn(`${mismatches} hash(es) with issues.`)
}