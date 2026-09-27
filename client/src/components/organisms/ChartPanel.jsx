import { useId, useState } from 'react'
import DecisionToggle from '../molecules/DecisionToggle.jsx'
import styles from './ChartPanel.module.css'

const VIEWS = [
  { value: 'chart', label: 'Chart' },
  { value: 'table', label: 'Table' },
]

// A card holding one chart, with a Chart | Table switch. Every chart has a
// table twin with every exact number in it, so nothing is readable only by
// seeing colours or hovering: a screen reader, a colour-blind reader, or
// someone who just wants the figures gets the same information.
//
// `chart` and `table` are what to show in each view; `note` is an optional
// line under either (for example, money in other currencies).
export default function ChartPanel({ title, description, chart, table, note, className = '' }) {
  const [view, setView] = useState('chart')
  const titleId = useId()

  return (
    <figure className={`${styles.panel} ${className}`} aria-labelledby={titleId}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        <div className={styles.switch}>
          <DecisionToggle value={view} onChange={setView} options={VIEWS} label={`Show ${title} as`} />
        </div>
      </header>

      <div key={view} className={styles.body}>
        {view === 'chart' ? chart : table}
      </div>

      {note && <p className={styles.note}>{note}</p>}
    </figure>
  )
}
