import { daysUntil } from './dates.js'
import { monthlyAmount } from './money.js'
import { effectiveDate, hasEnded } from './schedule.js'

// Search, filter and sort for the Dashboard list. Plain functions with no
// React in them, so they are easy to test on their own.

export const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'soon', label: 'Due soon' },
  { key: 'keep', label: 'Keep' },
  { key: 'cancel', label: 'Cancel' },
  { key: 'undecided', label: 'Undecided' },
  { key: 'ended', label: 'Ended' },
]

export const SORTS = [
  { key: 'endDate', label: 'Date (soonest)' },
  { key: 'endDateDesc', label: 'Date (latest)' },
  { key: 'name', label: 'Name (A to Z)' },
  { key: 'price', label: 'Price (highest)' },
]

export const DEFAULT_FILTER = 'all'
export const DEFAULT_SORT = 'endDate'

// "Due soon" means the same as the Urgent and Soon badges: charges today or
// within the next 7 days. A kept subscription uses its next charge date, so a
// renewal counts; a finished one does not.
function isDueSoon(subscription) {
  const days = daysUntil(effectiveDate(subscription))
  return days >= 0 && days <= 7
}

function matchesFilter(subscription, filter) {
  if (filter === 'soon') return isDueSoon(subscription)
  if (filter === 'ended') return hasEnded(subscription)
  if (filter === 'keep' || filter === 'cancel' || filter === 'undecided') {
    return subscription.status === filter
  }
  return true
}

// Sorted by the date actually shown, so a renewal sits by its next charge.
const byEndDate = (a, b) => effectiveDate(a).localeCompare(effectiveDate(b))

const COMPARATORS = {
  endDate: byEndDate,
  endDateDesc: (a, b) => byEndDate(b, a),
  name: (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  // Prices in different currencies can't be compared without an exchange rate,
  // so they are grouped by currency first. Within a currency they are compared
  // per month, so ₱1,200 a year ranks below ₱549 a month.
  price: (a, b) =>
    a.currency.localeCompare(b.currency) ||
    monthlyAmount(b.price, b.frequency) - monthlyAmount(a.price, a.frequency),
}

// How many subscriptions each filter pill would show, for the counts on them.
export function countByFilter(subscriptions) {
  return Object.fromEntries(
    FILTERS.map(({ key }) => [key, subscriptions.filter((sub) => matchesFilter(sub, key)).length])
  )
}

export function applyFilters(subscriptions, { query = '', filter = DEFAULT_FILTER, sort = DEFAULT_SORT }) {
  const needle = query.trim().toLowerCase()

  return subscriptions
    .filter((sub) => !needle || sub.name.toLowerCase().includes(needle))
    .filter((sub) => matchesFilter(sub, filter))
    // A copy before sorting: .sort() changes the array it is called on, and
    // the original is React state, which must never be changed in place.
    .slice()
    .sort(COMPARATORS[sort] ?? COMPARATORS[DEFAULT_SORT])
}
