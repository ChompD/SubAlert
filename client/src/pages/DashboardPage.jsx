import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listSubscriptions, updateSubscription } from '../api'
import Button from '../components/atoms/Button.jsx'
import SubscriptionRow from '../components/molecules/SubscriptionRow.jsx'
import SummaryCard from '../components/molecules/SummaryCard.jsx'
import FilterBar from '../components/organisms/FilterBar.jsx'
import SubscriptionDetails from '../components/organisms/SubscriptionDetails.jsx'
import useDashboardFilters from '../hooks/useDashboardFilters.js'
import { daysUntil } from '../utils/dates.js'
import { effectiveDate, hasEnded } from '../utils/schedule.js'
import { friendlyError } from '../utils/errors.js'
import { formatMonthlyTotals } from '../utils/money.js'
import { applyFilters, countByFilter, FILTERS } from '../utils/subscriptionFilters.js'
import styles from './DashboardPage.module.css'

// The Dashboard (/): summary numbers, then the subscriptions, narrowed by the
// search box and filter pills and ordered by the sort menu.
export default function DashboardPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [subscriptions, setSubscriptions] = useState([])
  const [error, setError] = useState(null)
  // Which subscription's details pop-up is open, by id, or null for none.
  const [openId, setOpenId] = useState(null)
  const { query, filter, sort, setFilter, setSort, clear, isFiltered } = useDashboardFilters()

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
  // Active means "still going": anything kept (it renews) and anything whose
  // date has not passed yet. Finished ones drop out of both numbers.
  const active = subscriptions.filter((sub) => !hasEnded(sub))
  const dueSoon = active.filter((sub) => daysUntil(effectiveDate(sub)) <= 2).length
  // Per month and per currency: a yearly plan counts as a twelfth of its
  // price, and mixed currencies show as "₱549.00 + $15.99".
  const saved = formatMonthlyTotals(subscriptions.filter((sub) => sub.status === 'cancel'))

  // The summary cards always describe everything; only the list is filtered.
  const visible = applyFilters(subscriptions, { query, filter, sort })
  const counts = countByFilter(subscriptions)
  const filterLabel = FILTERS.find((f) => f.key === filter)?.label

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
          <h2>Add your first subscription</h2>
          <p className={styles.muted}>
            Log a subscription or free trial when you sign up for it, and SubAlert shows you when it&apos;s about to charge you.
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
            <SummaryCard label="Due in 48h" value={dueSoon} />
            <SummaryCard label="Active" value={active.length} />
            <SummaryCard label="Saved by cancelling" value={`${saved}/mo`} />
          </div>

          <FilterBar
            filter={filter}
            onFilterChange={setFilter}
            sort={sort}
            onSortChange={setSort}
            counts={counts}
          />

          {/* Announced to screen readers as the list changes. */}
          <p className="sr-only" role="status">
            Showing {visible.length} of {subscriptions.length} subscriptions
          </p>

          {visible.length === 0 ? (
            <section className={styles.empty}>
              <h2>No matches</h2>
              <p className={styles.muted}>
                {query.trim()
                  ? `Nothing${filter !== 'all' ? ` in "${filterLabel}"` : ''} matches "${query.trim()}".`
                  : `You have no subscriptions in "${filterLabel}" right now.`}
              </p>
              <Button variant="secondary" onClick={clear}>
                Show all subscriptions
              </Button>
            </section>
          ) : (
            <div className={styles.list}>
              {/* Column headings, desktop only. The phone cards label themselves. */}
              <div className={styles.headings} aria-hidden="true">
                <span />
                <span>Service</span>
                <span>Ends / renews</span>
                <span>Price</span>
                <span>Decision</span>
              </div>
              {visible.map((sub) => (
                <SubscriptionRow
                  key={sub.id}
                  subscription={sub}
                  onDecisionChange={changeDecision}
                  onEdit={(id) => navigate(`/edit/${id}`)}
                  onOpen={setOpenId}
                />
              ))}
            </div>
          )}
          {isFiltered && visible.length > 0 && (
            <p className={styles.filterNote}>
              Showing {visible.length} of {subscriptions.length}.{' '}
              <button type="button" className={styles.linkButton} onClick={clear}>
                Clear search and filters
              </button>
            </p>
          )}
        </>
      )}

      <SubscriptionDetails
        subscription={subscriptions.find((sub) => sub.id === openId) ?? null}
        onClose={() => setOpenId(null)}
        onEdit={(id) => navigate(`/edit/${id}`)}
      />
    </div>
  )
}
