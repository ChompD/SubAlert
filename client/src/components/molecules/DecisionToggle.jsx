import styles from './DecisionToggle.module.css'

const TWO_OPTIONS = [
  { value: 'keep', label: 'Keep' },
  { value: 'cancel', label: 'Cancel' },
]

export const THREE_OPTIONS = [...TWO_OPTIONS, { value: 'undecided', label: 'Undecided' }]

// Keep / Cancel (on each row) or Keep / Cancel / Undecided (on the form).
// Real buttons with aria-pressed, grouped with a label, so a screen reader
// says "Decision for Netflix, Keep, pressed".
//
// The coloured block behind the chosen option is one element that slides
// between them, rather than each button painting its own background, so
// changing your mind reads as one movement. On a row, "undecided" isn't one
// of the options, so nothing is chosen and the block fades out.
export default function DecisionToggle({
  value,
  onChange,
  options = TWO_OPTIONS,
  label = 'Decision',
  fullWidth = false,
}) {
  const index = options.findIndex((option) => option.value === value)

  return (
    <div
      role="group"
      aria-label={label}
      className={`${styles.toggle} ${fullWidth ? styles.fullWidth : ''}`}
      style={{ '--count': options.length, '--index': Math.max(index, 0) }}
    >
      <span
        className={`${styles.indicator} ${index === -1 ? styles.indicatorHidden : ''}`}
        aria-hidden="true"
      />
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
