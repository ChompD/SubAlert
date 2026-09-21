import { Search } from 'lucide-react'
import styles from './SearchBar.module.css'

// "Search services…" with a magnifier. type="search" gives a built-in clear
// (x) button in most browsers, and Escape clears it too. The label is hidden
// on screen but still read out, since the placeholder alone isn't a label.
export default function SearchBar({ id, value, onChange, className = '' }) {
  return (
    <div className={`${styles.wrapper} ${className}`} role="search">
      <label htmlFor={id} className="sr-only">
        Search services
      </label>
      <Search className={styles.icon} size={16} aria-hidden="true" />
      <input
        id={id}
        type="search"
        className={styles.input}
        placeholder="Search services…"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
