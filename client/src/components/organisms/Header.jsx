import { Link } from 'react-router-dom'
import UserMenu from '../molecules/UserMenu.jsx'
import styles from './Header.module.css'

// variant="app": logo, the main tabs (nav), then whatever the page passes in
// (search, "+ Add"), then the user menu. variant="auth": logo only, for Log in
// and Register.
export default function Header({ variant = 'app', user, onLogout, nav, children }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <span className={styles.mark} aria-hidden="true" />
          SubAlert
        </Link>

        {variant === 'app' && nav}

        {variant === 'app' && (
          <div className={styles.actions}>
            {children}
            {user && <UserMenu user={user} onLogout={onLogout} />}
          </div>
        )}
      </div>
    </header>
  )
}
