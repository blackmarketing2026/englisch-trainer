import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface TimerSnapshot {
  remainingSeconds: number
  targetTimestamp?: number
  paused: boolean
}

export function calculateRemainingSeconds(targetTimestamp?: number, fallbackSeconds = 0) {
  if (!targetTimestamp) return Math.max(0, fallbackSeconds)
  return Math.max(0, Math.ceil((targetTimestamp - Date.now()) / 1000))
}

export function useCountdownTimer(initialSeconds: number, onComplete?: () => void) {
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds)
  const [targetTimestamp, setTargetTimestamp] = useState<number>()
  const [paused, setPaused] = useState(true)
  const completedRef = useRef(false)

  const tick = useCallback(() => {
    setRemainingSeconds((current) => {
      const next = calculateRemainingSeconds(targetTimestamp, current)
      if (next === 0 && !completedRef.current) {
        completedRef.current = true
        setPaused(true)
        setTargetTimestamp(undefined)
        onComplete?.()
      }
      return next
    })
  }, [onComplete, targetTimestamp])

  useEffect(() => {
    if (paused || !targetTimestamp) return undefined
    tick()
    const interval = window.setInterval(tick, 250)
    return () => window.clearInterval(interval)
  }, [paused, targetTimestamp, tick])

  const start = useCallback((seconds = remainingSeconds) => {
    completedRef.current = false
    setRemainingSeconds(Math.max(0, seconds))
    setTargetTimestamp(Date.now() + Math.max(0, seconds) * 1000)
    setPaused(false)
  }, [remainingSeconds])

  const pause = useCallback(() => {
    const next = calculateRemainingSeconds(targetTimestamp, remainingSeconds)
    setRemainingSeconds(next)
    setTargetTimestamp(undefined)
    setPaused(true)
  }, [remainingSeconds, targetTimestamp])

  const resume = useCallback(() => {
    if (remainingSeconds <= 0) return
    setTargetTimestamp(Date.now() + remainingSeconds * 1000)
    setPaused(false)
  }, [remainingSeconds])

  const restore = useCallback((snapshot: TimerSnapshot) => {
    const next = calculateRemainingSeconds(snapshot.targetTimestamp, snapshot.remainingSeconds)
    setRemainingSeconds(next)
    setTargetTimestamp(snapshot.paused ? undefined : Date.now() + next * 1000)
    setPaused(snapshot.paused || next === 0)
    completedRef.current = next === 0
  }, [])

  const snapshot = useMemo<TimerSnapshot>(
    () => ({ remainingSeconds, targetTimestamp, paused }),
    [paused, remainingSeconds, targetTimestamp],
  )

  return { remainingSeconds, targetTimestamp, paused, start, pause, resume, restore, snapshot }
}
