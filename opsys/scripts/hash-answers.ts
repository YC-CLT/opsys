import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

const SALT = 'os-challenge-static-2026'

const repoRoot = process.argv[4] || process.cwd()
const bankPath = path.resolve(process.argv[2] || path.join(repoRoot, 'data', 'quiz-bank.json'))
const outPath = path.resolve(process.argv[3] || path.join(repoRoot, 'opsys', 'frontend', 'public', 'data', 'questions.json'))

const bank = JSON.parse(fs.readFileSync(bankPath, 'utf-8'))

for (const q of bank.questions) {
  const answerStr = JSON.stringify(q.answer)
  q.answerHash = crypto.createHash('sha256').update(answerStr + SALT).digest('hex')
  delete q.answer
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(bank, null, 2), 'utf-8')

console.log(`✅ Generated ${bank.questions.length} questions → ${outPath}`)