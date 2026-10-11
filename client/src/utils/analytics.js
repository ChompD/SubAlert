// The numbers behind the Analytics page. Plain functions over the list the
// API already returns: nothing is stored, so nothing can go stale, the same
// rule as the Dashboard's summary cards.
//
// The rules, decided once here:
//
//   Spending   Keep and Undecided subscriptions that haven't ended. Undecided
//              counts because nothing has been cancelled yet, so it WILL
//              charge; showing that is the point of the app. Both are treated
//              as repeating every billing cycle.
//   Saved      Cancel, at what it would cost per month (the same rule as the
//              Dashboard's "Saved by cancelling").
//   Ended      Past its date and not kept: not counted anywhere.
//   Money      One currency per account (Account settings, and the server
//              forces it on every subscription), so amounts simply add up.
//
// Every function takes `today`, so it can be checked against fixed dates.

import { addDays, addMonths, isoDateFromToday } from './dates.js'
import { monthlyAmount } from './money.js'
import { chargeOn, hasEnded, nextChargeIndex } from './schedule.js'

// Still going and not cancelled: what the user is actually paying for.
export function spendingSubscriptions(subscriptions, today = new Date()) {
  return subscriptions.filter((sub) => sub.status !== 'cancel' && !hasEnded(sub, today))
}

// What these subscriptions cost per month, added up: a yearly plan counts as
// a twelfth of its price.
const monthlyTotal = (subs) => subs.reduce((sum, sub) => sum + monthlyAmount(sub.price, sub.frequency), 0)

// Per month and per year, whatever each one's billing cycle. A year is exactly
// 12 of these months, so the yearly figure is the monthly one times 12.
export function spendTotals(subscriptions, today = new Date()) {
  const monthly = monthlyTotal(spendingSubscriptions(subscriptions, today))
  return { monthly, yearly: monthly * 12 }
}

// Per month, from everything marked Cancel.
export function savedByCancelling(subscriptions) {
  return monthlyTotal(subscriptions.filter((sub) => sub.status === 'cancel'))
}

// The priciest per month, biggest first. Ties go alphabetically, so the order
// never jumps around between visits.
export function topSubscriptions(subscriptions, limit = 5, today = new Date()) {
  return spendingSubscriptions(subscriptions, today)
    .map((sub) => ({ subscription: sub, monthly: monthlyAmount(sub.price, sub.frequency) }))
    .sort((a, b) => b.monthly - a.monthly || a.subscription.name.localeCompare(b.subscription.name))
    .slice(0, limit)
}

// The single priciest one: the top of that same list, so the headline card
// and the list can never disagree. null when nothing is being paid for.
export function mostExpensive(subscriptions, today = new Date()) {
  return topSubscriptions(subscriptions, 1, today)[0] ?? null
}

// Every date a spending subscription charges, from its next charge up to and
// including `until` ("YYYY-MM-DD"; ISO dates compare correctly as text).
// Counted from the subscription's own date (chargeOn in schedule.js), the
// same way the Dashboard works out "Renews in…", so a plan on the 31st
// charges on the 31st (or the month's last day) here too.
function chargeDates(sub, today, until) {
  const dates = []
  let n = nextChargeIndex(sub.endDate, sub.frequency, today)
  // At most 53 charges fit in a year (weekly); the cap is only a safety net.
  for (let date = chargeOn(sub.endDate, sub.frequency, n); date <= until && dates.length < 600; ) {
    dates.push(date)
    n += 1
    date = chargeOn(sub.endDate, sub.frequency, n)
  }
  return dates
}

// What will be charged in each of the next 12 calendar months, this month
// first (from today on). Real charges on real dates, so the month a yearly
// plan renews stands out.
export function monthlyForecast(subscriptions, today = new Date()) {
  const firstOfMonth = `${isoDateFromToday(0, today).slice(0, 7)}-01`
  const months = Array.from({ length: 12 }, (_, i) => addMonths(firstOfMonth, i).slice(0, 7))
  const until = addDays(addMonths(firstOfMonth, 12), -1)

  const amountByMonth = new Map(months.map((month) => [month, 0]))
  for (const sub of spendingSubscriptions(subscriptions, today)) {
    for (const date of chargeDates(sub, today, until)) {
      const month = date.slice(0, 7)
      if (amountByMonth.has(month)) amountByMonth.set(month, amountByMonth.get(month) + Number(sub.price))
    }
  }

  return months.map((month) => {
    const [year, monthNumber] = month.split('-').map(Number)
    return {
      month,
      label: new Date(year, monthNumber - 1, 1).toLocaleDateString('en-US', { month: 'short' }),
      year,
      amount: amountByMonth.get(month),
    }
  })
}
