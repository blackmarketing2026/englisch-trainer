import Dexie, { type Table } from 'dexie'
import type { LearningItem } from '../types/learning'
import type { LearningSession } from '../types/session'
import type { AppSettings } from '../types/settings'

interface SettingsRow {
  id: 'settings'
  value: AppSettings
}

export class EnglishTrainerDatabase extends Dexie {
  learningItems!: Table<LearningItem, string>
  sessions!: Table<LearningSession, string>
  settings!: Table<SettingsRow, string>

  constructor() {
    super('english-trainer-db')
    this.version(1).stores({
      learningItems: 'id, status, createdAt, updatedAt, sortOrder, category',
      sessions: 'id, startedAt, completedAt, state',
      settings: 'id',
    })
  }
}

export const db = new EnglishTrainerDatabase()

export async function requestPersistentStorage() {
  if (!navigator.storage?.persist) return false
  try {
    return navigator.storage.persist()
  } catch {
    return false
  }
}
