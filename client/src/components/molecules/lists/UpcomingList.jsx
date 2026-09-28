import { useState } from 'react'
import Badge from '../../atoms/Badge.jsx'
import ServiceIcon from '../../atoms/ServiceIcon.jsx'
import { daysUntil, describeDaysLeft, formatShortDate, urgencyLevel } from '../../../utils/dates.js'
import { formatPrice } from '../../../utils/money.js'
import styles from './lists.module.css'

const SHOWN_AT_FIRST = 8
const BADGE_TEXT = { urgent: 'Urgent', soon: 'Soon' }

// "Charging in the next 30 days": every charge coming up, soonest first, with
// the same Urgent / Soon badges as the Dashboard and a total at the bottom.
// A weekly plan shows once per charge. Each row opens that subscription's
// details. charges and totals come from upcomingCharges().
export default function UpcomingList({ charges, totals, currency, onOpen }) {
  const [showAll, setShowAll] = useState(false)
  if (charges.length === 0) return <p className={styles.empty}>Nothing charges in the next 30 days.</p>

  const shown = showAll ? charges : charges.slice(0, SHOWN_AT_FIRST)
  // "₱1,387.00 + $20.00": per currency, never added across.
  const total = [
    ...(totals.main > 0 || totals.others.length === 0 ? [formatPrice(totals.main, currency)] : []),
    ...totals.others.map((o) => formatPrice(o.amount, o.currency)),
  ].join(' + ')

  return (
    <>
      <ol className={styles.list}>
        {shown.map((charge, index) => {
          const { subscription: sub } = charge
          const days = daysUntil(charge.date)
          const level = urgencyLevel(days)
          return (
            <li key={`${sub.id}-${charge.date}`} className={styles.item} style={{ '--i': Math.min(index, 8) }}>
              {/* aria-label: read as one sentence. Without it a screen reader
                  runs the pieces together ("Sep 28TomorrowNetflix"). */}
              <button
                type="button"
                className={`${styles.row} ${styles.upcoming}`}
                onClick={() => onOpen(sub.id)}
                aria-label={`${sub.name}, ${formatPrice(charge.amount, charge.currency)}, ${formatShortDate(charge.date)}, ${describeDaysLeft(days).toLowerCase()}${BADGE_TEXT[level] ? `, ${BADGE_TEXT[level].toLowerCase()}` : ''}. Show details`}
              >
                <span className={styles.when}>
                  <span className={styles.whenDate}>{formatShortDate(charge.date)}</span>
                  <span className={styles.muted}>{describeDaysLeft(days)}</span>
                </span>
                <ServiceIcon name={sub.name} icon={sub.icon} color={sub.color} size={28} />
                <span className={styles.name}>{sub.name}</span>
                <span className={styles.badge}>{BADGE_TEXT[level] && <Badge level={level}>{BADGE_TEXT[level]}</Badge>}</span>
                <span className={styles.amount}>{formatPrice(charge.amount, charge.currency)}</span>
              </button>
            </li>
          )
        })}
      </ol>

      {charges.length > SHOWN_AT_FIRST && (
        <button type="button" className={styles.more} onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Show fewer' : `Show all ${charges.length}`}
        </button>
      )}

      <p className={styles.total}>
        <span>Total</span>
        <span className={styles.amount}>{total}</span>
      </p>
    </>
  )
}
