// What a valid subscription looks like, checked on the server because the
// browser can be bypassed: anyone can send the API a request by hand.
//
// The lists match the client's (client/src/utils/money.js and icons.js). If
// you add a currency or an icon there, add it here too, or saving one will
// fail with a 400.

export const CURRENCIES = ['PHP', 'USD', 'EUR', 'GBP', 'JPY', 'KRW', 'SGD', 'AUD', 'CAD']
const FREQUENCIES = ['weekly', 'monthly', 'quarterly', 'yearly']
const STATUSES = ['keep', 'cancel', 'undecided']
const ICONS = [
  'letter', 'video', 'music', 'cloud', 'games', 'news', 'fitness', 'study', 'shopping',
  'work', 'code', 'design', 'phone', 'internet', 'food', 'transport', 'health',
]
const COLORS = ['blue', 'green', 'orange', 'red', 'purple', 'gray']

// Only these can be set by a request. Anything else in the body (user_id,
// id, created_at...) is ignored, so nobody can move a row to another account.
export const FIELDS = ['name', 'price', 'currency', 'frequency', 'endDate', 'status', 'icon', 'color', 'note']

// A real calendar day in YYYY-MM-DD. The pattern alone would let 2026-02-30
// through, and Postgres would answer that with a 500.
function isRealDate(text) {
  if (typeof text !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(text)) return false
  const [year, month, day] = text.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

// Takes a whole subscription (for a create, or an edit already merged with
// what's saved) and returns { errors, value }. Missing optional fields get
// the same defaults as the database.
export function validateSubscription(input) {
  const errors = []

  const name = typeof input.name === 'string' ? input.name.trim() : ''
  if (!name || name.length > 80) errors.push('Enter a service name of 80 characters or fewer')

  // A number, or a string of one ("549.00"). An empty string is NOT zero,
  // even though Number('') says it is.
  const price = typeof input.price === 'number' || (typeof input.price === 'string' && input.price.trim() !== '')
    ? Number(input.price)
    : NaN
  if (!Number.isFinite(price) || price < 0 || price > 9999999) errors.push('Enter a price from 0 to 9,999,999')

  const currency = input.currency ?? 'PHP'
  if (!CURRENCIES.includes(currency)) errors.push('Pick a currency from the list')

  const frequency = input.frequency ?? 'monthly'
  if (!FREQUENCIES.includes(frequency)) errors.push('Pick how often it bills')

  if (!isRealDate(input.endDate)) errors.push('Enter the subscription end date')

  const status = input.status ?? 'undecided'
  if (!STATUSES.includes(status)) errors.push('Pick keep, cancel or undecided')

  const icon = input.icon ?? 'letter'
  if (!ICONS.includes(icon)) errors.push('Pick an icon from the list')

  const color = input.color ?? 'gray'
  if (!COLORS.includes(color)) errors.push('Pick a colour from the list')

  const note = input.note == null ? '' : typeof input.note === 'string' ? input.note.trim() : null
  if (note === null || note.length > 500) errors.push('Keep the note under 500 characters')

  return {
    errors,
    value: {
      name,
      // Rounded to the cent, which is all NUMERIC(10,2) keeps anyway.
      price: Math.round(price * 100) / 100,
      currency,
      frequency,
      endDate: input.endDate,
      status,
      icon,
      color,
      note,
    },
  }
}
