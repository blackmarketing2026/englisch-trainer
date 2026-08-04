import { describe, expect, it, vi } from 'vitest'
import { calculateRemainingSeconds } from './useCountdownTimer'

describe('timer calculations', () => {
  it('stops at 0', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000)
    expect(calculateRemainingSeconds(1_000, 10)).toBe(0)
    vi.restoreAllMocks()
  })

  it('never shows negative seconds', () => {
    vi.spyOn(Date, 'now').mockReturnValue(5_000)
    expect(calculateRemainingSeconds(1_000, 10)).toBe(0)
    vi.restoreAllMocks()
  })

  it('keeps paused remaining seconds', () => {
    expect(calculateRemainingSeconds(undefined, 42)).toBe(42)
  })

  it('restores from target timestamps', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000)
    expect(calculateRemainingSeconds(31_000, 0)).toBe(30)
    vi.restoreAllMocks()
  })
})
