// Checks the forms run before sending anything. They make mistakes quick to
// fix, but they are for convenience only: the server checks everything again,
// because anyone can skip the browser and send a request directly.

// Something, an @, something, a dot, something. Deliberately loose: the only
// real test of an email address is sending it an email.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const PASSWORD_MIN = 8

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
