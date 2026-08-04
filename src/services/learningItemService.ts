import { fillActivePool } from '../logic/learningPool'
import { applyCorrectAnswer, applyIncorrectAnswer } from '../logic/masteryRules'
import type { LearningItem, LearningItemDraft, LearningItemStatus } from '../types/learning'
import { nowIso } from '../utils/dates'
import { createId } from '../utils/ids'
import { normalizeText, validateDraft } from '../utils/validation'
import { db } from './database'
import { loadLearningItemsLocalBackup, saveLearningItemsLocalBackup } from './localLearningBackup'
import { fetchOnlineVocabulary, saveOnlineVocabulary } from './onlineVocabularyService'
import { getSettings } from './settingsService'

export const sampleItems: LearningItemDraft[] = [
  { english: 'I work as a software developer.', german: 'Ich arbeite als Softwareentwickler.' },
  { english: 'I live in Germany.', german: 'Ich lebe in Deutschland.' },
  { english: 'I enjoy building software.', german: 'Ich entwickle gerne Software.' },
  { english: 'I go to the gym after work.', german: 'Ich gehe nach der Arbeit ins Fitnessstudio.' },
  { english: 'I like learning new things.', german: 'Ich lerne gerne neue Dinge.' },
  { english: 'I run my own business.', german: 'Ich führe mein eigenes Unternehmen.' },
  { english: 'I create websites for customers.', german: 'Ich erstelle Webseiten für Kunden.' },
  { english: 'I manage Google Ads campaigns.', german: 'Ich betreue Google-Ads-Kampagnen.' },
  { english: 'I speak with customers every day.', german: 'Ich spreche jeden Tag mit Kunden.' },
]

export async function getAllLearningItems() {
  const onlineItems = await fetchOnlineVocabulary()
  if (onlineItems && onlineItems.length > 0) {
    await db.learningItems.clear()
    await db.learningItems.bulkPut(onlineItems)
    saveLearningItemsLocalBackup(onlineItems)
    return db.learningItems.orderBy('createdAt').toArray()
  }

  const items = await db.learningItems.orderBy('createdAt').toArray()
  if (items.length > 0) return items

  const backupItems = loadLearningItemsLocalBackup()
  if (backupItems.length === 0) return []

  await db.learningItems.bulkPut(backupItems)
  return db.learningItems.orderBy('createdAt').toArray()
}

async function saveLocalSnapshot() {
  const items = await db.learningItems.orderBy('createdAt').toArray()
  saveLearningItemsLocalBackup(items)
  await saveOnlineVocabulary(items)
}

export async function addLearningItem(draft: LearningItemDraft): Promise<LearningItem> {
  const existing = await getAllLearningItems()
  const validation = validateDraft(draft, existing)
  if (!validation.valid) throw new Error(validation.message)

  const settings = await getSettings()
  const activeCount = existing.filter((item) => item.status === 'active').length
  const timestamp = nowIso()
  const item: LearningItem = {
    id: createId('item'),
    english: normalizeText(draft.english),
    german: normalizeText(draft.german),
    category: draft.category ? normalizeText(draft.category) : undefined,
    topic: draft.topic ? normalizeText(draft.topic) : undefined,
    note: draft.note ? normalizeText(draft.note) : undefined,
    example: draft.example ? normalizeText(draft.example) : undefined,
    status: activeCount < settings.activePoolSize ? 'active' : 'waiting',
    correctCount: 0,
    incorrectCount: 0,
    phaseOneViewCount: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
    sortOrder: existing.length + 1,
  }
  await db.learningItems.add(item)
  await saveLocalSnapshot()
  return item
}

export async function addManyLearningItems(drafts: LearningItemDraft[]) {
  const created: LearningItem[] = []
  for (const draft of drafts) {
    created.push(await addLearningItem(draft))
  }
  return created
}

export async function loadSampleItems() {
  return addManyLearningItems(sampleItems)
}

export async function updateLearningItem(id: string, patch: Partial<LearningItem>) {
  await db.learningItems.update(id, { ...patch, updatedAt: nowIso() })
  await refillActivePool()
  await saveLocalSnapshot()
}

export async function setLearningItemStatus(id: string, status: LearningItemStatus) {
  await updateLearningItem(id, { status })
}

export async function deleteLearningItem(id: string) {
  await db.learningItems.delete(id)
  await refillActivePool()
  await saveLocalSnapshot()
}

export async function resetLearningItemProgress(id: string) {
  await updateLearningItem(id, {
    correctCount: 0,
    incorrectCount: 0,
    masteredAt: undefined,
    lastAnsweredAt: undefined,
  })
}

export async function recordPhaseOneView(id: string) {
  const item = await db.learningItems.get(id)
  if (!item) return
  await db.learningItems.put({
    ...item,
    phaseOneViewCount: item.phaseOneViewCount + 1,
    lastShownAt: nowIso(),
    updatedAt: nowIso(),
  })
  await saveLocalSnapshot()
}

export async function recordCorrectAnswer(id: string) {
  const settings = await getSettings()
  const item = await db.learningItems.get(id)
  if (!item) return { item: undefined, mastered: false, activatedIds: [] as string[] }
  const updated = applyCorrectAnswer(item, settings.requiredCorrectAnswers)
  await db.learningItems.put(updated)
  const refill = await refillActivePool()
  await saveLocalSnapshot()
  return {
    item: updated,
    mastered: updated.status === 'mastered' && item.status !== 'mastered',
    activatedIds: refill.activatedIds,
  }
}

export async function recordIncorrectAnswer(id: string) {
  const item = await db.learningItems.get(id)
  if (!item) return
  await db.learningItems.put(applyIncorrectAnswer(item))
  await saveLocalSnapshot()
}

export async function refillActivePool() {
  const settings = await getSettings()
  const items = await getAllLearningItems()
  const result = fillActivePool(items, settings.activePoolSize)
  if (result.activatedIds.length > 0) {
    await db.learningItems.bulkPut(result.items)
    await saveLocalSnapshot()
  }
  return result
}

export async function replaceAllLearningItems(items: LearningItem[]) {
  await db.learningItems.clear()
  await db.learningItems.bulkPut(items)
  await saveLocalSnapshot()
}
