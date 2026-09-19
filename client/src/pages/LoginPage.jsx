import { Link } from 'react-router-dom'

// Shell for now. The form arrives in section 4.
export default function LoginPage() {
  return (
    <main style={{ padding: 'var(--space-4) var(--space-2)' }}>
      <h1>Log in</h1>
      <p>
        Don&apos;t have an account? <Link to="/register">Register</Link>
      </p>
    </main>
  )
}
