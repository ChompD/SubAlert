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

export const USING_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false'

const implementation = USING_MOCK_API ? mockApi : httpApi

export const {
  register,
  login,
  getMe,
  listSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
} = implementation
