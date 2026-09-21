import { CURRENCY_CODES, FREQUENCY_KEYS } from './money.js'

// Checks the forms run before sending anything. They make mistakes quick to
// fix, but they are for convenience only: the server checks everything again,
// because anyone can skip the browser and send a request directly.

// Something, an @, something, a dot, something. Deliberately loose: the only
// real test of an email address is sending it an email.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const PASSWORD_MIN = 8

// bcrypt, which the server will use to hash passwords, only reads the first 72
// characters. Longer ones are refused rather than silently cut short.
export const PASSWORD_MAX = 72

export const NAME_MAX = 80

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

export function validateSubscription({ name, endDate, price, currency, frequency, note = '' }) {
  const errors = {}

  if (!name.trim()) errors.name = 'Enter the service name'
  else if (name.trim().length > NAME_MAX) errors.name = `Keep it under ${NAME_MAX} characters`

  // <input type="date"> always gives "YYYY-MM-DD", or "" when empty.
  if (!endDate) errors.endDate = 'Pick the day the subscription ends'

  const amount = Number(price)
  if (price === '') errors.price = 'Enter the renewal price, or 0 if it is free'
  else if (!Number.isFinite(amount) || amount < 0) errors.price = 'Enter a price of 0 or more'
  else if (amount > PRICE_MAX) errors.price = `Enter a price under ${PRICE_MAX.toLocaleString()}`

  if (!CURRENCY_CODES.includes(currency)) errors.currency = 'Pick a currency from the list'
  if (!FREQUENCY_KEYS.includes(frequency)) errors.frequency = 'Pick how often it bills'

  // Optional, so empty is fine. The box stops typing at the limit, but a
  // pasted note could still arrive longer.
  if (note.trim().length > NOTE_MAX) errors.note = `Keep the note under ${NOTE_MAX} characters`

  return errors
}

export function validateRegister({ name, email, password, confirmPassword }) {
  const errors = {}

  if (!name.trim()) errors.name = 'Enter your name'
  else if (name.trim().length > NAME_MAX) errors.name = `Keep your name under ${NAME_MAX} characters`

  const emailProblem = emailError(email)
  if (emailProblem) errors.email = emailProblem

  if (password.length < PASSWORD_MIN) errors.password = `Use at least ${PASSWORD_MIN} characters`
  else if (password.length > PASSWORD_MAX) errors.password = `Use ${PASSWORD_MAX} characters or fewer`

  if (!confirmPassword) errors.confirmPassword = 'Type your password again'
  else if (confirmPassword !== password) errors.confirmPassword = "Passwords don't match"

  return errors
}
