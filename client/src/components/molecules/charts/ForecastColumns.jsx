import { formatPrice, formatWholePrice } from '../../../utils/money.js'
import styles from './charts.module.css'

// The top of the scale: the biggest month rounded UP to a clean number
// (1, 2, 2.5 or 5 times a power of ten), so the ticks read 0 / 1,000 / 2,000
// rather than 0 / 1,037.5 / 2,075.
function niceCeiling(value) {
  if (value <= 0) return 0
  const power = 10 ** Math.floor(Math.log10(value))
  const step = [1, 2, 2.5, 5, 10].find((n) => value <= n * power)
  return step * power
}

// "Next 12 months": what will be charged each calendar month, one column per
// month in the main currency. One series, one colour. Only the biggest month
// is labelled on the chart; the y scale, the tooltips and the table carry the
// rest. months comes from monthlyForecast().
export default function ForecastColumns({ months, currency }) {
  const top = niceCeiling(Math.max(...months.map((m) => m.main)))
  if (top === 0) return <p className={styles.empty}>Nothing in {currency} will charge in the next 12 months.</p>

  const ticks = [0, top / 2, top]
  const peak = months.reduce((best, m, i) => (m.main > months[best].main ? i : best), 0)

  return (
    <div className={styles.forecast}>
      <div className={styles.yAxis} aria-hidden="true">
        {ticks.map((tick) => (
          <span key={tick} className={styles.yTick} style={{ '--at': `${(tick / top) * 100}%` }}>
            {formatWholePrice(tick, currency)}
          </span>
        ))}
      </div>

      <div className={styles.plot}>
        {ticks.map((tick) => (
          <span key={tick} className={styles.gridline} style={{ '--at': `${(tick / top) * 100}%` }} />
        ))}

        <div className={styles.columns}>
          {months.map((m, index) => {
            const name = `${m.label} ${m.year}${index === 0 ? ' (from today)' : ''}`
            const others = m.others.map((o) => `+ ${formatPrice(o.amount, o.currency)}`).join(' ')
            const align = index < 2 ? styles.tipStart : index > 9 ? styles.tipEnd : ''
            return (
              <div
                key={m.month}
                className={`${styles.slot} ${styles.mark}`}
                tabIndex={0}
                role="img"
                aria-label={`${name}: ${formatPrice(m.main, currency)}${others ? ` ${others}` : ''}`}
              >
                {index === peak && (
                  <span className={styles.peak} aria-hidden="true">
                    {formatWholePrice(m.main, currency)}
                  </span>
                )}
                <span
                  className={styles.column}
                  style={{ '--size': `${(m.main / top) * 100}%`, '--i': index }}
                  aria-hidden="true"
                />
                <span className={`${styles.tip} ${align}`} aria-hidden="true">
                  <span className={styles.tipValue}>{formatPrice(m.main, currency)}</span>
                  {others && <span className={styles.tipValue}>{others}</span>}
                  <span className={styles.tipLabel}>{name}</span>
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className={styles.xAxis} aria-hidden="true">
        {months.map((m) => (
          <span key={m.month}>{m.label}</span>
        ))}
      </div>
    </div>
  )
}
