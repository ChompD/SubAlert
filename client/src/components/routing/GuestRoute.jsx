import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import PageStatus from './PageStatus.jsx'

// The opposite of ProtectedRoute, for Log in and Register: someone already
// logged in has no reason to see them, so they go on.
//
// "On" is the page ProtectedRoute sent them away from, when there is one, so
// logging in returns you to where you were (filters included), not always to
// the Dashboard. This runs the moment the user is set, which is before the
// Log in page's own navigate() gets a turn, so it has to be done here.
export default function GuestRoute() {
  const { user, status } = useAuth()
  const from = useLocation().state?.from

  if (status === 'checking') return <PageStatus>Checking your session…</PageStatus>

  if (user) return <Navigate to={from ? `${from.pathname}${from.search ?? ''}` : '/'} replace />

  return <Outlet />
}
