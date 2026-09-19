import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/atoms/Button.jsx'
import FormField from '../components/molecules/FormField.jsx'
import AuthCard from '../components/organisms/AuthCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { friendlyError } from '../utils/errors.js'
import { PASSWORD_MIN, validateRegister } from '../utils/validation.js'
import styles from './AuthForm.module.css'

const EMPTY = { name: '', email: '', password: '', confirmPassword: '' }

// Register (/register). Same pattern as LoginPage: check the fields here,
// then AuthContext calls the API, which also logs the new account in.
export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [formMessage, setFormMessage] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm({ ...form, [name]: value })
    if (errors[name]) setErrors({ ...errors, [name]: null })
    setFormMessage(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const found = validateRegister(form)
    setErrors(found)
    const firstProblem = Object.keys(found)[0]
    if (firstProblem) {
      document.getElementById(`register-${firstProblem}`)?.focus()
      return
    }

    setSubmitting(true)
    try {
      await register(form.name.trim(), form.email.trim(), form.password)
      navigate('/', { replace: true })
    } catch (error) {
      if (error.status === 409) {
        // "That email already has an account": it belongs under the email.
        setErrors({ email: error.message })
        document.getElementById('register-email')?.focus()
      } else {
        setFormMessage(friendlyError(error))
      }
      setSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Create account"
      subtitle="Create an account to save your trials."
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {formMessage && (
          <p className={styles.formMessage} role="alert">
            {formMessage}
          </p>
        )}

        <FormField
          id="register-name"
          name="name"
          label="Name"
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
        />

        <FormField
          id="register-email"
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="name@email.com"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />

        {/* new-password tells password managers to offer a strong one. */}
        <FormField
          id="register-password"
          name="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder={`At least ${PASSWORD_MIN} characters`}
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />

        <FormField
          id="register-confirmPassword"
          name="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <Button type="submit" fullWidth disabled={submitting} className={styles.submit}>
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthCard>
  )
}
