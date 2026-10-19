const PROGRESS_KEY = 'os_challenge_progress'
const SESSION_KEY = 'os_challenge_session'
const SETTINGS_KEY = 'os_challenge_settings'

export function getProgress(): number[] {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveProgress(levelId: number): void {
  const progress = getProgress()
  if (!progress.includes(levelId)) {
    progress.push(levelId)
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
  }
}

export function clearProgress(): void {
  localStorage.removeItem(PROGRESS_KEY)
}

export function getSession(): { studentId: string; name: string } | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveSession(data: { studentId: string; name: string }): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(data))
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}

export interface Settings {
  bgmIndex: number
  bgmVolume: number
  sfxEnabled: boolean
}

export function getSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? JSON.parse(raw) : { bgmIndex: 0, bgmVolume: 0.4, sfxEnabled: true }
  } catch {
    return { bgmIndex: 0, bgmVolume: 0.4, sfxEnabled: true }
  }
}

export function saveSettings(s: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
}