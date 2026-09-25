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

// Rolls forward until the date is today or later. The guard stops a runaway
// loop if a date is ever stored wrong: weekly for 10 years is about 520 steps.
export function nextChargeDate(endDate, frequency, today = new Date()) {
  const step = STEPS[frequency] ?? STEPS.monthly
  let date = endDate

  for (let guard = 0; daysUntil(date, today) < 0 && guard < 600; guard += 1) {
    date = step.days ? addDays(date, step.days) : addMonths(date, step.months)
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
