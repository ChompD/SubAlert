import { Link } from 'react-router-dom'
import logo from '../../assets/subtrack-logo.png'
import UserMenu from '../molecules/UserMenu.jsx'
import styles from './Header.module.css'

// variant="app": logo, the main tabs (nav), then whatever the page passes in
// (search, "+ Add"), then the user menu. variant="auth": logo only, for Log in
// and Register.
export default function Header({ variant = 'app', user, onLogout, nav, children }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* alt="" because the name is written right next to it: a screen
            reader would otherwise say "SubTrack" twice. */}
        <Link to="/" className={styles.logo}>
          <img src={logo} alt="" width="24" height="24" className={styles.mark} />
          SubTrack
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
