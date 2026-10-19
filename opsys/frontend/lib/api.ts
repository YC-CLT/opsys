export { detectMode, getStoredMode, setStoredMode, type AppMode } from './mode'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export function getBaseUrl(): string {
  return BASE_URL
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