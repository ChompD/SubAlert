import { Link } from 'react-router-dom'

// Shell for now. Becomes the subscription list after login works.
export default function DashboardPage() {
  return (
    <main style={{ padding: 'var(--space-4) var(--space-2)' }}>
      <h1>Your subscriptions</h1>
      <p>
        The list goes here. <Link to="/login">Go to Log in</Link>
      </p>
    </main>
  )
}
