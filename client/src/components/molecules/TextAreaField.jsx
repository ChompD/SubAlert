import styles from './FormField.module.css'

// FormField's twin for longer text: the same label and error, a <textarea>,
// and a live "12 / 500" counter so the limit is never a surprise.
// The counter is linked with aria-describedby, so screen readers hear it too.
export default function TextAreaField({ id, label, hint, error, value = '', maxLength, ...textareaProps }) {
  const counterId = `${id}-counter`
  const errorId = `${id}-error`
  const describedBy = [maxLength && counterId, error && errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {hint && <span className={styles.hint}> {hint}</span>}
      </label>
      <textarea
        id={id}
        className={`${styles.input} ${styles.textarea} ${error ? styles.invalid : ''}`}
        value={value}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...textareaProps}
      />
      {maxLength && (
        <p id={counterId} className={styles.counter}>
          {value.length} / {maxLength}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  )
}
