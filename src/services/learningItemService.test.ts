import { beforeEach, describe, expect, it, vi } from 'vitest'
import { addManyLearningItems, invalidateLearningItemsCache } from './learningItemService'

vi.mock('./settingsService', () => ({
  getSettings: async () => ({
    phaseOneMinutes: 10,
    phaseTwoMinutes: 10,
    phaseThreeMinutes: 10,
    activePoolSize: 9,
    requiredCorrectAnswers: 5,
    soundEnabled: true,
    vibrationEnabled: true,
    darkMode: true,
    preventImmediateRepeats: true,
    autoStartNextPhase: false,
  }),
}))

const onlineStore: { items: unknown[] } = { items: [] }

vi.mock('./onlineVocabularyService', () => ({
  fetchOnlineVocabularySnapshot: async () => ({ items: onlineStore.items, sha: 'test-sha' }),
  saveOnlineVocabulary: async (items: unknown[]) => {
    onlineStore.items = items
    return { ok: true, count: items.length, sha: 'test-sha' }
  },
}))

describe('online vocabulary saving', () => {
  beforeEach(() => {
    onlineStore.items = []
    invalidateLearningItemsCache()
  })

  it('saves valid bulk vocabulary entries to the online store', async () => {
    await addManyLearningItems([
      { english: 'I live in Germany.', german: 'Ich lebe in Deutschland.' },
      { english: 'I work every day.', german: 'Ich arbeite jeden Tag.' },
    ])

    expect(onlineStore.items).toHaveLength(2)
    expect(onlineStore.items[0]).toMatchObject({
      english: 'I live in Germany.',
      german: 'Ich lebe in Deutschland.',
      status: 'active',
    })
  })
})
