import type { LearningItem } from '../types/learning'

interface VocabularyResponse {
  items: LearningItem[]
}

export async function fetchOnlineVocabulary(): Promise<LearningItem[] | undefined> {
  try {
    const response = await fetch('/api/vocabulary', { cache: 'no-store' })
    if (!response.ok) return undefined
    const payload = (await response.json()) as VocabularyResponse
    return Array.isArray(payload.items) ? payload.items : []
  } catch {
    return undefined
  }
}

export async function saveOnlineVocabulary(items: LearningItem[]) {
  try {
    const response = await fetch('/api/vocabulary', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ items }),
    })
    return response.ok
  } catch {
    // Local development and offline use continue with IndexedDB/local backup.
    return false
  }
}
