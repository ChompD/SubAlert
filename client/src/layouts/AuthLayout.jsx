import { Outlet, useLocation } from 'react-router-dom'
import Footer from '../components/organisms/Footer.jsx'
import Header from '../components/organisms/Header.jsx'
import styles from './Layout.module.css'

// The frame around Log in and Register: logo-only header, the page, footer.
// <Outlet /> is where React Router puts whichever of the two pages matched.
export default function AuthLayout() {
  const { pathname } = useLocation()

  return (
    <div className={styles.layout}>
      <Header variant="auth" />
      <main className={styles.main}>
        <div key={pathname} className={styles.page}>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}
