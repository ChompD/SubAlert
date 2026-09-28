import ServiceIcon from '../../atoms/ServiceIcon.jsx'
import { FREQUENCIES, formatPrice } from '../../../utils/money.js'
import styles from './lists.module.css'

// "Most expensive": the priciest subscriptions per month, ranked. A plan that
// isn't billed monthly says what it really charges under its name, so the
// per-month figure isn't mistaken for the bill. Each row opens the details.
// rows come from topSubscriptions().
export default function TopList({ rows, currency, onOpen }) {
  if (rows.length === 0) return <p className={styles.empty}>Nothing billed in {currency} yet.</p>

  return (
    <ol className={styles.list}>
      {rows.map(({ subscription: sub, monthly }, index) => {
        const billed = FREQUENCIES.find((f) => f.key === sub.frequency)?.label ?? 'Monthly'
        return (
          <li key={sub.id} className={styles.item} style={{ '--i': index }}>
            <button
              type="button"
              className={`${styles.row} ${styles.top}`}
              onClick={() => onOpen(sub.id)}
              aria-label={`${index + 1}. ${sub.name}, ${formatPrice(monthly, currency)} a month${sub.frequency === 'monthly' ? '' : `, billed ${formatPrice(sub.price, currency)} ${billed.toLowerCase()}`}. Show details`}
            >
              <span className={styles.rank} aria-hidden="true">
                {index + 1}
              </span>
              <ServiceIcon name={sub.name} icon={sub.icon} color={sub.color} size={28} />
              <span className={styles.nameBlock}>
                <span className={styles.name}>{sub.name}</span>
                <span className={styles.muted}>
                  {sub.frequency === 'monthly' ? billed : `${formatPrice(sub.price, currency)} ${billed.toLowerCase()}`}
                </span>
              </span>
              <span className={styles.amount}>
                {formatPrice(monthly, currency)}
                <span className={styles.muted}>/mo</span>
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
