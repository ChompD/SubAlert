import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createSubscription, deleteSubscription, getSubscription, updateSubscription } from '../api'
import Button from '../components/atoms/Button.jsx'
import DecisionToggle, { THREE_OPTIONS } from '../components/molecules/DecisionToggle.jsx'
import FormField from '../components/molecules/FormField.jsx'
import IconPicker from '../components/molecules/IconPicker.jsx'
import SelectField from '../components/molecules/SelectField.jsx'
import { friendlyError } from '../utils/errors.js'
import { DEFAULT_COLOR, DEFAULT_ICON } from '../utils/icons.js'
import { CURRENCIES, DEFAULT_CURRENCY } from '../utils/money.js'
import { validateSubscription } from '../utils/validation.js'
import formStyles from './AuthForm.module.css'
import styles from './SubscriptionFormPage.module.css'

const EMPTY = {
  name: '',
  trialEndDate: '',
  price: '',
  currency: DEFAULT_CURRENCY,
  icon: DEFAULT_ICON,
  color: DEFAULT_COLOR,
  status: 'undecided',
}

const CURRENCY_OPTIONS = CURRENCIES.map(({ code, label }) => ({ value: code, label }))

// One page for two routes: /add starts blank, /edit/:id loads the existing
// subscription first. Building it once means the two screens cannot drift
// apart, which is the whole point of reusing a component.
export default function SubscriptionFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [formMessage, setFormMessage] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (!isEdit) return

    let cancelled = false
    getSubscription(id)
      .then((found) => {
        if (cancelled) return
        // price comes back as a number; inputs want a string.
        setForm({ ...found, price: String(found.price) })
        setLoading(false)
      })
      .catch((error) => {
        if (cancelled) return
        if (error.status === 404) navigate('/', { replace: true })
        else {
          setFormMessage(friendlyError(error))
          setLoading(false)
        }
      })

    // Stops a slow answer arriving after you have left the page.
    return () => {
      cancelled = true
    }
  }, [id, isEdit, navigate])

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

    const values = {
      name: form.name.trim(),
      trialEndDate: form.trialEndDate,
      price: Number(form.price),
      currency: form.currency,
      icon: form.icon,
      color: form.color,
      status: form.status,
    }

    setSaving(true)
    try {
      if (isEdit) await updateSubscription(id, values)
      else await createSubscription(values)
      navigate('/')
    } catch (error) {
      setFormMessage(friendlyError(error))
      setSaving(false)
    }
  }

  async function handleDelete() {
    // Deleting cannot be undone, so ask first. The name is in the question,
    // so nobody deletes the wrong one by muscle memory.
    if (!window.confirm(`Delete ${form.name}? This can't be undone.`)) return

    setDeleting(true)
    try {
      await deleteSubscription(id)
      navigate('/')
    } catch (error) {
      setFormMessage(friendlyError(error))
      setDeleting(false)
    }
  }

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.back}>
        ← Back to dashboard
      </Link>
      <h1 className={styles.title}>{isEdit ? 'Edit subscription' : 'Add subscription'}</h1>

      {loading ? (
        <p className={styles.loading} role="status">
          Loading…
        </p>
      ) : (
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

          <IconPicker
            name={form.name.trim()}
            icon={form.icon}
            color={form.color}
            onChange={(changes) => setForm({ ...form, ...changes })}
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

          {/* Currency and amount share a row: [PHP ▾] [ 549.00 ]. */}
          <div className={styles.priceRow}>
            <SelectField
              id="sub-currency"
              name="currency"
              label="Currency"
              options={CURRENCY_OPTIONS}
              value={form.currency}
              onChange={handleChange}
              error={errors.currency}
            />

            {/* inputMode="decimal" brings up the number keypad on phones. */}
            <FormField
              id="sub-price"
              name="price"
              label="Renewal price (per month)"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.price}
              onChange={handleChange}
              error={errors.price}
            />
          </div>

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
            <Button type="submit" disabled={saving || deleting}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save'}
            </Button>
            <Button variant="secondary" onClick={() => navigate('/')} disabled={saving || deleting}>
              Cancel
            </Button>
          </div>

          {/* Edit only, and set apart from Save so it is not hit by accident. */}
          {isEdit && (
            <div className={styles.danger}>
              <Button variant="danger" fullWidth onClick={handleDelete} disabled={saving || deleting}>
                {deleting ? 'Deleting…' : 'Delete subscription'}
              </Button>
            </div>
          )}
        </form>
      )}
    </div>
  )
}
