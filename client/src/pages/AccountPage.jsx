import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { changePassword, deleteAccount, updateProfile } from '../api'
import Button from '../components/atoms/Button.jsx'
import FormField from '../components/molecules/FormField.jsx'
import SelectField from '../components/molecules/SelectField.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { friendlyError } from '../utils/errors.js'
import { CURRENCIES } from '../utils/money.js'
import { NAME_MAX, PASSWORD_MIN } from '../utils/validation.js'
import formStyles from './AuthForm.module.css'
import styles from './AccountPage.module.css'

const CURRENCY_OPTIONS = CURRENCIES.map(({ code, label }) => ({ value: code, label }))

// Account settings (/account): three separate forms, each saving on its own,
// so a mistake in one does not throw away what was typed in another.
export default function AccountPage() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()

  // Profile: name and the currency new subscriptions start in.
  const [profile, setProfile] = useState({ name: user.name, defaultCurrency: user.defaultCurrency })
  const [profileErrors, setProfileErrors] = useState({})
  const [profileMessage, setProfileMessage] = useState(null)
  const [savingProfile, setSavingProfile] = useState(false)

  // Password.
  const EMPTY_PASSWORDS = { currentPassword: '', newPassword: '', confirmPassword: '' }
  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS)
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordMessage, setPasswordMessage] = useState(null)
  const [savingPassword, setSavingPassword] = useState(false)

  // Delete account.
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function handleProfile(event) {
    event.preventDefault()
    const name = profile.name.trim()

    if (!name || name.length > NAME_MAX) {
      setProfileErrors({ name: `Enter a name of ${NAME_MAX} characters or fewer` })
      document.getElementById('account-name')?.focus()
      return
    }

    setProfileErrors({})
    setSavingProfile(true)
    try {
      const { user: saved } = await updateProfile({ name, defaultCurrency: profile.defaultCurrency })
      updateUser(saved)
      setProfileMessage('Saved.')
    } catch (error) {
      setProfileMessage(friendlyError(error))
    } finally {
      setSavingProfile(false)
    }
  }

  async function handlePassword(event) {
    event.preventDefault()
    const found = {}
    if (!passwords.currentPassword) found.currentPassword = 'Enter your current password'
    if (passwords.newPassword.length < PASSWORD_MIN) found.newPassword = `Use at least ${PASSWORD_MIN} characters`
    if (passwords.confirmPassword !== passwords.newPassword) found.confirmPassword = "Passwords don't match"

    setPasswordErrors(found)
    const firstProblem = Object.keys(found)[0]
    if (firstProblem) {
      document.getElementById(`account-${firstProblem}`)?.focus()
      return
    }

    setSavingPassword(true)
    try {
      await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      })
      setPasswords(EMPTY_PASSWORDS)
      setPasswordMessage('Password changed.')
    } catch (error) {
      // A wrong current password belongs on that field, not at the top.
      if (error.status === 401) {
        setPasswordErrors({ currentPassword: error.message })
        document.getElementById('account-currentPassword')?.focus()
      } else {
        setPasswordMessage(friendlyError(error))
      }
    } finally {
      setSavingPassword(false)
    }
  }

  async function handleDelete(event) {
    event.preventDefault()
    if (!deletePassword) {
      setDeleteError('Enter your password to confirm')
      return
    }
    if (!window.confirm('Delete your account and every subscription in it? This cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      await deleteAccount({ password: deletePassword })
      logout()
      navigate('/login', { replace: true })
    } catch (error) {
      setDeleteError(friendlyError(error))
      setDeleting(false)
    }
  }

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.back}>
        ← Back to dashboard
      </Link>
      <h1 className={styles.title}>Account</h1>
      <p className={styles.email}>
        Signed in as <strong>{user.email}</strong>
      </p>

      <section className={styles.card} aria-labelledby="profile-heading">
        <h2 id="profile-heading" className={styles.heading}>
          Profile
        </h2>
        <form className={formStyles.form} onSubmit={handleProfile} noValidate>
          {profileMessage && (
            <p className={profileMessage === 'Saved.' ? styles.success : formStyles.formMessage} role="status">
              {profileMessage}
            </p>
          )}

          <FormField
            id="account-name"
            name="name"
            label="Name"
            autoComplete="name"
            value={profile.name}
            onChange={(event) => {
              setProfile({ ...profile, name: event.target.value })
              setProfileErrors({})
              setProfileMessage(null)
            }}
            error={profileErrors.name}
          />

          <SelectField
            id="account-defaultCurrency"
            name="defaultCurrency"
            label="Default currency for new subscriptions"
            options={CURRENCY_OPTIONS}
            value={profile.defaultCurrency}
            onChange={(event) => {
              setProfile({ ...profile, defaultCurrency: event.target.value })
              setProfileMessage(null)
            }}
          />

          <Button type="submit" disabled={savingProfile}>
            {savingProfile ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </section>

      <section className={styles.card} aria-labelledby="password-heading">
        <h2 id="password-heading" className={styles.heading}>
          Password
        </h2>
        <form className={formStyles.form} onSubmit={handlePassword} noValidate>
          {passwordMessage && (
            <p
              className={passwordMessage === 'Password changed.' ? styles.success : formStyles.formMessage}
              role="status"
            >
              {passwordMessage}
            </p>
          )}

          {/* Your current password is asked for first, so someone using your
              unlocked laptop cannot lock you out of your own account. */}
          <FormField
            id="account-currentPassword"
            name="currentPassword"
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={passwords.currentPassword}
            onChange={(event) => {
              setPasswords({ ...passwords, currentPassword: event.target.value })
              setPasswordErrors({ ...passwordErrors, currentPassword: null })
              setPasswordMessage(null)
            }}
            error={passwordErrors.currentPassword}
          />

          <FormField
            id="account-newPassword"
            name="newPassword"
            label="New password"
            type="password"
            autoComplete="new-password"
            placeholder={`At least ${PASSWORD_MIN} characters`}
            value={passwords.newPassword}
            onChange={(event) => {
              setPasswords({ ...passwords, newPassword: event.target.value })
              setPasswordErrors({ ...passwordErrors, newPassword: null })
            }}
            error={passwordErrors.newPassword}
          />

          <FormField
            id="account-confirmPassword"
            name="confirmPassword"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={passwords.confirmPassword}
            onChange={(event) => {
              setPasswords({ ...passwords, confirmPassword: event.target.value })
              setPasswordErrors({ ...passwordErrors, confirmPassword: null })
            }}
            error={passwordErrors.confirmPassword}
          />

          <Button type="submit" disabled={savingPassword}>
            {savingPassword ? 'Changing…' : 'Change password'}
          </Button>
        </form>
      </section>

      <section className={`${styles.card} ${styles.danger}`} aria-labelledby="danger-heading">
        <h2 id="danger-heading" className={styles.heading}>
          Delete account
        </h2>
        <p className={styles.dangerText}>
          This deletes your account and every subscription in it. It cannot be undone.
        </p>
        <form className={formStyles.form} onSubmit={handleDelete} noValidate>
          <FormField
            id="account-deletePassword"
            name="deletePassword"
            label="Your password"
            type="password"
            autoComplete="current-password"
            value={deletePassword}
            onChange={(event) => {
              setDeletePassword(event.target.value)
              setDeleteError(null)
            }}
            error={deleteError}
          />
          <Button type="submit" variant="danger" disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete my account'}
          </Button>
        </form>
      </section>
    </div>
  )
}
