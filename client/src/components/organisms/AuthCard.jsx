import styles from './AuthCard.module.css'

// The frame around the Log in and Register forms. On a phone it has no border
// and fills the screen; from 640px it is a centred card.
export default function AuthCard({ title, subtitle, footer, children }) {
  return (
    <section className={styles.card} aria-labelledby="auth-title">
      <span className={styles.mark} aria-hidden="true" />
      <h1 id="auth-title" className={styles.title}>
        {title}
      </h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      <div className={styles.body}>{children}</div>
      {footer && <p className={styles.footer}>{footer}</p>}
    </section>
  )
}
