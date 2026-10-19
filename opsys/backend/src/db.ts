import Database from 'better-sqlite3'
import type { Database as DB } from 'better-sqlite3'
import path from 'node:path'

let db: DB

export function getDb(): DB {
  if (!db) {
    const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'opsys.db')
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    initDb(db)
  }
  return db
}

function initDb(db: DB): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      level_id INTEGER NOT NULL,
      content_json TEXT NOT NULL,
      answer_json TEXT NOT NULL,
      explanation TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS students (
      student_id TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (student_id, name)
    );

    CREATE TABLE IF NOT EXISTS quiz_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      student_answer_json TEXT NOT NULL,
      is_correct INTEGER NOT NULL,
      answered_at TEXT DEFAULT (datetime('now')),
      UNIQUE(student_id, question_id)
    );
  `)
}