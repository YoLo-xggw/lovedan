import { describe, expect, it } from 'vitest'
import { countdownParts, nextBirthday } from '../app/utils/birthdayCountdown'

const birthday = (date: string, recurring = true) => ({ title: 'TA的生日', eventDate: date, kind: 'birthday', recurring })

describe('birthday countdown', () => {
  it('keeps a birthday as today until midnight, then rolls over to next year', () => {
    const events = [birthday('2000-10-20')]
    expect(nextBirthday(events, new Date(2026, 9, 20, 23, 59))?.isToday).toBe(true)
    expect(nextBirthday(events, new Date(2026, 9, 21))?.date.getFullYear()).toBe(2027)
  })
  it('selects the next birthday across New Year and excludes expired one-off events', () => {
    const result = nextBirthday([birthday('2000-01-02'), birthday('2026-12-29', false), { ...birthday('2026-12-31'), kind: 'anniversary' }], new Date(2026, 11, 30))
    expect(result?.date).toEqual(new Date(2027, 0, 2))
    expect(nextBirthday([], new Date())).toBeNull()
  })
  it('handles Feb 29 consistently in leap years and other years', () => {
    expect(nextBirthday([birthday('2000-02-29')], new Date(2027, 0, 1))?.date).toEqual(new Date(2027, 2, 1))
    expect(nextBirthday([birthday('2000-02-29')], new Date(2028, 0, 1))?.date).toEqual(new Date(2028, 1, 29))
  })
  it('splits the countdown and clamps elapsed dates to zero', () => {
    const now = new Date(2026, 9, 20, 10, 30, 10)
    expect(countdownParts(new Date(2026, 9, 22, 12, 33, 14), now)).toEqual([2, 2, 3, 4])
    expect(countdownParts(new Date(2026, 9, 19), now)).toEqual([0, 0, 0, 0])
  })
})
