import styles from './Button.module.css'

// One button for the whole app, in three looks. Use at most one "primary" per
// screen, so the main action is obvious.
//
// type defaults to "button", not the browser's "submit", so a button inside a
// form only submits it when you ask for that.
export default function Button({
  variant = 'primary',
  type = 'button',
  fullWidth = false,
  className = '',
  children,
  ...rest
}) {
  const classes = [styles.button, styles[variant], fullWidth && styles.fullWidth, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  )
}
