import type { LearningSession, TrainingState } from '../types/session'
import { nowIso, todayKey } from '../utils/dates'
import { createId } from '../utils/ids'
import { db } from './database'
import { getSettings } from './settingsService'

export async function getAllSessions() {
  return db.sessions.orderBy('startedAt').reverse().toArray()
}

export async function getTodayOpenSession(): Promise<LearningSession | undefined> {
  const sessions = await db.sessions.toArray()
  return sessions
    .filter((session) => todayKey(new Date(session.startedAt)) === todayKey() && !session.completedAt)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0]
}

export async function createOrGetTodaySession(): Promise<LearningSession> {
  const open = await getTodayOpenSession()
  if (open) return open
  const settings = await getSettings()
  const session: LearningSession = {
    id: createId('session'),
    startedAt: nowIso(),
    state: 'idle',
    phaseOneDurationSeconds: settings.phaseOneMinutes * 60,
    phaseTwoDurationSeconds: settings.phaseTwoMinutes * 60,
    phaseThreeDurationSeconds: settings.phaseThreeMinutes * 60,
    phaseOneCompleted: false,
    phaseTwoCompleted: false,
    phaseThreeCompleted: false,
    shownItemIds: [],
    correctItemIds: [],
    incorrectItemIds: [],
    masteredItemIds: [],
    activatedItemIds: [],
  }
  await db.sessions.add(session)
  return session
}

export async function updateSession(id: string, patch: Partial<LearningSession>) {
  await db.sessions.update(id, patch)
}

export async function setSessionState(id: string, state: TrainingState) {
  await updateSession(id, { state })
}

export async function appendSessionIds(
  sessionId: string,
  patch: Partial<Pick<LearningSession, 'shownItemIds' | 'correctItemIds' | 'incorrectItemIds' | 'masteredItemIds' | 'activatedItemIds'>>,
) {
  const session = await db.sessions.get(sessionId)
  if (!session) return
  await db.sessions.put({
    ...session,
    shownItemIds: [...session.shownItemIds, ...(patch.shownItemIds ?? [])],
    correctItemIds: [...session.correctItemIds, ...(patch.correctItemIds ?? [])],
    incorrectItemIds: [...session.incorrectItemIds, ...(patch.incorrectItemIds ?? [])],
    masteredItemIds: [...session.masteredItemIds, ...(patch.masteredItemIds ?? [])],
    activatedItemIds: [...session.activatedItemIds, ...(patch.activatedItemIds ?? [])],
  })
}

export async function completePhase(sessionId: string, phase: 1 | 2 | 3) {
  const patch: Partial<LearningSession> =
    phase === 1
      ? { phaseOneCompleted: true, state: 'phase1_completed' }
      : phase === 2
        ? { phaseTwoCompleted: true, state: 'phase2_completed' }
        : { phaseThreeCompleted: true, state: 'completed', completedAt: nowIso() }
  await updateSession(sessionId, patch)
}

export async function endTraining(sessionId: string, completedPhase: 1 | 2 | 3) {
  const phasePatch: Partial<LearningSession> =
    completedPhase === 1
      ? { phaseOneCompleted: true }
      : completedPhase === 2
        ? { phaseTwoCompleted: true }
        : { phaseThreeCompleted: true }

  await updateSession(sessionId, {
    ...phasePatch,
    state: 'completed',
    completedAt: nowIso(),
  })
}
