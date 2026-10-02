import { formatPrice, formatWholePrice } from '../../../utils/money.js'
import styles from './charts.module.css'

// "By payment method": monthly spend per "Paid with", biggest first. One
// series, so one colour for every bar and no legend: the panel's title says
// what the bars are. Bar length is relative to the biggest row, and the
// amount sits at each bar's tip. rows come from spendByPaymentMethod().
export default function CategoryBars({ rows, currency }) {
  const biggest = rows[0]?.monthly ?? 0

  return (
    <ul className={styles.bars}>
      {rows.map((row, index) => {
        const exact = `${formatPrice(row.monthly, currency)} a month`
        const detail = `${row.count} ${row.count === 1 ? 'subscription' : 'subscriptions'} · ${Math.round(row.share * 100)}% of your spending`
        return (
          <li key={row.key}>
            {/* role="img" with a label: screen readers read a list item's
                own label unreliably, so the focusable mark inside it has it. */}
            <div
              className={`${styles.barRow} ${styles.mark}`}
              tabIndex={0}
              role="img"
              aria-label={`${row.label}: ${exact}, ${detail}`}
            >
              <span className={styles.barLabel} aria-hidden="true">
                {row.label}
              </span>
              <span className={styles.barTrack} aria-hidden="true">
                <span
                  className={styles.bar}
                  style={{ '--size': biggest > 0 ? row.monthly / biggest : 0, '--i': index }}
                />
                <span className={styles.barValue}>{formatWholePrice(row.monthly, currency)}</span>
              </span>
              <span className={styles.tip} aria-hidden="true">
                <span className={styles.tipValue}>{exact}</span>
                <span className={styles.tipLabel}>{row.label}</span>
                <span className={styles.tipLabel} style={{ '--key': 'transparent' }}>
                  {detail}
                </span>
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
