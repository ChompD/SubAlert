import { DEFAULT_COLOR, DEFAULT_ICON, SERVICE_ICONS } from '../../utils/icons.js'
import styles from './ServiceIcon.module.css'

// A subscription's picture: one of the icons from utils/icons.js, or the first
// letter of its name, on a soft tint of the chosen colour.
// Decorative, because the name is always written next to it.
export default function ServiceIcon({ name = '', icon = DEFAULT_ICON, color = DEFAULT_COLOR, size = 32 }) {
  const Icon = SERVICE_ICONS.find((option) => option.key === icon)?.Icon

  return (
    <span
      className={styles.icon}
      style={{
        width: size,
        height: size,
        background: `var(--icon-${color}-bg)`,
        color: `var(--icon-${color}-fg)`,
      }}
      aria-hidden="true"
    >
      {Icon ? (
        <Icon size={Math.round(size * 0.55)} strokeWidth={2} />
      ) : (
        name.trim().charAt(0).toUpperCase() || '?'
      )}
    </span>
  )
}
