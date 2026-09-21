import { daysUntil } from './dates.js'

// Search, filter and sort for the Dashboard list. Plain functions with no
// React in them, so they are easy to test on their own.

export const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'soon', label: 'Ending soon' },
  { key: 'keep', label: 'Keep' },
  { key: 'cancel', label: 'Cancel' },
  { key: 'undecided', label: 'Undecided' },
]

export const SORTS = [
  { key: 'endDate', label: 'End date (soonest)' },
  { key: 'endDateDesc', label: 'End date (latest)' },
  { key: 'name', label: 'Name (A to Z)' },
  { key: 'price', label: 'Price (highest)' },
]

export const DEFAULT_FILTER = 'all'
export const DEFAULT_SORT = 'endDate'

// "Ending soon" means the same as the Urgent and Soon badges: ends today or
// within the next 7 days. Trials that already ended don't count.
function isEndingSoon(subscription) {
  const days = daysUntil(subscription.trialEndDate)
  return days >= 0 && days <= 7
}

function matchesFilter(subscription, filter) {
  if (filter === 'soon') return isEndingSoon(subscription)
  if (filter === 'keep' || filter === 'cancel' || filter === 'undecided') {
    return subscription.status === filter
  }
  return true
}

const byEndDate = (a, b) => a.trialEndDate.localeCompare(b.trialEndDate)

const COMPARATORS = {
  endDate: byEndDate,
  endDateDesc: (a, b) => byEndDate(b, a),
  name: (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  // Prices in different currencies can't be compared without an exchange rate,
  // so they are grouped by currency first, then highest price within each.
  price: (a, b) => a.currency.localeCompare(b.currency) || Number(b.price) - Number(a.price),
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
