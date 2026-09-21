// Money. Each subscription stores its own currency code, so a Netflix plan in
// pesos and a Spotify plan in dollars can sit side by side.
//
// Intl.NumberFormat handles the symbol, the commas and the right number of
// decimals for each currency (two for PHP and USD, none for JPY and KRW).

export const CURRENCIES = [
  { code: 'PHP', label: 'PHP · Philippine peso' },
  { code: 'USD', label: 'USD · US dollar' },
  { code: 'EUR', label: 'EUR · Euro' },
  { code: 'GBP', label: 'GBP · British pound' },
  { code: 'JPY', label: 'JPY · Japanese yen' },
  { code: 'KRW', label: 'KRW · Korean won' },
  { code: 'SGD', label: 'SGD · Singapore dollar' },
  { code: 'AUD', label: 'AUD · Australian dollar' },
  { code: 'CAD', label: 'CAD · Canadian dollar' },
]

export const CURRENCY_CODES = CURRENCIES.map((currency) => currency.code)

export const DEFAULT_CURRENCY = 'PHP'

// Subscriptions saved before currencies existed were all in dollars.
export const LEGACY_CURRENCY = 'USD'

// Building a formatter is slow-ish, so keep one per currency.
const formatters = new Map()

export function formatPrice(amount, currency = LEGACY_CURRENCY) {
  if (!formatters.has(currency)) {
    formatters.set(currency, new Intl.NumberFormat('en-US', { style: 'currency', currency }))
  }
  return formatters.get(currency).format(Number(amount) || 0)
}

// Adds prices up per currency, because pesos and dollars can't be added
// together without an exchange rate. Returns something like "₱549.00 + $15.99",
// or a single amount when everything shares one currency.
export function formatTotals(items) {
  const totals = new Map()
  for (const { price, currency = LEGACY_CURRENCY } of items) {
    totals.set(currency, (totals.get(currency) ?? 0) + Number(price))
  }
  if (totals.size === 0) return formatPrice(0, DEFAULT_CURRENCY)
  return [...totals].map(([currency, total]) => formatPrice(total, currency)).join(' + ')
}
