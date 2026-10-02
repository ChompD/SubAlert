import { addDays, addMonths, daysUntil } from './dates.js'

// What happens after a subscription's date passes depends on the decision:
//
//   Keep       it renewed, so the date rolls forward by its billing cycle
//              ("Renews in 12 days"). Nothing is saved: the next date is
//              worked out on every render from the date and the frequency,
//              the same as days left and the urgency badges, so it can never
//              be out of date or disagree with what is stored.
//   Cancel     it is finished ("Ended").
//   Undecided  it is finished, and the app asks whether it was cancelled.

const STEPS = {
  weekly: { days: 7 },
  monthly: { months: 1 },
  quarterly: { months: 3 },
  yearly: { months: 12 },
}

// One billing cycle later: "2026-09-20" monthly is "2026-10-20".
export function addCycle(date, frequency) {
  const step = STEPS[frequency] ?? STEPS.monthly
  return step.days ? addDays(date, step.days) : addMonths(date, step.months)
}

// Rolls forward until the date is today or later. The guard stops a runaway
// loop if a date is ever stored wrong. Dates start at 2000 (validation.js),
// and weekly from 2000 to 2100 is about 5,300 steps, so 6,000 covers every
// date the app accepts; 600 used to stop a weekly plan from before ~2015
// short, leaving it "Renews ended".
export function nextChargeDate(endDate, frequency, today = new Date()) {
  let date = endDate

  for (let guard = 0; daysUntil(date, today) < 0 && guard < 6000; guard += 1) {
    date = addCycle(date, frequency)
  }
  return date
}

// The date the app should actually show and sort by.
export function effectiveDate(subscription, today = new Date()) {
  return subscription.status === 'keep'
    ? nextChargeDate(subscription.endDate, subscription.frequency, today)
    : subscription.endDate
}

// True once a kept subscription has rolled past its original date, which is
// what makes the row say "Renews" rather than "Ends".
export function isRenewal(subscription, today = new Date()) {
  return subscription.status === 'keep' && daysUntil(subscription.endDate, today) < 0
}

// Finished: the date passed and it was not kept.
export function hasEnded(subscription, today = new Date()) {
  return subscription.status !== 'keep' && daysUntil(subscription.endDate, today) < 0
}
