import { useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/atoms/Button.jsx'
import AppTabs from '../components/molecules/AppTabs.jsx'
import BottomNav from '../components/molecules/BottomNav.jsx'
import SearchBar from '../components/molecules/SearchBar.jsx'
import Footer from '../components/organisms/Footer.jsx'
import Header from '../components/organisms/Header.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import useDashboardFilters from '../hooks/useDashboardFilters.js'
import styles from './Layout.module.css'

// The frame around every logged-in page: the app header with the user menu,
// the page, and the footer. On a phone, the main navigation (Dashboard, Add,
// Analytics) is the bar at the bottom of the screen, BottomNav.
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
  // The phone's bottom bar, everywhere except the Add and Edit forms: you're
  // already adding there, and Save and Back are on the page.
  const showBottomNav = pathname !== '/add' && !pathname.startsWith('/edit/')

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
      <Header user={user} onLogout={handleLogout} nav={<AppTabs variant="header" />}>
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
        {/* From 640px. On a phone, Add is the round button in BottomNav. */}
        <Button className={styles.headerAdd} onClick={() => navigate('/add')}>
          + Add subscription
        </Button>
      </Header>

      {/* Tablets: the tabs get their own row under the header. Phones have
          them in BottomNav instead; desktop has them in the header. */}
      <AppTabs variant="row" />

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

      <main className={`${styles.main} ${showBottomNav ? styles.roomForBottomNav : ''}`}>
        <div key={pathname} className={styles.page}>
          <Outlet />
        </div>
      </main>
      <Footer />
      {showBottomNav && <BottomNav />}
    </div>
  )
}
