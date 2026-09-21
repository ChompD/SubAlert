import { ArrowUpDown } from 'lucide-react'
import Pill from '../atoms/Pill.jsx'
import { FILTERS, SORTS } from '../../utils/subscriptionFilters.js'
import styles from './FilterBar.module.css'

// The row above the list: filter pills, then sort.
// counts is { all: 5, soon: 2, ... } so each pill says how many it holds.
//
// Phone: the pills scroll sideways and sort is a small square button at the
// end of the same row. It's still the real <select>, laid invisibly over the
// icon, so tapping it opens the phone's own picker. Desktop: "Sort" and the
// <select> as normal.
export default function FilterBar({ filter, onFilterChange, sort, onSortChange, counts = {} }) {
  return (
    <div className={styles.bar}>
      <div className={styles.pills} role="group" aria-label="Filter subscriptions">
        {FILTERS.map(({ key, label }) => (
          <Pill key={key} selected={filter === key} onClick={() => onFilterChange(key)}>
            {label}
            {counts[key] !== undefined && <span className={styles.count}>{counts[key]}</span>}
          </Pill>
        ))}
      </div>

      <div className={styles.sort}>
        <label htmlFor="dashboard-sort" className={styles.sortLabel}>
          Sort
        </label>
        <span className={styles.sortIcon} aria-hidden="true">
          <ArrowUpDown size={18} />
        </span>
        <select
          id="dashboard-sort"
          className={styles.select}
          value={sort}
          onChange={(event) => onSortChange(event.target.value)}
        >
          {SORTS.map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
