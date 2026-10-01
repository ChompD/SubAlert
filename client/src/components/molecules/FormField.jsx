import { useState } from 'react'
import styles from './FormField.module.css'

// A label, an input, and an optional error under it. Used by every form.
//
// htmlFor/id ties the label to the input, so clicking the label focuses the
// input and screen readers announce it. aria-describedby ties the error to the
// input, so the error is read out, not only shown in orange.
//
// type="password" also gets a Show/Hide button, so you can check what you
// typed before sending it.
export default function FormField({ id, label, hint, error, type, ...inputProps }) {
  const errorId = `${id}-error`
  const isPassword = type === 'password'
  const [shown, setShown] = useState(false)

  const input = (
    <input
      id={id}
      type={isPassword && shown ? 'text' : type}
      className={`${styles.input} ${error ? styles.invalid : ''}`}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? errorId : undefined}
      {...inputProps}
    />
  )

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {hint && <span className={styles.hint}> {hint}</span>}
      </label>
      {isPassword ? (
        <div className={styles.passwordWrap}>
          {input}
          {/* type="button" so it never sends the form. The visible word is
              in the spoken name too ("Show password"), as WCAG asks. */}
          <button
            type="button"
            className={styles.reveal}
            aria-label={shown ? 'Hide password' : 'Show password'}
            aria-controls={id}
            onClick={() => setShown(!shown)}
          >
            {shown ? 'Hide' : 'Show'}
          </button>
        </div>
      ) : (
        input
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  )
}
