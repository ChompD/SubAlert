import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/atoms/Button.jsx'
import FormField from '../components/molecules/FormField.jsx'
import AuthCard from '../components/organisms/AuthCard.jsx'
import { PASSWORD_MIN, validateRegister } from '../utils/validation.js'
import styles from './AuthForm.module.css'

const EMPTY = { name: '', email: '', password: '', confirmPassword: '' }

// Register (/register). Same pattern as LoginPage: check the fields here,
// then (from section 6) hand them to AuthContext, which calls the API.
export default function RegisterPage() {
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
    // Placeholder until section 6 wires this to the API.
    setFormMessage("Registering isn't connected yet. It will be in section 6.")
    setSubmitting(false)
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
