import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import PageStatus from './PageStatus.jsx'

// Wraps the pages that need an account (Dashboard, and later Add and Edit).
// A logged-out visitor goes to /login, which remembers where they were headed
// and sends them back there after logging in.
//
// This only decides what to SHOW. The real protection is on the server:
// requireAuth refuses data to anyone without a valid token, whatever the
// browser does.
export default function ProtectedRoute() {
  const { user, status } = useAuth()
  const location = useLocation()

  if (status === 'checking') return <PageStatus>Checking your session…</PageStatus>

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />

  return <Outlet />
}
