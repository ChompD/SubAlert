import styles from './Pill.module.css'

// A filter chip ("All", "Ending soon", "Keep"...). It is a real button with
// aria-pressed, so screen readers say whether it is switched on.
export default function Pill({ selected = false, onClick, children }) {
  return (
    <button
      type="button"
      className={`${styles.pill} ${selected ? styles.selected : ''}`}
      aria-pressed={selected}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
