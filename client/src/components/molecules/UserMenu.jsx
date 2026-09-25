import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../atoms/Avatar.jsx'
import useDismiss from '../../hooks/useDismiss.js'
import { useTheme } from '../../context/ThemeContext.jsx'
import styles from './UserMenu.module.css'

const THEMES = [
  { key: 'system', label: 'System' },
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
]

// The avatar (and, on desktop, the name) in the header. Opens a small menu
// with the signed-in email, the light/dark choice, and "Log out".
export default function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const wrapper = useRef(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(wrapper, open, close)
  const { preference, setPreference } = useTheme()

  return (
    <div className={styles.wrapper} ref={wrapper}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls="user-menu"
        onClick={() => setOpen(!open)}
      >
        <Avatar name={user.name} size={28} />
        <span className={styles.name}>{user.name}</span>
        <span className="sr-only">Account menu</span>
        <span className={styles.caret} aria-hidden="true">▾</span>
      </button>

      {open && (
        <div id="user-menu" className={styles.menu}>
          <p className={styles.email}>
            Signed in as <strong>{user.email}</strong>
          </p>

          {/* "System" follows the phone or laptop's own light/dark setting. */}
          <div className={styles.section} role="group" aria-label="Appearance">
            <span className={styles.sectionLabel}>Appearance</span>
            <div className={styles.themes}>
              {THEMES.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={`${styles.theme} ${preference === option.key ? styles.themeOn : ''}`}
                  aria-pressed={preference === option.key}
                  onClick={() => setPreference(option.key)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <Link to="/account" className={styles.item} onClick={close}>
            Account settings
          </Link>

          <button type="button" className={styles.item} onClick={onLogout}>
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
