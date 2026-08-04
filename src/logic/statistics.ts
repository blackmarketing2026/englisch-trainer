import type { LearningItem } from '../types/learning'
import type { LearningSession } from '../types/session'
import { todayKey } from '../utils/dates'

export interface Statistics {
  totalTrainingDays: number
  currentStreak: number
  longestStreak: number
  totalTrainingSeconds: number
  totalCorrect: number
  totalIncorrect: number
  hitRate: number
  masteredCount: number
  activeCount: number
  waitingCount: number
  todayCorrect: number
  todayIncorrect: number
}

export function calculateStatistics(items: LearningItem[], sessions: LearningSession[], now = new Date()): Statistics {
  const completedDates = new Set(
    sessions
      .filter((session) => session.phaseOneCompleted || session.phaseTwoCompleted || session.phaseThreeCompleted)
      .map((session) => todayKey(new Date(session.startedAt))),
  )
  const sortedDates = [...completedDates].sort()
  let longestStreak = 0
  let running = 0
  let previousTime = 0
  for (const date of sortedDates) {
    const time = new Date(`${date}T00:00:00`).getTime()
    running = previousTime && time - previousTime === 86_400_000 ? running + 1 : 1
    longestStreak = Math.max(longestStreak, running)
    previousTime = time
  }

  let currentStreak = 0
  const cursor = new Date(todayKey(now))
  while (completedDates.has(todayKey(cursor))) {
    currentStreak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  const totalCorrect = items.reduce((sum, item) => sum + item.correctCount, 0)
  const totalIncorrect = items.reduce((sum, item) => sum + item.incorrectCount, 0)
  const today = todayKey(now)
  const todaySessions = sessions.filter((session) => todayKey(new Date(session.startedAt)) === today)

  return {
    totalTrainingDays: completedDates.size,
    currentStreak,
    longestStreak,
    totalTrainingSeconds: sessions.reduce(
      (sum, session) =>
        sum + session.phaseOneDurationSeconds + session.phaseTwoDurationSeconds + session.phaseThreeDurationSeconds,
      0,
    ),
    totalCorrect,
    totalIncorrect,
    hitRate: totalCorrect + totalIncorrect === 0 ? 0 : Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100),
    masteredCount: items.filter((item) => item.status === 'mastered').length,
    activeCount: items.filter((item) => item.status === 'active').length,
    waitingCount: items.filter((item) => item.status === 'waiting').length,
    todayCorrect: todaySessions.reduce((sum, session) => sum + session.correctItemIds.length, 0),
    todayIncorrect: todaySessions.reduce((sum, session) => sum + session.incorrectItemIds.length, 0),
  }
}
