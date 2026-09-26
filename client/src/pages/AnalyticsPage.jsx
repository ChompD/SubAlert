import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listSubscriptions } from '../api'
import Button from '../components/atoms/Button.jsx'
import { friendlyError } from '../utils/errors.js'
import { hasEnded } from '../utils/schedule.js'
import styles from './AnalyticsPage.module.css'

// The Analytics page (/analytics): what your subscriptions add up to. It
// works from the same list the Dashboard loads, so there is nothing new on
// the server; every number is worked out here from that list.
export default function AnalyticsPage() {
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

  const active = subscriptions.filter((sub) => !hasEnded(sub))

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Analytics</h1>

      {/* Grey shapes in the page's own layout while it loads: the cards, then
          two panels side by side. Screen readers get the sentence. */}
      {status === 'loading' && (
        <>
          <p className="sr-only" role="status">
            Loading your analytics…
          </p>
          <div className={styles.cards} aria-hidden="true">
            {[0, 1, 2, 3].map((n) => (
              <div key={n} className={`${styles.skeleton} ${styles.skeletonCard}`} />
            ))}
          </div>
          <div className={styles.panels} aria-hidden="true">
            <div className={`${styles.skeleton} ${styles.skeletonPanel}`} />
            <div className={`${styles.skeleton} ${styles.skeletonPanel}`} />
          </div>
        </>
      )}

      {status === 'error' && (
        <p className={styles.error} role="alert">
          {error} <Button variant="secondary" onClick={load}>Try again</Button>
        </p>
      )}

      {status === 'ready' && subscriptions.length === 0 && (
        <section className={styles.empty}>
          <h2>Nothing to add up yet</h2>
          <p className={styles.muted}>
            Add your subscriptions and this page shows what they cost you each month and year,
            where the money goes, and what&apos;s about to charge you.
          </p>
          <Button onClick={() => navigate('/add')}>+ Add subscription</Button>
        </section>
      )}

      {status === 'ready' && subscriptions.length > 0 && (
        <p className={styles.muted}>
          Based on {active.length} active {active.length === 1 ? 'subscription' : 'subscriptions'}
          {subscriptions.length > active.length && ` (${subscriptions.length - active.length} ended, not counted)`}.
        </p>
      )}
    </div>
  )
}
