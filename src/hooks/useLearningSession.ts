import { useCallback } from 'react'
import { createOrGetTodaySession, getAllSessions, getTodayOpenSession } from '../services/sessionService'
import type { LearningSession } from '../types/session'
import { useAsyncData } from './useAsyncData'

export function useLearningSession() {
  const result = useAsyncData<LearningSession | undefined>(useCallback(() => getTodayOpenSession(), []), undefined)
  return {
    ...result,
    startOrResume: async () => {
      const session = await createOrGetTodaySession()
      result.setData(session)
      return session
    },
  }
}

export function useSessions() {
  return useAsyncData(useCallback(() => getAllSessions(), []), [])
}
