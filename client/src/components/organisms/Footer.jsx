import styles from './Footer.module.css'

// Desktop only. The phone layout hides it to save space.
export default function Footer() {
  return <footer className={styles.footer}>Your data is synced to your account</footer>
}
