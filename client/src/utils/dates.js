// Trial dates, the risk named in my proposal.
//
// The trap: new Date('2026-09-21') is read as midnight UTC, which in the
// Philippines (UTC+8) is 8am, and in a timezone west of UTC is the day BEFORE.
// So a trial could show "2 days" when it should say "1 day". The fix is to
// never let JavaScript guess: split the "YYYY-MM-DD" string ourselves and
// build the date at local midnight, then compare whole days.

function localMidnight(year, monthIndex, day) {
  return new Date(year, monthIndex, day)
}

// Whole days from today until the trial ends. 0 = today, 1 = tomorrow,
// negative = already ended.
export function daysUntil(dateString, today = new Date()) {
  const [year, month, day] = dateString.split('-').map(Number)
  const end = localMidnight(year, month - 1, day)
  const start = localMidnight(today.getFullYear(), today.getMonth(), today.getDate())
  // Math.round, not floor: a daylight-saving change makes one "day" 23 or 25
  // hours long in some countries.
  return Math.round((end - start) / 86_400_000)
}

// Which Badge to show. "Ending in 48h" on the dashboard means 0 to 2 days.
export function urgencyLevel(days) {
  if (days < 0) return 'later'
  if (days <= 2) return 'urgent'
  if (days <= 7) return 'soon'
  return 'later'
}

// The words next to each subscription.
export function describeDaysLeft(days) {
  if (days < 0) return 'Ended'
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return `In ${days} days`
}

// "Sat, Sep 26, 2026" for the details pop-up. Built from the parts, like
// daysUntil, so it can't slip to the day before in some timezones.
export function formatLongDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number)
  return localMidnight(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// A "YYYY-MM-DD" string for a date some days from today, in local time.
// Used for sample data, so the demo always has trials ending soon.
export function isoDateFromToday(offsetDays, today = new Date()) {
  const date = localMidnight(today.getFullYear(), today.getMonth(), today.getDate() + offsetDays)
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
