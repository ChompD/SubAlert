// "Paid with": how a subscription is paid, like GCash or a credit card. Just
// the NAME, never an account or card number: this is stored on a server and
// shown on screen, so it must hold nothing that could be used to take money.
//
// The same rules run on the server (server/subscriptionRules.js), which has
// the final say; these give the message before anything is sent.

export const PAYMENT_MAX = 40

// Offered as you type, but anything can be typed. Filipino wallets and banks
// first, since that's who uses the app, then the general ones.
export const PAYMENT_SUGGESTIONS = [
  'GCash',
  'Maya',
  'MariBank',
  'GoTyme',
  'BPI',
  'BDO',
  'UnionBank',
  'Metrobank',
  'Security Bank',
  'Credit card',
  'Debit card',
  'PayPal',
  'App Store',
  'Google Play',
]

export const ACCOUNT_NUMBER_MESSAGE = 'Write just the name, like GCash. Never an account or card number'

// Spaces tidied: "  G   Cash " becomes "G Cash".
export const tidyPaymentMethod = (text = '') => text.trim().replace(/\s+/g, ' ')

// Six or more digits in a row, even split by spaces or dashes, looks like an
// account, card or phone number. A card's last four digits are fine.
export const looksLikeAccountNumber = (text = '') => /[0-9]{6}/.test(text.replace(/[\s-]/g, ''))

// What two spellings have in common, for grouping: "Gcash", "GCash" and
// "g cash" are all "gcash".
export const paymentKey = (text = '') => tidyPaymentMethod(text).toLowerCase().replace(/[\s-]/g, '')

// How to show it: the suggestion's own spelling when it is one of them
// ("gcash" is shown as "GCash"), otherwise as the user typed it.
export function paymentLabel(text = '') {
  const key = paymentKey(text)
  return PAYMENT_SUGGESTIONS.find((suggestion) => paymentKey(suggestion) === key) ?? tidyPaymentMethod(text)
}
