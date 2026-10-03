import { ChartColumn, LayoutList, Plus } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import styles from './BottomNav.module.css'

// Phones only: the app's main navigation at the bottom of the screen, where a
// thumb rests, instead of at the top where it is hardest to reach.
//
//   [Dashboard]   ( + )   [Analytics]
//                  Add
//
// Adding a subscription is what you come here to do, so it is the round
// button in the middle, raised a little out of the bar. The two pages sit on
// either side, marked like AppTabs: NavLink sets aria-current="page" on the
// current one, and the CSS styles it from that.
//
// AppLayout leaves it out on the Add and Edit forms (no need for it there),
// and the CSS hides it while you type, so it never sits on top of the
// keyboard.
export default function BottomNav() {
  return (
    <nav aria-label="Main" className={styles.bar}>
      <NavLink to="/" end className={styles.tab}>
        <LayoutList size={20} aria-hidden="true" />
        Dashboard
      </NavLink>

      {/* The spoken name starts with the visible word "Add", as WCAG asks. */}
      <NavLink to="/add" className={styles.add} aria-label="Add subscription">
        <span className={styles.addCircle} aria-hidden="true">
          <Plus size={24} strokeWidth={2.5} />
        </span>
        <span aria-hidden="true">Add</span>
      </NavLink>

      <NavLink to="/analytics" className={styles.tab}>
        <ChartColumn size={20} aria-hidden="true" />
        Analytics
      </NavLink>
    </nav>
  )
}
