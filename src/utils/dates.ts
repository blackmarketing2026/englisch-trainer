export function nowIso() {
  return new Date().toISOString()
}

export function formatDate(value?: string) {
  if (!value) return 'Noch nie'
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatDateTime(value?: string) {
  if (!value) return 'Noch nie'
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

export function secondsToClock(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(safe / 60)
  const rest = safe % 60
  return `${minutes.toString().padStart(2, '0')}:${rest.toString().padStart(2, '0')}`
}
