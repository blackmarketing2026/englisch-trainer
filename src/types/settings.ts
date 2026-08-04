export interface AppSettings {
  phaseOneMinutes: number
  phaseTwoMinutes: number
  phaseThreeMinutes: number
  activePoolSize: number
  requiredCorrectAnswers: number
  soundEnabled: boolean
  vibrationEnabled: boolean
  darkMode: boolean
  preventImmediateRepeats: boolean
  autoStartNextPhase: boolean
}

export const defaultSettings: AppSettings = {
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
}
