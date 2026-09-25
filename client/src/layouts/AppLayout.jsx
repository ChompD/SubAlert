import { useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/atoms/Button.jsx'
import SearchBar from '../components/molecules/SearchBar.jsx'
import Footer from '../components/organisms/Footer.jsx'
import Header from '../components/organisms/Header.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import useDashboardFilters from '../hooks/useDashboardFilters.js'
import styles from './Layout.module.css'

// The frame around every logged-in page: the app header with the user menu,
// the page, and the footer.
//
// Search only means something on the Dashboard, and it appears in two ways:
// a box in the header on desktop, and on a phone a magnifier button that
// opens a full-width row under the header, because the phone header is
// already full. Both write to the same place (the URL), so they cannot
// disagree with each other.
export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { query, setQuery } = useDashboardFilters()
  const isDashboard = pathname === '/'

  // Open already if the URL arrives with a search in it (a shared link, or
  // coming back from the edit page), so the row matches what the list shows.
  const [searchOpen, setSearchOpen] = useState(() => Boolean(query))
  const toggleButton = useRef(null)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  // Closing clears the search, so the list can never stay filtered by a box
  // that is no longer on screen. Focus goes back to the magnifier.
  function closeSearch() {
    setQuery('')
    setSearchOpen(false)
    toggleButton.current?.focus()
  }

  return (
    <div className={styles.layout}>
      <Header user={user} onLogout={handleLogout}>
        {isDashboard && (
          <>
            <SearchBar
              id="header-search"
              value={query}
              onChange={setQuery}
              className={styles.headerSearch}
            />
            <button
              type="button"
              ref={toggleButton}
              className={styles.searchToggle}
              aria-label="Search subscriptions"
              aria-expanded={searchOpen}
              aria-controls="phone-search-row"
              onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
            >
              {searchOpen ? <X size={18} aria-hidden="true" /> : <Search size={18} aria-hidden="true" />}
            </button>
          </>
        )}
        <Button onClick={() => navigate('/add')}>
          <span className={styles.addShort}>+ Add</span>
          <span className={styles.addLong}>+ Add subscription</span>
        </Button>
      </Header>

      {isDashboard && searchOpen && (
        <div
          id="phone-search-row"
          className={styles.phoneSearchRow}
          onKeyDown={(event) => {
            if (event.key === 'Escape') closeSearch()
          }}
        >
          {/* autoFocus so the keyboard opens straight away on a phone. */}
          <SearchBar id="phone-search" value={query} onChange={setQuery} autoFocus />
        </div>
      )}

      <main className={styles.main}>
        <div key={pathname} className={styles.page}>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}
