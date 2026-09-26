import { ChartColumn, LayoutList } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import styles from './AppTabs.module.css'

const TABS = [
  // end: "/" would otherwise count as active on every page, since every
  // path starts with a slash.
  { to: '/', label: 'Dashboard', Icon: LayoutList, end: true },
  { to: '/analytics', label: 'Analytics', Icon: ChartColumn },
]

// The switch between the app's two main pages. NavLink marks the current one
// with aria-current="page", so a screen reader says "Analytics, current page",
// and the CSS styles it from that same attribute.
//
// variant="header" sits beside the logo on desktop; variant="row" is the
// full-width row under the header on a phone. The layout renders both and
// CSS shows one, the same way it handles search.
export default function AppTabs({ variant = 'header', className = '' }) {
  return (
    <nav aria-label="Main" className={`${styles.tabs} ${styles[variant]} ${className}`}>
      {TABS.map(({ to, label, Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={styles.tab}>
          <Icon size={16} aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
