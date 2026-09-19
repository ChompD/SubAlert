import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createSubscription } from '../api'
import Button from '../components/atoms/Button.jsx'
import DecisionToggle, { THREE_OPTIONS } from '../components/molecules/DecisionToggle.jsx'
import FormField from '../components/molecules/FormField.jsx'
import { friendlyError } from '../utils/errors.js'
import { validateSubscription } from '../utils/validation.js'
import formStyles from './AuthForm.module.css'
import styles from './AddSubscriptionPage.module.css'

const EMPTY = { name: '', trialEndDate: '', price: '', status: 'undecided' }

// Add subscription (/add). Checks the fields, saves, then goes back to the
// Dashboard, where the new trial shows up in date order.
export default function AddSubscriptionPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [formMessage, setFormMessage] = useState(null)
  const [saving, setSaving] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm({ ...form, [name]: value })
    if (errors[name]) setErrors({ ...errors, [name]: null })
    setFormMessage(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const found = validateSubscription(form)
    setErrors(found)
    const firstProblem = Object.keys(found)[0]
    if (firstProblem) {
      document.getElementById(`sub-${firstProblem}`)?.focus()
      return
    }

    setSaving(true)
    try {
      await createSubscription({
        name: form.name.trim(),
        trialEndDate: form.trialEndDate,
        price: Number(form.price),
        status: form.status,
      })
      navigate('/')
    } catch (error) {
      setFormMessage(friendlyError(error))
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.back}>
        ← Back to dashboard
      </Link>
      <h1 className={styles.title}>Add subscription</h1>

      <form className={formStyles.form} onSubmit={handleSubmit} noValidate>
        {formMessage && (
          <p className={formStyles.formMessage} role="alert">
            {formMessage}
          </p>
        )}

        <FormField
          id="sub-name"
          name="name"
          label="Service name"
          placeholder="Netflix"
          autoComplete="off"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
        />

        <FormField
          id="sub-trialEndDate"
          name="trialEndDate"
          label="Trial end date"
          type="date"
          value={form.trialEndDate}
          onChange={handleChange}
          error={errors.trialEndDate}
        />

        {/* inputMode="decimal" brings up the number keypad on phones. */}
        <FormField
          id="sub-price"
          name="price"
          label="Renewal price ($ per month)"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={form.price}
          onChange={handleChange}
          error={errors.price}
        />

        <div className={styles.decision}>
          {/* Visual label only: the toggle's own aria-label names the group. */}
          <span className={styles.label} aria-hidden="true">
            Decision
          </span>
          <DecisionToggle
            value={form.status}
            onChange={(status) => setForm({ ...form, status })}
            options={THREE_OPTIONS}
            label="Decision"
            fullWidth
          />
        </div>

        <div className={styles.actions}>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
