import { db } from './database'
import { defaultSettings, type AppSettings } from '../types/settings'
import { enforceMasteryAfterRuleChange } from '../logic/learningPool'

export async function getSettings(): Promise<AppSettings> {
  const row = await db.settings.get('settings')
  if (row) return row.value
  await db.settings.put({ id: 'settings', value: defaultSettings })
  return defaultSettings
}

export async function updateSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings()
  const next = { ...current, ...patch }
  await db.settings.put({ id: 'settings', value: next })

  if (patch.requiredCorrectAnswers || patch.activePoolSize) {
    const items = await db.learningItems.toArray()
    const result = enforceMasteryAfterRuleChange(items, next.requiredCorrectAnswers, next.activePoolSize)
    await db.learningItems.bulkPut(result.items)
  }

  return next
}
