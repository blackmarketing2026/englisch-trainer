import type { LearningItem } from '../types/learning'
import type { LearningSession } from '../types/session'
import type { AppSettings } from '../types/settings'
import { todayKey } from '../utils/dates'
import { db } from './database'
import { fetchOnlineVocabulary } from './onlineVocabularyService'
import { saveOnlineVocabulary } from './onlineVocabularyService'
import { getSettings } from './settingsService'

export interface BackupPayload {
  version: 1
  exportedAt: string
  learningItems: LearningItem[]
  sessions: LearningSession[]
  settings: AppSettings
}

export async function createBackup(): Promise<BackupPayload> {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    learningItems: await fetchOnlineVocabulary(),
    sessions: await db.sessions.toArray(),
    settings: await getSettings(),
  }
}

export function downloadBackup(payload: BackupPayload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `englisch-training-backup-${todayKey()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export function parseBackup(text: string): BackupPayload {
  const parsed = JSON.parse(text) as BackupPayload
  if (parsed.version !== 1 || !Array.isArray(parsed.learningItems) || !Array.isArray(parsed.sessions)) {
    throw new Error('Die Importdatei ist beschädigt oder hat ein unbekanntes Format.')
  }
  return parsed
}

export async function importBackup(payload: BackupPayload, mode: 'replace' | 'merge') {
  if (mode === 'replace') {
    await db.transaction('rw', db.learningItems, db.sessions, db.settings, async () => {
      await db.learningItems.clear()
      await db.sessions.clear()
      await db.sessions.bulkPut(payload.sessions)
      await db.settings.put({ id: 'settings', value: payload.settings })
      await saveOnlineVocabulary(payload.learningItems)
    })
    return
  }

  await db.transaction('rw', db.learningItems, db.sessions, db.settings, async () => {
    await db.sessions.bulkPut(payload.sessions)
    await db.settings.put({ id: 'settings', value: payload.settings })
    const existing = await fetchOnlineVocabulary()
    await saveOnlineVocabulary([...existing, ...payload.learningItems])
  })
}

export async function clearAllData() {
  await db.transaction('rw', db.learningItems, db.sessions, db.settings, async () => {
    await db.learningItems.clear()
    await db.sessions.clear()
    await db.settings.clear()
    await saveOnlineVocabulary([])
  })
}
