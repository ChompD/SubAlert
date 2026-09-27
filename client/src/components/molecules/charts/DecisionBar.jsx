import styles from './charts.module.css'

// Keep | Undecided | Cancel, always in this order and always these colours
// (colour follows the decision, never its size). The order is also what the
// palette was validated for: each colour is checked against its neighbour.
const DECISIONS = [
  { key: 'keep', label: 'Keep', color: 'var(--chart-1)' },
  { key: 'undecided', label: 'Undecided', color: 'var(--chart-2)' },
  { key: 'cancel', label: 'Cancel', color: 'var(--chart-3)' },
]

const percent = (count, total) => (total > 0 ? Math.round((count / total) * 100) : 0)

// "Your decisions": how the running subscriptions split between Keep,
// Undecided and Cancel, as one bar (part of a whole), with a legend that
// carries every count, so the colours are never the only way to tell.
// counts comes from decisionCounts().
export default function DecisionBar({ counts }) {
  const total = DECISIONS.reduce((sum, d) => sum + counts[d.key], 0)
  if (total === 0) return <p className={styles.empty}>No running subscriptions to decide on.</p>

  const shown = DECISIONS.filter((d) => counts[d.key] > 0)

  return (
    <>
      <div className={styles.stack}>
        {shown.map((d, index) => {
          const words = `${counts[d.key]} ${d.label} · ${percent(counts[d.key], total)}%`
          return (
            <div
              key={d.key}
              className={`${styles.segment} ${styles.mark}`}
              style={{ flexGrow: counts[d.key], '--key': d.color, '--i': index }}
              tabIndex={0}
              role="img"
              aria-label={`${d.label}: ${counts[d.key]} of ${total} (${percent(counts[d.key], total)}%)`}
            >
              <span className={styles.segmentFill} aria-hidden="true" />
              <span
                className={`${styles.tip} ${index === 0 ? styles.tipStart : ''} ${index === shown.length - 1 && index > 0 ? styles.tipEnd : ''}`}
                aria-hidden="true"
              >
                <span className={styles.tipValue}>{counts[d.key]} of {total}</span>
                <span className={styles.tipLabel}>{words}</span>
              </span>
            </div>
          )
        })}
      </div>

      {/* All three, even at 0, so the legend reads the same every time. */}
      <ul className={styles.legend} aria-hidden="true">
        {DECISIONS.map((d) => (
          <li key={d.key} className={styles.legendItem}>
            <span className={styles.swatch} style={{ '--key': d.color }} />
            {d.label}
            <span className={styles.legendCount}>{counts[d.key]}</span>
            <span className={styles.legendShare}>{percent(counts[d.key], total)}%</span>
          </li>
        ))}
      </ul>
    </>
  )
}
