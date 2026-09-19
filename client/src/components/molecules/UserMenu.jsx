import { useCallback, useRef, useState } from 'react'
import Avatar from '../atoms/Avatar.jsx'
import useDismiss from '../../hooks/useDismiss.js'
import styles from './UserMenu.module.css'

// The avatar (and, on desktop, the name) in the header. Opens a small menu with
// the signed-in email and "Log out".
export default function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const wrapper = useRef(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(wrapper, open, close)

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
          <button type="button" className={styles.item} onClick={onLogout}>
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
