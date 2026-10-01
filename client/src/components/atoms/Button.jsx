import styles from './Button.module.css'

// One button for the whole app, in three looks. Use at most one "primary" per
// screen, so the main action is obvious.
//
// type defaults to "button", not the browser's "submit", so a button inside a
// form only submits it when you ask for that.
//
// loading: shows a small spinning ring before the label and disables the
// button, so a slow server cannot be sent the same form twice.
export default function Button({
  variant = 'primary',
  type = 'button',
  fullWidth = false,
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}) {
  const classes = [styles.button, styles[variant], fullWidth && styles.fullWidth, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  )
}
