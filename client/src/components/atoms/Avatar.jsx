import styles from './Avatar.module.css'

// A circle with a first letter: the logged-in user (primary) or a
// subscription's service (neutral). Decorative, because the name is always
// written next to it, so screen readers skip it.
export default function Avatar({ name = '', variant = 'primary', size = 32 }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'

  return (
    <span
      className={`${styles.avatar} ${styles[variant]}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {initial}
    </span>
  )
}
