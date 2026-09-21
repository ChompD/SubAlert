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
export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { query, setQuery } = useDashboardFilters()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={styles.layout}>
      <Header user={user} onLogout={handleLogout}>
        {/* Search only means something on the Dashboard. Desktop only: the
            phone header has no room for it. */}
        {pathname === '/' && (
          <SearchBar id="header-search" value={query} onChange={setQuery} className={styles.headerSearch} />
        )}
        <Button onClick={() => navigate('/add')}>
          <span className={styles.addShort}>+ Add</span>
          <span className={styles.addLong}>+ Add subscription</span>
        </Button>
      </Header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
