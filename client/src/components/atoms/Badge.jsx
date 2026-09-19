import styles from './Badge.module.css'

// How soon a trial charges you. The words carry the meaning, not only the
// colour, so it still works for someone who can't tell orange from grey.
//   urgent: 48 hours or less (filled orange)
//   soon:   7 days or less (orange outline)
//   later:  anything further off, or already ended (grey outline)
export default function Badge({ level = 'later', children }) {
  return <span className={`${styles.badge} ${styles[level]}`}>{children}</span>
}
