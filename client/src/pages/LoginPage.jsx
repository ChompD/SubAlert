import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/atoms/Button.jsx'
import FormField from '../components/molecules/FormField.jsx'
import AuthCard from '../components/organisms/AuthCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { friendlyError } from '../utils/errors.js'
import { validateLogin } from '../utils/validation.js'
import styles from './AuthForm.module.css'

// Log in (/login). Checks the fields here, then AuthContext calls the API.
export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  // A problem with the whole attempt, like "Wrong email or password", rather
  // than with one field.
  const [formMessage, setFormMessage] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // One change handler for every field, keyed by the input's name. Typing in a
  // field clears that field's error, so the orange goes as soon as you fix it.
  function handleChange(event) {
    const { name, value } = event.target
    setForm({ ...form, [name]: value })
    if (errors[name]) setErrors({ ...errors, [name]: null })
    setFormMessage(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const found = validateLogin(form)
    setErrors(found)
    const firstProblem = Object.keys(found)[0]
    if (firstProblem) {
      // Move the cursor to the first field that needs fixing, so keyboard and
      // screen-reader users land right on it.
      document.getElementById(`login-${firstProblem}`)?.focus()
      return
    }

    setSubmitting(true)
    try {
      await login(form.email.trim(), form.password)
      // Back to the page ProtectedRoute sent them away from, or the Dashboard.
      navigate(location.state?.from?.pathname ?? '/', { replace: true })
    } catch (error) {
      setFormMessage(friendlyError(error))
      setSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Log in"
      subtitle="Track your subscriptions before they bill you."
      footer={
        <>
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </>
      }
    >
      {/* noValidate: use our own messages instead of the browser's pop-ups,
          which look different in every browser and can't be styled. */}
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {formMessage && (
          <p className={styles.formMessage} role="alert">
            {formMessage}
          </p>
        )}

        <FormField
          id="login-email"
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="name@email.com"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />

        <FormField
          id="login-password"
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />

        <Button type="submit" fullWidth disabled={submitting} className={styles.submit}>
          {submitting ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
    </AuthCard>
  )
}
