import type { LearningItem, LearningItemDraft } from '../types/learning'

export interface ValidationResult {
  valid: boolean
  message?: string
}

export function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

export function validateDraft(draft: LearningItemDraft, existing: LearningItem[]): ValidationResult {
  const english = normalizeText(draft.english)
  const german = normalizeText(draft.german)

  if (!english) return { valid: false, message: 'Englisch darf nicht leer sein.' }
  if (!german) return { valid: false, message: 'Deutsch darf nicht leer sein.' }

  const duplicate = existing.some(
    (item) =>
      item.english.trim().toLowerCase() === english.toLowerCase() &&
      item.german.trim().toLowerCase() === german.toLowerCase(),
  )

  if (duplicate) return { valid: false, message: 'Dieser Lerninhalt ist bereits vorhanden.' }
  return { valid: true }
}

export interface BulkLinePreview {
  line: number
  english: string
  german: string
  error?: string
}

export function parseBulkInput(input: string, existing: LearningItem[]): BulkLinePreview[] {
  const seen = new Set<string>()
  return input
    .split(/\r?\n/)
    .map((line, index) => ({ raw: line.trim(), line: index + 1 }))
    .filter((entry) => entry.raw.length > 0)
    .map((entry) => {
      const parts = entry.raw.split('|').map(normalizeText)
      const english = parts[0] ?? ''
      const german = parts[1] ?? ''
      const key = `${english.toLowerCase()}|${german.toLowerCase()}`
      let error: string | undefined
      if (parts.length !== 2) error = 'Format: Englisch | Deutsch'
      if (!english || !german) error = 'Englisch und Deutsch sind Pflicht.'
      if (seen.has(key)) error = 'Diese Zeile ist doppelt.'
      if (!error && !validateDraft({ english, german }, existing).valid) {
        error = 'Dieser Lerninhalt ist bereits vorhanden.'
      }
      seen.add(key)
      return { line: entry.line, english, german, error }
    })
}
