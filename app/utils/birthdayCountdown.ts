export type BirthdayEvent = { title: string; eventDate: string; recurring: boolean; kind: string }

// Feb 29 birthdays are celebrated on March 1 in non-leap years.
export function nextBirthday(events: BirthdayEvent[], now: Date) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return events.filter(event => event.kind === 'birthday').flatMap(event => {
    const [year, month, day] = event.eventDate.split('-').map(Number)
    if (!year || !month || !day) return []
    let date = new Date(event.recurring ? today.getFullYear() : year, month - 1, day)
    if (event.recurring && date < today) date = new Date(today.getFullYear() + 1, month - 1, day)
    if (Number.isNaN(date.getTime()) || date < today) return []
    return [{ event, date, isToday: date.getTime() === today.getTime() }]
  }).sort((a, b) => a.date.getTime() - b.date.getTime())[0] || null
}

export function countdownParts(target: Date, now: Date) {
  const seconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000))
  return [Math.floor(seconds / 86400), Math.floor(seconds % 86400 / 3600), Math.floor(seconds % 3600 / 60), seconds % 60]
}
