import { fillActivePool } from '../logic/learningPool'
import { applyCorrectAnswer, applyIncorrectAnswer } from '../logic/masteryRules'
import type { LearningItem, LearningItemDraft, LearningItemStatus } from '../types/learning'
import { nowIso } from '../utils/dates'
import { createId } from '../utils/ids'
import { normalizeText, validateDraft } from '../utils/validation'
import { fetchOnlineVocabularySnapshot, saveOnlineVocabulary } from './onlineVocabularyService'
import { getSettings } from './settingsService'

// Caches the last known vocabulary + its GitHub file sha so consecutive reads/writes within
// a session avoid extra GitHub round-trips. Invalidated and refetched on a stale-sha conflict.
let cache: { items: LearningItem[]; sha?: string } | undefined

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

async function readOnlineItems({ force = false } = {}) {
  if (cache && !force) return cache.items
  const snapshot = await fetchOnlineVocabularySnapshot()
  cache = snapshot
  return snapshot.items
}

async function writeOnlineItems(items: LearningItem[]) {
  const result = await saveOnlineVocabulary(items, cache?.sha)
  if (!result.ok) {
    // Someone else wrote in the meantime (or we had no cached sha yet): refetch the current
    // state and sha, then retry once against the fresh sha.
    if (result.error?.includes('[stale-sha]') || cache === undefined) {
      cache = await fetchOnlineVocabularySnapshot()
      const retry = await saveOnlineVocabulary(items, cache.sha)
      if (!retry.ok) throw new Error(retry.error ?? 'Online-Speicherung fehlgeschlagen.')
      cache = { items, sha: retry.sha }
      return
    }
    throw new Error(result.error ?? 'Online-Speicherung fehlgeschlagen.')
  }
  cache = { items, sha: result.sha }
}

export async function getAllLearningItems() {
  return readOnlineItems()
}

/** Forces a fresh read from GitHub, bypassing the in-memory cache (e.g. after an external change). */
export async function refreshAllLearningItems() {
  return readOnlineItems({ force: true })
}

/** Drops the cached vocabulary snapshot, e.g. after a write made outside this service (backup import). */
export function invalidateLearningItemsCache() {
  cache = undefined
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
  await writeOnlineItems([...existing, item])
  return item
}

export async function addManyLearningItems(drafts: LearningItemDraft[]) {
  const existing = await getAllLearningItems()
  const settings = await getSettings()
  const created: LearningItem[] = []
  const nextItems = [...existing]

  for (const draft of drafts) {
    const validation = validateDraft(draft, nextItems)
    if (!validation.valid) throw new Error(validation.message)

    const timestamp = nowIso()
    const activeCount = nextItems.filter((item) => item.status === 'active').length
    const item: LearningItem = {
      id: createId('item'),
      english: normalizeText(draft.english),
      german: normalizeText(draft.german),
      status: activeCount < settings.activePoolSize ? 'active' : 'waiting',
      correctCount: 0,
      incorrectCount: 0,
      phaseOneViewCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      sortOrder: nextItems.length + 1,
    }
    nextItems.push(item)
    created.push(item)
  }

  await writeOnlineItems(nextItems)
  return created
}

export async function loadSampleItems() {
  return addManyLearningItems(sampleItems)
}

export async function updateLearningItem(id: string, patch: Partial<LearningItem>) {
  const items = await getAllLearningItems()
  const updated = items.map((item) => (item.id === id ? { ...item, ...patch, updatedAt: nowIso() } : item))
  const refill = await refillActivePoolItems(updated)
  await writeOnlineItems(refill.items)
}

export async function setLearningItemStatus(id: string, status: LearningItemStatus) {
  await updateLearningItem(id, { status })
}

export async function deleteLearningItem(id: string) {
  const items = (await getAllLearningItems()).filter((item) => item.id !== id)
  const refill = await refillActivePoolItems(items)
  await writeOnlineItems(refill.items)
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
  const items = await getAllLearningItems()
  const updated = items.map((item) =>
    item.id === id
      ? { ...item, phaseOneViewCount: item.phaseOneViewCount + 1, lastShownAt: nowIso(), updatedAt: nowIso() }
      : item,
  )
  await writeOnlineItems(updated)
}

export async function recordCorrectAnswer(id: string) {
  const settings = await getSettings()
  const items = await getAllLearningItems()
  const original = items.find((item) => item.id === id)
  if (!original) return { item: undefined, mastered: false, activatedIds: [] as string[] }

  const answered = applyCorrectAnswer(original, settings.requiredCorrectAnswers)
  const withAnswer = items.map((item) => (item.id === id ? answered : item))
  const refill = await refillActivePoolItems(withAnswer)
  await writeOnlineItems(refill.items)

  return {
    item: answered,
    mastered: answered.status === 'mastered' && original.status !== 'mastered',
    activatedIds: refill.activatedIds,
  }
}

export async function recordIncorrectAnswer(id: string) {
  const items = await getAllLearningItems()
  const updated = items.map((item) => (item.id === id ? applyIncorrectAnswer(item) : item))
  await writeOnlineItems(updated)
}

async function refillActivePoolItems(items: LearningItem[]) {
  const settings = await getSettings()
  return fillActivePool(items, settings.activePoolSize)
}

export async function refillActivePool() {
  const items = await getAllLearningItems()
  const result = await refillActivePoolItems(items)
  if (result.activatedIds.length > 0) {
    await writeOnlineItems(result.items)
  }
  return result
}

export async function replaceAllLearningItems(items: LearningItem[]) {
  await writeOnlineItems(items)
}
