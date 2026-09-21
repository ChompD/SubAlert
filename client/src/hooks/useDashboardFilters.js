import { useSearchParams } from 'react-router-dom'
import { DEFAULT_FILTER, DEFAULT_SORT, FILTERS, SORTS } from '../utils/subscriptionFilters.js'

// The Dashboard's search, filter and sort, kept in the page URL:
//   /?q=net&filter=keep&sort=price
//
// Why the URL instead of useState: the search box lives in the Header and the
// pills live in the Dashboard, and the URL is one place both can read. It also
// means a reload keeps your filters, and the back button undoes a change.
export default function useDashboardFilters() {
  const [params, setParams] = useSearchParams()

  // Anything typed into the address bar by hand is checked, so a made-up
  // ?filter=banana falls back to "all" instead of showing an empty list.
  const filterParam = params.get('filter')
  const sortParam = params.get('sort')
  const query = params.get('q') ?? ''
  const filter = FILTERS.some((f) => f.key === filterParam) ? filterParam : DEFAULT_FILTER
  const sort = SORTS.some((s) => s.key === sortParam) ? sortParam : DEFAULT_SORT

  // Defaults are left out of the URL, so a plain "/" means "everything".
  function update(key, value, fallback, replace) {
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (!value || value === fallback) next.delete(key)
        else next.set(key, value)
        return next
      },
      { replace }
    )
  }

  return {
    query,
    filter,
    sort,
    // Typing replaces the history entry, so "netflix" isn't seven Back presses.
    setQuery: (value) => update('q', value, '', true),
    // A pill or sort change is a new entry, so Back undoes it.
    setFilter: (value) => update('filter', value, DEFAULT_FILTER, false),
    setSort: (value) => update('sort', value, DEFAULT_SORT, false),
    // Clears what narrows the list, but keeps the order you picked.
    clear: () =>
      setParams((current) => {
        const next = new URLSearchParams(current)
        next.delete('q')
        next.delete('filter')
        return next
      }),
    isFiltered: Boolean(query.trim()) || filter !== DEFAULT_FILTER,
  }
}
