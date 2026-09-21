// Money. Each subscription stores its own currency code, so a Netflix plan in
// pesos and a Spotify plan in dollars can sit side by side.
//
// Intl.NumberFormat handles the symbol, the commas and the right number of
// decimals for each currency (two for PHP and USD, none for JPY and KRW).

// Short labels ("PHP · ₱") so the drop-down fits beside the price, even on
// a phone. The code says which currency; the symbol is what people recognise.
export const CURRENCIES = [
  { code: 'PHP', label: 'PHP · ₱' },
  { code: 'USD', label: 'USD · $' },
  { code: 'EUR', label: 'EUR · €' },
  { code: 'GBP', label: 'GBP · £' },
  { code: 'JPY', label: 'JPY · ¥' },
  { code: 'KRW', label: 'KRW · ₩' },
  { code: 'SGD', label: 'SGD · S$' },
  { code: 'AUD', label: 'AUD · A$' },
  { code: 'CAD', label: 'CAD · C$' },
]

export const CURRENCY_CODES = CURRENCIES.map((currency) => currency.code)

export const DEFAULT_CURRENCY = 'PHP'

// Subscriptions saved before currencies existed were all in dollars.
export const LEGACY_CURRENCY = 'USD'

// How often a subscription charges. perMonth turns a price into "what this
// costs per month", so a yearly plan and a weekly plan can be added up or
// compared fairly (a year is 12 months, and 52 weeks, so a week is 12/52).
export const FREQUENCIES = [
  { key: 'weekly', label: 'Weekly', short: 'wk', perMonth: 52 / 12 },
  { key: 'monthly', label: 'Monthly', short: 'mo', perMonth: 1 },
  { key: 'quarterly', label: 'Every 3 months', short: '3 mo', perMonth: 1 / 3 },
  { key: 'yearly', label: 'Yearly', short: 'yr', perMonth: 1 / 12 },
]

export const FREQUENCY_KEYS = FREQUENCIES.map((frequency) => frequency.key)

// New subscriptions, and ones saved before frequencies existed, are monthly.
export const DEFAULT_FREQUENCY = 'monthly'

const frequencyOf = (key) => FREQUENCIES.find((f) => f.key === key) ?? FREQUENCIES[1]

// "/mo", "/yr"... for after a price.
export const perFrequency = (key) => `/${frequencyOf(key).short}`

// What a subscription costs per month, whatever its billing cycle.
export const monthlyAmount = (price, frequency) => Number(price) * frequencyOf(frequency).perMonth

// Building a formatter is slow-ish, so keep one per currency.
const formatters = new Map()

export function formatPrice(amount, currency = LEGACY_CURRENCY) {
  if (!formatters.has(currency)) {
    formatters.set(currency, new Intl.NumberFormat('en-US', { style: 'currency', currency }))
  }
  return formatters.get(currency).format(Number(amount) || 0)
}

// Adds up what the subscriptions cost PER MONTH, per currency: a yearly plan
// counts as a twelfth of its price. Pesos and dollars can't be added together
// without an exchange rate, so the result looks like "₱549.00 + $15.99", or a
// single amount when everything shares one currency.
export function formatMonthlyTotals(items) {
  const totals = new Map()
  for (const { price, currency = LEGACY_CURRENCY, frequency } of items) {
    totals.set(currency, (totals.get(currency) ?? 0) + monthlyAmount(price, frequency))
  }
  if (totals.size === 0) return formatPrice(0, DEFAULT_CURRENCY)
  return [...totals].map(([currency, total]) => formatPrice(total, currency)).join(' + ')
}
