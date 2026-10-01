import { Fragment } from 'react'
import Button from '../atoms/Button.jsx'
import { describeDayThisWeek } from '../../utils/dates.js'
import { formatTotals } from '../../utils/money.js'
import { dueThisWeek } from '../../utils/subscriptionFilters.js'
import styles from './DueBanner.module.css'

// How many names the banner lists before saying "and 2 more".
const MAX_NAMES = 3

// The line at the top of the Dashboard: what charges you in the next 7 days
// and how much, in one glance.
//
//   [bell]  3 charges this week · ₱1,247.00              [Show them]
//           Netflix tomorrow, Spotify on Fri, iCloud on Sun
//
// It counts exactly what the "Due soon" pill shows, and "Show them" switches
// that pill on. Nothing due: no banner. onShow is left out while the pill is
// already on, since the button would do nothing.
export default function DueBanner({ subscriptions, onShow }) {
  const due = dueThisWeek(subscriptions)
  if (due.length === 0) return null

  const named = due.slice(0, MAX_NAMES)
  const more = due.length - named.length

  return (
    <section className={styles.banner} aria-labelledby="due-title">
      <span className={styles.icon} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      </span>

      <div className={styles.text}>
        <h2 id="due-title" className={styles.title}>
          {due.length} {due.length === 1 ? 'charge' : 'charges'} this week
          <span className={styles.total}> · {formatTotals(due)}</span>
        </h2>
        <p className={styles.names}>
          {named.map((sub, index) => (
            <Fragment key={sub.id}>
              {index > 0 && ', '}
              <strong>{sub.name}</strong> <time dateTime={sub.date}>{describeDayThisWeek(sub.date, sub.days)}</time>
            </Fragment>
          ))}
          {more > 0 && `, and ${more} more`}
        </p>
      </div>

      {onShow && (
        <Button variant="secondary" className={styles.action} onClick={onShow}>
          Show them
        </Button>
      )}
    </section>
  )
}
