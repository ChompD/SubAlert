import styles from './FormField.module.css'

// A label, an input, and an optional error under it. Used by every form.
//
// htmlFor/id ties the label to the input, so clicking the label focuses the
// input and screen readers announce it. aria-describedby ties the error to the
// input, so the error is read out, not only shown in orange.
export default function FormField({ id, label, error, ...inputProps }) {
  const errorId = `${id}-error`

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        className={`${styles.input} ${error ? styles.invalid : ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  )
}
