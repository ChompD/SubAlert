import { useCallback, useRef, useState } from 'react'
import Avatar from '../atoms/Avatar.jsx'
import Badge from '../atoms/Badge.jsx'
import DecisionToggle from './DecisionToggle.jsx'
import useDismiss from '../../hooks/useDismiss.js'
import { daysUntil, describeDaysLeft, urgencyLevel } from '../../utils/dates.js'
import { formatPrice } from '../../utils/money.js'
import styles from './SubscriptionRow.module.css'

const BADGE_TEXT = { urgent: 'Urgent', soon: 'Soon' }

// One subscription. A stacked card on a phone, a table-style row from 640px.
// Rendered once per subscription by the list, with key={subscription.id}.
//
// Days left and urgency are CALCULATED from the end date on every render, not
// stored, so they are never out of date.
export default function SubscriptionRow({ subscription, onDecisionChange, onEdit, onDelete }) {
  const { id, name, price, trialEndDate, status } = subscription
  const days = daysUntil(trialEndDate)
  const level = urgencyLevel(days)

  const [menuOpen, setMenuOpen] = useState(false)
  const menu = useRef(null)
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  useDismiss(menu, menuOpen, closeMenu)

  return (
    <article className={`${styles.row} ${styles[level]}`} aria-label={name}>
      <Avatar name={name} variant="neutral" />

      <div className={styles.service}>
        <h3 className={styles.name}>
          {name}
          {BADGE_TEXT[level] && <Badge level={level}>{BADGE_TEXT[level]}</Badge>}
        </h3>
        <p className={styles.pricePhone}>{formatPrice(price)}/mo</p>
      </div>

      <p className={styles.ends}>
        <span className="sr-only">Trial ends: </span>
        <time dateTime={trialEndDate}>{describeDaysLeft(days)}</time>
      </p>

      <p className={styles.priceDesktop}>{formatPrice(price)}</p>

      <div className={styles.decision}>
        <DecisionToggle
          value={status}
          onChange={(next) => onDecisionChange?.(id, next)}
          label={`Decision for ${name}`}
          fullWidth
        />
      </div>

      <div className={styles.menuWrapper} ref={menu}>
        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={menuOpen}
          aria-label={`More options for ${name}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span aria-hidden="true">···</span>
        </button>
        {menuOpen && (
          <div className={styles.menu}>
            <button type="button" onClick={() => { closeMenu(); onEdit?.(id) }}>
              Edit
            </button>
            <button type="button" className={styles.delete} onClick={() => { closeMenu(); onDelete?.(id) }}>
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
