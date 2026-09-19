import { Link } from 'react-router-dom'
import AuthCard from '../components/organisms/AuthCard.jsx'

// Shell for now. The form arrives in section 5.
export default function RegisterPage() {
  return (
    <AuthCard
      title="Create account"
      subtitle="Create an account to save your trials."
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    />
  )
}
