import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import PageStatus from './PageStatus.jsx'

// The opposite of ProtectedRoute, for Log in and Register: someone already
// logged in has no reason to see them, so they go to the Dashboard.
export default function GuestRoute() {
  const { user, status } = useAuth()

  if (status === 'checking') return <PageStatus>Checking your session…</PageStatus>

  if (user) return <Navigate to="/" replace />

  return <Outlet />
}
