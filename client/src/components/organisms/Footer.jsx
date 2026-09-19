import { USING_MOCK_API } from '../../api'
import styles from './Footer.module.css'

// Desktop only. The phone layout hides it to save space.
// It says where your data actually is, which changes when the real backend
// is switched on.
export default function Footer() {
  return (
    <footer className={styles.footer}>
      {USING_MOCK_API ? 'Your data is saved in this browser' : 'Your data is synced to your account'}
    </footer>
  )
}
