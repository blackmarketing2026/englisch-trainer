import type { LearningItem } from '../types/learning'

interface VocabularyResponse {
  items: LearningItem[]
  sha?: string
  error?: string
}

export interface OnlineVocabularyStatus {
  ok: boolean
  count: number
  error?: string
}

export interface VocabularySnapshot {
  items: LearningItem[]
  sha?: string
}

export async function fetchOnlineVocabularySnapshot(): Promise<VocabularySnapshot> {
  try {
    const response = await fetch('/api/vocabulary', { cache: 'no-store' })
    const payload = (await response.json()) as VocabularyResponse
    if (!response.ok) throw new Error(payload.error ?? `API-Fehler ${response.status}`)
    return { items: Array.isArray(payload.items) ? payload.items : [], sha: payload.sha }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Online-Speicher nicht erreichbar')
  }
}

export async function fetchOnlineVocabulary(): Promise<LearningItem[]> {
  return (await fetchOnlineVocabularySnapshot()).items
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

export interface SaveVocabularyResult extends OnlineVocabularyStatus {
  sha?: string
}

export async function saveOnlineVocabulary(items: LearningItem[], sha?: string): Promise<SaveVocabularyResult> {
  try {
    const response = await fetch('/api/vocabulary', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ items, sha }),
    })
    const payload = (await response.json()) as Partial<VocabularyResponse>
    if (!response.ok) {
      return { ok: false, count: 0, error: payload.error ?? `API-Fehler ${response.status}` }
    }
    return { ok: true, count: items.length, sha: payload.sha }
  } catch {
    return { ok: false, count: 0, error: 'Online-Speicher nicht erreichbar' }
  }
}
