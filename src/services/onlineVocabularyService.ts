import type { LearningItem } from '../types/learning'

interface VocabularyResponse {
  items: LearningItem[]
  error?: string
}

export interface OnlineVocabularyStatus {
  ok: boolean
  count: number
  error?: string
}

export async function fetchOnlineVocabulary(): Promise<LearningItem[]> {
  try {
    const response = await fetch('/api/vocabulary', { cache: 'no-store' })
    const payload = (await response.json()) as VocabularyResponse
    if (!response.ok) throw new Error(payload.error ?? `API-Fehler ${response.status}`)
    return Array.isArray(payload.items) ? payload.items : []
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Online-Speicher nicht erreichbar')
  }
}

export async function getOnlineVocabularyStatus(): Promise<OnlineVocabularyStatus> {
  try {
    const response = await fetch('/api/vocabulary', { cache: 'no-store' })
    const payload = (await response.json()) as VocabularyResponse
    if (!response.ok) {
      return { ok: false, count: 0, error: payload.error ?? `API-Fehler ${response.status}` }
    }
    return { ok: true, count: Array.isArray(payload.items) ? payload.items.length : 0 }
  } catch (error) {
    return { ok: false, count: 0, error: error instanceof Error ? error.message : 'Online-Speicher nicht erreichbar' }
  }
}

export async function saveOnlineVocabulary(items: LearningItem[]): Promise<OnlineVocabularyStatus> {
  try {
    const response = await fetch('/api/vocabulary', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ items }),
    })
    const payload = (await response.json()) as Partial<VocabularyResponse>
    if (!response.ok) {
      return { ok: false, count: 0, error: payload.error ?? `API-Fehler ${response.status}` }
    }
    return { ok: true, count: items.length }
  } catch {
    return { ok: false, count: 0, error: 'Online-Speicher nicht erreichbar' }
  }
}
