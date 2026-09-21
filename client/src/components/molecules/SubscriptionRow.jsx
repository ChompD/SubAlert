import Badge from '../atoms/Badge.jsx'
import ServiceIcon from '../atoms/ServiceIcon.jsx'
import DecisionToggle from './DecisionToggle.jsx'
import { daysUntil, describeDaysLeft, urgencyLevel } from '../../utils/dates.js'
import { formatPrice, perFrequency } from '../../utils/money.js'
import styles from './SubscriptionRow.module.css'

const BADGE_TEXT = { urgent: 'Urgent', soon: 'Soon' }

// One subscription. Rendered once per subscription by the list, with
// key={subscription.id}.
//
//   Phone:    [icon] Name (up to 2 lines) [Urgent]    [···]
//                    ₱549.00/mo · Tomorrow
//             [ Keep          |          Cancel ]
//
//   Desktop:  [icon] Name [Urgent] | Tomorrow | ₱549.00 | [Keep|Cancel] | ···
//
// A few details are written twice, once per layout, and CSS shows the right
// one. That keeps each layout simple instead of one layout fighting the other.
// Days left and urgency are CALCULATED from the end date on every render.
//
// onOpen: tapping the card opens its details. The name is a real button, so
// keyboard and screen-reader users can open it too; a tap anywhere else on
// the card does the same, unless it landed on the toggle or the ··· button.
export default function SubscriptionRow({ subscription, onDecisionChange, onEdit, onOpen }) {
  const { id, name, price, currency, frequency, icon, color, endDate, status } = subscription
  const days = daysUntil(endDate)
  const amount = `${formatPrice(price, currency)}${perFrequency(frequency)}`
  const level = urgencyLevel(days)
  const badge = BADGE_TEXT[level] && <Badge level={level}>{BADGE_TEXT[level]}</Badge>
  const daysLeft = <time dateTime={endDate}>{describeDaysLeft(days)}</time>

  return (
    <article
      className={`${styles.row} ${styles[level]} ${onOpen ? styles.clickable : ''}`}
      aria-label={name}
      onClick={(event) => {
        if (onOpen && !event.target.closest('button, a, input, select, textarea')) onOpen(id)
      }}
    >
      <span className={styles.icon}>
        <ServiceIcon name={name} icon={icon} color={color} />
      </span>

      <div className={styles.service}>
        <h3 className={styles.name}>
          {onOpen ? (
            <button type="button" className={styles.nameButton} onClick={() => onOpen(id)}>
              <span className={styles.nameText}>{name}</span>
              <span className="sr-only">, show details</span>
            </button>
          ) : (
            <span className={styles.nameText}>{name}</span>
          )}
          {badge}
        </h3>

        {/* Phone: everything about "when and how much" on one line. */}
        <p className={styles.meta}>
          <span>{amount}</span>
          <span aria-hidden="true">·</span>
          <span className={styles.ends}>
            <span className="sr-only">Ends: </span>
            {daysLeft}
          </span>
        </p>
      </div>

      {/* Desktop: its own columns, lined up with the list's headings. */}
      <p className={styles.endsColumn}>
        <span className="sr-only">Ends: </span>
        {daysLeft}
      </p>
      <p className={styles.priceColumn}>{amount}</p>

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
