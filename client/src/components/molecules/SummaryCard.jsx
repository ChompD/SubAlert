import { useEffect, useRef, useState } from 'react'
import styles from './SummaryCard.module.css'

const COUNT_MS = 600

// A number that runs up (or down) to its new value instead of jumping.
// Only whole numbers: "₱549.00 + $15.99/mo" is text and just swaps.
function useCountUp(target) {
  const [shown, setShown] = useState(typeof target === 'number' ? 0 : target)
  const from = useRef(typeof target === 'number' ? 0 : null)

  useEffect(() => {
    if (typeof target !== 'number') {
      setShown(target)
      return undefined
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = from.current ?? target
    if (reduced || start === target) {
      from.current = target
      setShown(target)
      return undefined
    }
    let frame
    const began = performance.now()
    const tick = (now) => {
      const t = Math.min((now - began) / COUNT_MS, 1)
      const eased = 1 - (1 - t) ** 3 // ease out: quick, then settles
      const value = Math.round(start + (target - start) * eased)
      from.current = value
      setShown(value)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target])

  return shown
}

// One number with a label above it ("Due in 48h: 2").
// `index` staggers the cards so they arrive one after another.
export default function SummaryCard({ label, value, index = 0 }) {
  const shown = useCountUp(value)

  // Counts real changes, not the first render: the card already slides in
  // then, and a pop on top of that would be too much.
  const changes = useRef(0)
  const last = useRef(value)
  if (last.current !== value) {
    last.current = value
    changes.current += 1
  }

  return (
    <div className={styles.card} style={{ '--i': index }}>
      <p className={styles.label}>{label}</p>
      {/* key: each change remounts this line, which replays the pop. Screen
          readers get the real value, not every number on the way to it. */}
      <p key={changes.current} className={`${styles.value} ${changes.current ? styles.pop : ''}`}>
        <span aria-hidden="true">{shown}</span>
        <span className="sr-only">{value}</span>
      </p>
    </div>
  )
}
