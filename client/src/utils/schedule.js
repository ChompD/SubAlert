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

// The nth charge counted from the subscription's own date: n = 0 is endDate
// itself, n = 1 one billing cycle later, and so on.
//
// Always counted from the ORIGINAL date, never from the charge before. Going
// charge to charge, a plan on the 31st became 28 February (the clamp is right
// for February), then 28 March, 28 April... stuck on the 28th for good, so the
// app showed renewals up to 3 days early and missed "due today". From the
// original date, addMonths clamps each month on its own: 31 Jan, 28 Feb,
// 31 Mar, 30 Apr, 31 May.
export function chargeOn(endDate, frequency, n) {
  const step = STEPS[frequency] ?? STEPS.monthly
  return step.days ? addDays(endDate, step.days * n) : addMonths(endDate, step.months * n)
}

// Which charge (n, as above) is the first one today or later. 0 when the
// date hasn't passed yet, or isn't a usable date.
export function nextChargeIndex(endDate, frequency, today = new Date()) {
  const behind = -daysUntil(endDate, today)
  if (!(behind > 0)) return 0

  // Jump most of the way in one go instead of one cycle at a time: a week is
  // exactly 7 days and a month at most 31, so this n is never past today.
  // Then step forward to the first charge that is today or later; for a
  // monthly plan from 2000 that's a few dozen steps, not a few hundred.
  const step = STEPS[frequency] ?? STEPS.monthly
  let n = Math.floor(behind / (step.days ?? 31 * step.months))
  while (daysUntil(chargeOn(endDate, frequency, n), today) < 0) n += 1
  return n
}

// The first charge on or after today: "Renews in 12 days" on a kept plan.
export function nextChargeDate(endDate, frequency, today = new Date()) {
  return chargeOn(endDate, frequency, nextChargeIndex(endDate, frequency, today))
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
