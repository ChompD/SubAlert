import { CURRENCY_CODES, FREQUENCY_KEYS } from './money.js'
import { ACCOUNT_NUMBER_MESSAGE, looksLikeAccountNumber, PAYMENT_MAX, tidyPaymentMethod } from './payments.js'

// Checks the forms run before sending anything. They make mistakes quick to
// fix, but they are for convenience only: the server checks everything again,
// because anyone can skip the browser and send a request directly.

// Something, an @, something, a dot, something. Deliberately loose: the only
// real test of an email address is sending it an email.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const PASSWORD_MIN = 8

// bcrypt, which the server uses to hash passwords, only reads the first 72
// BYTES. A plain letter or digit is 1 byte, but an accented letter is 2 and
// an emoji 4, so the limit is counted in bytes, exactly as the server counts
// it (server/app.js), with the same words. Counting characters here instead
// let a 40-character password with emoji through, only for the server to
// refuse it as "over 72 characters".
const PASSWORD_MAX_BYTES = 72
const byteLength = (text) => new TextEncoder().encode(text).length

// The one password rule, for Register, the Account page and demo mode.
// Returns the problem as a sentence, or null.
export function passwordError(password) {
  if (password.length < PASSWORD_MIN) return `Use at least ${PASSWORD_MIN} characters`
  if (byteLength(password) > PASSWORD_MAX_BYTES) {
    return 'Use a shorter password: 72 characters at most, and emoji or accented letters count as 2 to 4'
  }
  return null
}

export const NAME_MAX = 80

// Subscriptions end between these, both included. Outside them is a typo (a
// year typed as 0202), and a kept plan dated centuries ago could never be
// rolled forward to its next charge. The server checks the same range
// (server/subscriptionRules.js). YYYY-MM-DD strings compare correctly as text.
export const DATE_MIN = '2000-01-01'
export const DATE_MAX = '2100-12-31'

export function emailError(email) {
  if (!email.trim()) return 'Enter your email'
  if (!EMAIL_PATTERN.test(email.trim())) return 'Enter a valid email, like name@email.com'
  return null
}

// Returns an object with one message per field that has a problem, or {} when
// everything is fine.
export function validateLogin({ email, password }) {
  const errors = {}
  const emailProblem = emailError(email)
  if (emailProblem) errors.email = emailProblem
  if (!password) errors.password = 'Enter your password'
  return errors
}

// High enough for currencies with big numbers, like KRW and JPY.
export const PRICE_MAX = 9999999

export const NOTE_MAX = 500

export function validateSubscription({ name, endDate, price, currency, frequency, note = '', paymentMethod = '' }) {
  const errors = {}

  if (!name.trim()) errors.name = 'Enter the service name'
  else if (name.trim().length > NAME_MAX) errors.name = `Keep it under ${NAME_MAX} characters`

  // <input type="date"> always gives "YYYY-MM-DD", or "" when empty.
  if (!endDate) errors.endDate = 'Pick the day the subscription ends'
  else if (endDate < DATE_MIN || endDate > DATE_MAX) errors.endDate = 'Pick a date between 2000 and 2100'

  const amount = Number(price)
  if (price === '') errors.price = 'Enter the renewal price, or 0 if it is free'
  else if (!Number.isFinite(amount) || amount < 0) errors.price = 'Enter a price of 0 or more'
  else if (amount > PRICE_MAX) errors.price = `Enter a price under ${PRICE_MAX.toLocaleString()}`

  if (!CURRENCY_CODES.includes(currency)) errors.currency = 'Pick a currency from the list'
  if (!FREQUENCY_KEYS.includes(frequency)) errors.frequency = 'Pick how often it bills'

  // Optional, so empty is fine. The box stops typing at the limit, but a
  // pasted note could still arrive longer.
  if (note.trim().length > NOTE_MAX) errors.note = `Keep the note under ${NOTE_MAX} characters`

  // Optional too. Only the name of how it's paid, never a number.
  const paidWith = tidyPaymentMethod(paymentMethod)
  if (paidWith.length > PAYMENT_MAX) errors.paymentMethod = `Keep it under ${PAYMENT_MAX} characters`
  else if (looksLikeAccountNumber(paidWith)) errors.paymentMethod = ACCOUNT_NUMBER_MESSAGE

  return errors
}

export function validateRegister({ name, email, password, confirmPassword }) {
  const errors = {}

  if (!name.trim()) errors.name = 'Enter your name'
  else if (name.trim().length > NAME_MAX) errors.name = `Keep your name under ${NAME_MAX} characters`

  const emailProblem = emailError(email)
  if (emailProblem) errors.email = emailProblem

  const passwordProblem = passwordError(password)
  if (passwordProblem) errors.password = passwordProblem

  if (!confirmPassword) errors.confirmPassword = 'Type your password again'
  else if (confirmPassword !== password) errors.confirmPassword = "Passwords don't match"

  return errors
}
