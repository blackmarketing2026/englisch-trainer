import { useCallback } from 'react'
import { defaultSettings } from '../types/settings'
import { getSettings, updateSettings } from '../services/settingsService'
import { useAsyncData } from './useAsyncData'

export function useSettings() {
  const result = useAsyncData(useCallback(() => getSettings(), []), defaultSettings)
  return {
    ...result,
    update: async (patch: Partial<typeof defaultSettings>) => {
      const next = await updateSettings(patch)
      result.setData(next)
      return next
    },
  }
}
