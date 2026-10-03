import styles from './AuthCard.module.css'

// The frame around the Log in and Register forms. On a phone it has no border
// and fills the screen; from 640px it is a centred card.
export default function AuthCard({ title, subtitle, footer, children }) {
  return (
    <section className={styles.card} aria-labelledby="auth-title">
      {/* The logo mark with a bell in it: SubTrack warns you before a charge. */}
      <span className={styles.mark} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      </span>
      <h1 id="auth-title" className={styles.title}>
        {title}
      </h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      <div className={styles.body}>{children}</div>
      {footer && <p className={styles.footer}>{footer}</p>}
    </section>
  )
}
