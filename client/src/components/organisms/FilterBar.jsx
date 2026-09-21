import Pill from '../atoms/Pill.jsx'
import { FILTERS, SORTS } from '../../utils/subscriptionFilters.js'
import styles from './FilterBar.module.css'

// The row above the list: filter pills on the left, sort on the right.
// counts is { all: 5, soon: 2, ... } so each pill says how many it holds.
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
