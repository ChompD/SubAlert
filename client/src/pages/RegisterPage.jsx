import { Link } from 'react-router-dom'

// Shell for now. The form arrives in section 5.
export default function RegisterPage() {
  return (
    <main style={{ padding: 'var(--space-4) var(--space-2)' }}>
      <h1>Create account</h1>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </main>
  )
}
