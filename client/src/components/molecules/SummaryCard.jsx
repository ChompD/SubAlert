import styles from './SummaryCard.module.css'

// One number with a label above it ("Ending in 48h: 2").
export default function SummaryCard({ label, value }) {
  return (
    <div className={styles.card}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
    </div>
  )
}
