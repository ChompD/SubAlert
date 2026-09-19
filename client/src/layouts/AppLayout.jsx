import { Outlet, useNavigate } from 'react-router-dom'
import Button from '../components/atoms/Button.jsx'
import Footer from '../components/organisms/Footer.jsx'
import Header from '../components/organisms/Header.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import styles from './Layout.module.css'

// The frame around every logged-in page: the app header with the user menu,
// the page, and the footer.
export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={styles.layout}>
      <Header user={user} onLogout={handleLogout}>
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
