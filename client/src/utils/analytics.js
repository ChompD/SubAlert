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
//   Money      Added up per currency, never across: ₱ and $ can't be added
//              without an exchange rate. The user's default currency is the
//              main figure; any others are listed beside it.
//
// Every function takes `today`, so it can be checked against fixed dates.

import { addDays, addMonths, isoDateFromToday } from './dates.js'
import { LEGACY_CURRENCY, monthlyAmount } from './money.js'
import { addCycle, effectiveDate, hasEnded } from './schedule.js'

const currencyOf = (sub) => sub.currency ?? LEGACY_CURRENCY

// Still going and not cancelled: what the user is actually paying for.
export function spendingSubscriptions(subscriptions, today = new Date()) {
  return subscriptions.filter((sub) => sub.status !== 'cancel' && !hasEnded(sub, today))
}

// Sums a number per currency, then splits it into the main currency and the
// rest, biggest first: { main: 1847, others: [{ currency: 'USD', amount: 36 }] }.
function splitByCurrency(entries, mainCurrency) {
  const totals = new Map()
  for (const { currency, amount } of entries) totals.set(currency, (totals.get(currency) ?? 0) + amount)
  return {
    main: totals.get(mainCurrency) ?? 0,
    others: [...totals]
      .filter(([currency]) => currency !== mainCurrency)
      .map(([currency, amount]) => ({ currency, amount }))
      .sort((a, b) => b.amount - a.amount),
  }
}

const monthlyEntries = (subs) =>
  subs.map((sub) => ({ currency: currencyOf(sub), amount: monthlyAmount(sub.price, sub.frequency) }))

// Per month and per year, whatever each one's billing cycle. A year is exactly
// 12 of these months, so the yearly figure is the monthly one times 12.
export function spendTotals(subscriptions, mainCurrency, today = new Date()) {
  const monthly = splitByCurrency(monthlyEntries(spendingSubscriptions(subscriptions, today)), mainCurrency)
  return {
    monthly,
    yearly: {
      main: monthly.main * 12,
      others: monthly.others.map(({ currency, amount }) => ({ currency, amount: amount * 12 })),
    },
  }
}

export function savedByCancelling(subscriptions, mainCurrency) {
  return splitByCurrency(monthlyEntries(subscriptions.filter((sub) => sub.status === 'cancel')), mainCurrency)
}

// The priciest per month, biggest first, in the main currency only: ₱1,200
// and $20 can't be ranked against each other. Ties go alphabetically, so the
// order never jumps around between visits.
export function topSubscriptions(subscriptions, mainCurrency, limit = 5, today = new Date()) {
  return spendingSubscriptions(subscriptions, today)
    .filter((sub) => currencyOf(sub) === mainCurrency)
    .map((sub) => ({ subscription: sub, monthly: monthlyAmount(sub.price, sub.frequency) }))
    .sort((a, b) => b.monthly - a.monthly || a.subscription.name.localeCompare(b.subscription.name))
    .slice(0, limit)
}

// The single priciest one: the top of that same list, so the headline card
// and the list can never disagree. null when nothing is in the main currency.
export function mostExpensive(subscriptions, mainCurrency, today = new Date()) {
  return topSubscriptions(subscriptions, mainCurrency, 1, today)[0] ?? null
}

// How many of the still-running subscriptions have each decision.
export function decisionCounts(subscriptions, today = new Date()) {
  const counts = { keep: 0, cancel: 0, undecided: 0 }
  for (const sub of subscriptions) {
    if (!hasEnded(sub, today) && sub.status in counts) counts[sub.status] += 1
  }
  return counts
}

// Every date a spending subscription charges, from its next charge up to and
// including `until` ("YYYY-MM-DD"; ISO dates compare correctly as text).
function chargeDates(sub, today, until) {
  const dates = []
  let date = effectiveDate(sub, today)
  for (let guard = 0; date <= until && guard < 600; guard += 1) {
    dates.push(date)
    date = addCycle(date, sub.frequency)
  }
  return dates
}

// Charges in the next `days` days (today included), soonest first, with the
// total per currency.
export function upcomingCharges(subscriptions, mainCurrency, days = 30, today = new Date()) {
  const from = isoDateFromToday(0, today)
  const until = addDays(from, days)
  const charges = spendingSubscriptions(subscriptions, today)
    .flatMap((sub) =>
      chargeDates(sub, today, until).map((date) => ({
        subscription: sub,
        date,
        amount: Number(sub.price),
        currency: currencyOf(sub),
      }))
    )
    .sort((a, b) => a.date.localeCompare(b.date) || a.subscription.name.localeCompare(b.subscription.name))
  return { days, charges, totals: splitByCurrency(charges, mainCurrency) }
}

// What will be charged in each of the next 12 calendar months, this month
// first (from today on). Real charges on real dates, so the month a yearly
// plan renews stands out.
export function monthlyForecast(subscriptions, mainCurrency, today = new Date()) {
  const firstOfMonth = `${isoDateFromToday(0, today).slice(0, 7)}-01`
  const months = Array.from({ length: 12 }, (_, i) => addMonths(firstOfMonth, i).slice(0, 7))
  const until = addDays(addMonths(firstOfMonth, 12), -1)

  const entriesByMonth = new Map(months.map((month) => [month, []]))
  for (const sub of spendingSubscriptions(subscriptions, today)) {
    for (const date of chargeDates(sub, today, until)) {
      entriesByMonth.get(date.slice(0, 7))?.push({ currency: currencyOf(sub), amount: Number(sub.price) })
    }
  }

  return months.map((month) => {
    const [year, monthNumber] = month.split('-').map(Number)
    return {
      month,
      label: new Date(year, monthNumber - 1, 1).toLocaleDateString('en-US', { month: 'short' }),
      year,
      ...splitByCurrency(entriesByMonth.get(month), mainCurrency),
    }
  })
}
