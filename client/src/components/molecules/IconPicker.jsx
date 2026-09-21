import ServiceIcon from '../atoms/ServiceIcon.jsx'
import { SERVICE_COLORS, SERVICE_ICONS } from '../../utils/icons.js'
import styles from './IconPicker.module.css'

// Choose a subscription's icon and colour. Each choice is a real radio button,
// hidden and drawn over with a picture, so the arrow keys move between
// options and a screen reader says "Music, radio button, 3 of 17".
export default function IconPicker({ name, icon, color, onChange }) {
  return (
    <div className={styles.picker}>
      <div className={styles.preview}>
        <ServiceIcon name={name || '?'} icon={icon} color={color} size={48} />
        <span className={styles.previewName}>{name || 'Your service'}</span>
      </div>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Icon</legend>
        <div className={styles.icons}>
          {SERVICE_ICONS.map((option) => (
            <label key={option.key} className={styles.option} title={option.label}>
              <input
                type="radio"
                name="icon"
                value={option.key}
                checked={icon === option.key}
                onChange={() => onChange({ icon: option.key })}
                className={styles.radio}
              />
              <span className={styles.face}>
                <ServiceIcon name={name || '?'} icon={option.key} color={color} size={32} />
              </span>
              <span className="sr-only">{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Colour</legend>
        <div className={styles.colors}>
          {SERVICE_COLORS.map((option) => (
            <label key={option.key} className={styles.option} title={option.label}>
              <input
                type="radio"
                name="color"
                value={option.key}
                checked={color === option.key}
                onChange={() => onChange({ color: option.key })}
                className={styles.radio}
              />
              <span
                className={`${styles.face} ${styles.swatch}`}
                style={{ background: `var(--icon-${option.key}-bg)`, borderColor: `var(--icon-${option.key}-fg)` }}
              />
              <span className="sr-only">{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}
