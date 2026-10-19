const MODE_STORAGE_KEY = 'opsys-mode'
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export type AppMode = 'static' | 'live'

export function getBaseUrl(): string {
  return BASE_URL
}

export async function detectMode(): Promise<AppMode> {
  try {
    const res = await fetch(`${BASE_URL}/api/health`, { method: 'GET', signal: AbortSignal.timeout(2000) })
    if (res.ok) return 'live'
  } catch {
    // unreachable
  }
  return 'static'
}

export function getStoredMode(): AppMode | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(MODE_STORAGE_KEY)
  if (stored === 'static' || stored === 'live') return stored
  return null
}

export function setStoredMode(mode: AppMode): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(MODE_STORAGE_KEY, mode)
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `API error: ${res.status}`)
  }
  return res.json()
}