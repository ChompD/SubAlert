import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listSubscriptions, updateSubscription } from '../api'
import Button from '../components/atoms/Button.jsx'
import SubscriptionRow from '../components/molecules/SubscriptionRow.jsx'
import SummaryCard from '../components/molecules/SummaryCard.jsx'
import { daysUntil } from '../utils/dates.js'
import { friendlyError } from '../utils/errors.js'
import { formatPrice } from '../utils/money.js'
import styles from './DashboardPage.module.css'

// The Dashboard (/): summary numbers, then every subscription sorted by the
// day its trial ends, soonest first.
export default function DashboardPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [subscriptions, setSubscriptions] = useState([])
  const [error, setError] = useState(null)

  async function load() {
    setStatus('loading')
    try {
      setSubscriptions(await listSubscriptions())
      setStatus('ready')
    } catch (caught) {
      setError(friendlyError(caught))
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Optimistic: the toggle changes straight away, and goes back if saving fails.
  async function changeDecision(id, decision) {
    const previous = subscriptions
    setSubscriptions(subscriptions.map((sub) => (sub.id === id ? { ...sub, status: decision } : sub)))
    try {
      await updateSubscription(id, { status: decision })
    } catch (caught) {
      setSubscriptions(previous)
      setError(friendlyError(caught))
    }
  }

  // Worked out from the list on every render, never stored, so they can't
  // disagree with it.
  const active = subscriptions.filter((sub) => daysUntil(sub.trialEndDate) >= 0)
  const endingSoon = active.filter((sub) => daysUntil(sub.trialEndDate) <= 2).length
  const saved = subscriptions
    .filter((sub) => sub.status === 'cancel')
    .reduce((total, sub) => total + Number(sub.price), 0)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Your subscriptions</h1>

      {status === 'loading' && (
        <p className={styles.muted} role="status">
          Loading your subscriptions…
        </p>
      )}

      {status === 'error' && (
        <p className={styles.error} role="alert">
          {error} <Button variant="secondary" onClick={load}>Try again</Button>
        </p>
      )}

      {status === 'ready' && subscriptions.length === 0 && (
        <section className={styles.empty}>
          <h2>Add your first trial</h2>
          <p className={styles.muted}>
            Log a free trial when you sign up for it, and SubAlert shows you when it&apos;s about to charge you.
          </p>
          <Button onClick={() => navigate('/add')}>+ Add subscription</Button>
        </section>
      )}

      {status === 'ready' && subscriptions.length > 0 && (
        <>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.summary}>
            <SummaryCard label="Ending in 48h" value={endingSoon} />
            <SummaryCard label="Active trials" value={active.length} />
            <SummaryCard label="Saved by cancelling" value={`${formatPrice(saved)}/mo`} />
          </div>

          <div className={styles.list}>
            {/* Column headings, desktop only. The phone cards label themselves. */}
            <div className={styles.headings} aria-hidden="true">
              <span />
              <span>Service</span>
              <span>Trial ends</span>
              <span>Price</span>
              <span>Decision</span>
            </div>
            {subscriptions.map((sub) => (
              <SubscriptionRow key={sub.id} subscription={sub} onDecisionChange={changeDecision} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
