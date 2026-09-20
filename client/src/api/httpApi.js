// The real client. Every function here talks to YOUR Express API.
//
// This is the file that matters for your finals project. mockApi.js exists so
// you can build the interface before this has anywhere to point.
//
// SubAlert runs on mockApi.js for now. These are the same functions, pointing
// at the routes the server will have once it is built, so switching over is
// one environment variable, as the template intends.

import { getToken } from './token.js'

const BASE = import.meta.env.VITE_API_BASE_URL || ''

async function request(path, options) {
  // Send the login token with every request, if there is one.
  const token = getToken()

  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })

  if (!response.ok) {
    // Try to use the API's own message; fall back to the status line.
    let message = `${response.status} ${response.statusText}`
    try {
      const body = await response.json()
      if (body?.error) message = body.error
    } catch {
      // The body was not JSON. The status line is all we have.
    }
    const error = new Error(message)
    // Kept so the app can tell "you're logged out" (401) from other failures.
    error.status = response.status
    throw error
  }

  return response.status === 204 ? null : response.json()
}

// Accounts. register and login resolve to { token, user }; getMe to { user }.
export const register = (input) =>
  request('/api/auth/register', { method: 'POST', body: JSON.stringify(input) })

export const login = (input) =>
  request('/api/auth/login', { method: 'POST', body: JSON.stringify(input) })

export const getMe = () => request('/api/auth/me')

// Subscriptions, always the logged-in user's own.
export const listSubscriptions = () => request('/api/subscriptions')

export const getSubscription = (id) => request(`/api/subscriptions/${id}`)

export const createSubscription = (input) =>
  request('/api/subscriptions', { method: 'POST', body: JSON.stringify(input) })

export const updateSubscription = (id, changes) =>
  request(`/api/subscriptions/${id}`, { method: 'PATCH', body: JSON.stringify(changes) })

export const deleteSubscription = (id) =>
  request(`/api/subscriptions/${id}`, { method: 'DELETE' })
