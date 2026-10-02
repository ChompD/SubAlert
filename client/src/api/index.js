// The only file your components import from.
//
// Swapping the simulated backend for your real API is one environment variable,
// set at BUILD time. Nothing in src/components or src/pages changes.
//
//   VITE_USE_MOCK_API=false  -> your Express API at VITE_API_BASE_URL
//   anything else, INCLUDING UNSET -> the browser-only fake
//
// Note which way round that is. Demo mode is the DEFAULT, so a fresh copy of
// this template builds into a working site before you have configured anything.
// The alternative (defaulting to the real API) means a forgotten variable
// produces a deployed site that calls an empty URL and fails on every request,
// with nothing on the page explaining why. A visible demo notice is a much
// better failure than a silently broken app.
//
// Both modules are imported statically and one is chosen at run time. The
// tempting version of this uses `await import(...)` to load only the one you
// need, and it does not build: top-level await is not available in Vite's
// default browser target, so `vite build` fails with
// "Top-level await is not available in the configured target environment".
// Bundling both costs a couple of kilobytes and keeps the demo build available
// as your fallback, which you want anyway.

import * as mockApi from './mockApi.js'
import * as httpApi from './httpApi.js'
import { clearToken } from './token.js'

export const USING_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false'

const implementation = USING_MOCK_API ? mockApi : httpApi

// When the server says the session is over (the 7-day token ran out, or the
// account was deleted on another device), every page would otherwise just
// show "Your session has ended" with nothing to do about it. Instead, any
// call that gets that answer forgets the token and tells AuthContext, which
// logs you out; ProtectedRoute then sends you to Log in.
//
// It looks for the "session_ended" code, not just a 401: a wrong current
// password on the Account page is a 401 too, and must not log you out.
const sessionEndedListeners = new Set()

export function onSessionEnded(listener) {
  sessionEndedListeners.add(listener)
  return () => {
    sessionEndedListeners.delete(listener)
  }
}

function watched(call) {
  return async (...args) => {
    try {
      return await call(...args)
    } catch (error) {
      if (error.code === 'session_ended') {
        clearToken()
        sessionEndedListeners.forEach((listener) => listener())
      }
      throw error
    }
  }
}

export const register = watched(implementation.register)
export const login = watched(implementation.login)
export const getMe = watched(implementation.getMe)
export const updateProfile = watched(implementation.updateProfile)
export const changePassword = watched(implementation.changePassword)
export const deleteAccount = watched(implementation.deleteAccount)
export const listSubscriptions = watched(implementation.listSubscriptions)
export const getSubscription = watched(implementation.getSubscription)
export const createSubscription = watched(implementation.createSubscription)
export const updateSubscription = watched(implementation.updateSubscription)
export const deleteSubscription = watched(implementation.deleteSubscription)
