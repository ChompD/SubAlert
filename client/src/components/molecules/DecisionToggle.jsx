import styles from './DecisionToggle.module.css'

const TWO_OPTIONS = [
  { value: 'keep', label: 'Keep' },
  { value: 'cancel', label: 'Cancel' },
]

export const THREE_OPTIONS = [...TWO_OPTIONS, { value: 'undecided', label: 'Undecided' }]

// Keep / Cancel (on each row) or Keep / Cancel / Undecided (on the form).
// Real buttons with aria-pressed, grouped with a label, so a screen reader
// says "Decision for Netflix, Keep, pressed".
export default function DecisionToggle({
  value,
  onChange,
  options = TWO_OPTIONS,
  label = 'Decision',
  fullWidth = false,
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`${styles.toggle} ${fullWidth ? styles.fullWidth : ''}`}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`${styles.option} ${value === option.value ? styles.selected : ''}`}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
