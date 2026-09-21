import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import Badge from '../atoms/Badge.jsx'
import Button from '../atoms/Button.jsx'
import ServiceIcon from '../atoms/ServiceIcon.jsx'
import { daysUntil, describeDaysLeft, formatLongDate, urgencyLevel } from '../../utils/dates.js'
import { FREQUENCIES, formatPrice, monthlyAmount, perFrequency } from '../../utils/money.js'
import styles from './SubscriptionDetails.module.css'

const DECISION_TEXT = { keep: 'Keep', cancel: 'Cancel', undecided: 'Undecided' }
const BADGE_TEXT = { urgent: 'Urgent', soon: 'Soon' }

// The pop-up that opens when you tap a subscription on the Dashboard: all its
// details, and the note, which the list has no room for.
//
// It's the browser's own <dialog>, opened with showModal(). That gives, for
// free: focus moves into it and can't Tab out behind it, Escape closes it, the
// page behind is dimmed and can't be clicked, and when it closes, focus goes
// back to the button that opened it (the subscription's name).
export default function SubscriptionDetails({ subscription, onClose, onEdit }) {
  const dialog = useRef(null)

  useEffect(() => {
    const element = dialog.current
    if (subscription && !element.open) element.showModal()
    if (!subscription && element.open) element.close()
  }, [subscription])

  // A click on the dimmed area around the box lands on the <dialog> itself
  // (the box is its child), so that means "close".
  function handleClick(event) {
    if (event.target === dialog.current) onClose()
  }

  if (!subscription) return <dialog ref={dialog} className={styles.dialog} onClose={onClose} />

  const { id, name, icon, color, price, currency, frequency, endDate, status, note } = subscription
  const days = daysUntil(endDate)
  const level = urgencyLevel(days)
  const frequencyLabel = FREQUENCIES.find((f) => f.key === frequency)?.label ?? 'Monthly'

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      onClose={onClose}
      onClick={handleClick}
      aria-labelledby="details-title"
    >
      <div className={styles.box}>
        <header className={styles.header}>
          <ServiceIcon name={name} icon={icon} color={color} size={48} />
          <div className={styles.titleBlock}>
            <h2 id="details-title" className={styles.title}>
              {name}
            </h2>
            <p className={styles.subtitle}>
              {formatPrice(price, currency)}
              {perFrequency(frequency)}
              {BADGE_TEXT[level] && <Badge level={level}>{BADGE_TEXT[level]}</Badge>}
            </p>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <dl className={styles.facts}>
          <div>
            <dt>Ends</dt>
            <dd>
              {formatLongDate(endDate)}
              <span className={styles.muted}> · {describeDaysLeft(days)}</span>
            </dd>
          </div>
          <div>
            <dt>Billed</dt>
            <dd>{frequencyLabel}</dd>
          </div>
          {frequency !== 'monthly' && (
            <div>
              <dt>Per month</dt>
              <dd>≈ {formatPrice(monthlyAmount(price, frequency), currency)}</dd>
            </div>
          )}
          <div>
            <dt>Currency</dt>
            <dd>{currency}</dd>
          </div>
          <div>
            <dt>Decision</dt>
            <dd>{DECISION_TEXT[status] ?? 'Undecided'}</dd>
          </div>
        </dl>

        <section className={styles.noteSection} aria-labelledby="details-note">
          <h3 id="details-note" className={styles.noteTitle}>
            Note
          </h3>
          {note ? (
            <p className={styles.note}>{note}</p>
          ) : (
            <p className={styles.muted}>No note yet. Add one from Edit.</p>
          )}
        </section>

        <footer className={styles.actions}>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => onEdit(id)}>Edit</Button>
        </footer>
      </div>
    </dialog>
  )
}
