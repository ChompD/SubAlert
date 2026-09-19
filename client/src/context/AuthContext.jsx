import { createContext, useContext, useEffect, useState } from 'react'
import * as api from '../api'
import { clearToken, getToken, setToken } from '../api/token.js'

// Who is logged in, available to every component through useAuth().
//
// A context rather than props because nearly everything needs it (the header,
// the protected routes, every page that loads your data), and passing `user`
// down through each layer would clutter components that never use it.

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // 'checking' while a saved token is turned back into a user. Without it,
  // a logged-in user would see the Log in page flash on every reload.
  const [status, setStatus] = useState(() => (getToken() ? 'checking' : 'ready'))

  useEffect(() => {
    if (!getToken()) return

    api
      .getMe()
      .then(({ user }) => setUser(user))
      .catch((error) => {
        // 401: the token expired or is no good, so forget it. Anything else
        // (the free-tier server is asleep, the network dropped) keeps it, so
        // the next reload can try again instead of logging you out.
        if (error.status === 401) clearToken()
      })
      .finally(() => setStatus('ready'))
  }, [])

  async function login(email, password) {
    const { token, user } = await api.login({ email, password })
    setToken(token)
    setUser(user)
  }

  async function register(name, email, password) {
    const { token, user } = await api.register({ name, email, password })
    setToken(token)
    setUser(user)
  }

  function logout() {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}
