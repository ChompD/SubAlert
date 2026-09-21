import ServiceIcon from '../atoms/ServiceIcon.jsx'
import Badge from '../atoms/Badge.jsx'
import DecisionToggle from './DecisionToggle.jsx'
import { daysUntil, describeDaysLeft, urgencyLevel } from '../../utils/dates.js'
import { formatPrice } from '../../utils/money.js'
import styles from './SubscriptionRow.module.css'

const BADGE_TEXT = { urgent: 'Urgent', soon: 'Soon' }

// One subscription. A stacked card on a phone, a table-style row from 640px.
// Rendered once per subscription by the list, with key={subscription.id}.
//
// Days left and urgency are CALCULATED from the end date on every render, not
// stored, so they are never out of date.
export default function SubscriptionRow({ subscription, onDecisionChange, onEdit }) {
  const { id, name, price, currency, icon, color, trialEndDate, status } = subscription
  const days = daysUntil(trialEndDate)
  const level = urgencyLevel(days)

  return (
    <article className={`${styles.row} ${styles[level]}`} aria-label={name}>
      <ServiceIcon name={name} icon={icon} color={color} />

      <div className={styles.service}>
        <h3 className={styles.name}>
          {name}
          {BADGE_TEXT[level] && <Badge level={level}>{BADGE_TEXT[level]}</Badge>}
        </h3>
        <p className={styles.pricePhone}>{formatPrice(price, currency)}/mo</p>
      </div>

      <p className={styles.ends}>
        <span className="sr-only">Trial ends: </span>
        <time dateTime={trialEndDate}>{describeDaysLeft(days)}</time>
      </p>

      <p className={styles.priceDesktop}>{formatPrice(price, currency)}</p>

      <div className={styles.decision}>
        <DecisionToggle
          value={status}
          onChange={(next) => onDecisionChange?.(id, next)}
          label={`Decision for ${name}`}
          fullWidth
        />
      </div>

      {/* Straight to the edit page, where Delete also lives. */}
      {onEdit && (
        <button
          type="button"
          className={styles.editButton}
          aria-label={`Edit ${name}`}
          onClick={() => onEdit(id)}
        >
          <span aria-hidden="true">···</span>
        </button>
      )}
    </article>
  )
}
