// The simulated backend.
//
// Same function names, same return types, and the same shape of failure as
// httpApi.js, so your components cannot tell the difference. Data lives in the
// visitor's own browser and goes no further.
//
// This exists so the template's GitHub Pages link works on day one and so you
// can build the interface before your API is deployed. It is NOT a finished
// project. See content/extending-your-app page 3.

import { getToken } from './token.js'

// A real network is not instant. Keeping this delay is what forces you to build
// a loading state now, while it is cheap, instead of discovering you need one
// the day you switch to the real API.
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

function readList(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    // Corrupted storage. Start again rather than crashing the app.
    localStorage.removeItem(key)
    return []
  }
}

const writeList = (key, rows) => localStorage.setItem(key, JSON.stringify(rows))

function fail(status, message) {
  const error = new Error(message)
  error.status = status
  throw error
}

// ---------------------------------------------------------------------------
// Accounts. Passwords are stored as a SHA-256 hash, never as typed. A real
// server would use bcrypt; this only ever lives in this visitor's browser.

const USERS_KEY = 'subalert:mock-users'

async function hash(text) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('')
}

const publicUser = ({ passwordHash, ...user }) => user

// The logged-in user's id, read from the token ("mock.<id>"), or a 401.
function currentUserId() {
  const id = getToken()?.replace(/^mock\./, '')
  if (!id || !readList(USERS_KEY).some((row) => row.id === id)) {
    fail(401, 'Your session has ended. Log in again')
  }
  return id
}

export async function register({ name, email, password }) {
  await delay()
  const cleanName = name?.trim() ?? ''
  const cleanEmail = email?.trim().toLowerCase() ?? ''
  if (!cleanName || !cleanEmail || (password ?? '').length < 8) {
    fail(400, 'Enter a name, a valid email and a password of at least 8 characters')
  }

  const rows = readList(USERS_KEY)
  if (rows.some((row) => row.email === cleanEmail)) {
    fail(409, 'That email already has an account. Log in instead')
  }

  const user = {
    id: crypto.randomUUID(),
    name: cleanName,
    email: cleanEmail,
    passwordHash: await hash(password),
    created_at: new Date().toISOString(),
  }
  writeList(USERS_KEY, [...rows, user])
  return { token: `mock.${user.id}`, user: publicUser(user) }
}

export async function login({ email, password }) {
  await delay()
  const found = readList(USERS_KEY).find((row) => row.email === email?.trim().toLowerCase())
  if (!found || found.passwordHash !== (await hash(password ?? ''))) {
    fail(401, 'Wrong email or password')
  }
  return { token: `mock.${found.id}`, user: publicUser(found) }
}

export async function getMe() {
  await delay()
  const id = currentUserId()
  return { user: publicUser(readList(USERS_KEY).find((row) => row.id === id)) }
}

// ---------------------------------------------------------------------------
// Subscriptions. Every row carries the userId of its owner, and every function
// only ever touches the logged-in user's rows, the same rule the real database
// will enforce with "AND user_id = $2".

const SUBSCRIPTIONS_KEY = 'subalert:mock-subscriptions'

const STATUSES = ['keep', 'cancel', 'undecided']

function cleanSubscription(input) {
  const name = input.name?.trim() ?? ''
  const trialEndDate = input.trialEndDate ?? ''
  const price = Number(input.price)
  const status = STATUSES.includes(input.status) ? input.status : 'undecided'

  if (!name || name.length > 80) fail(400, 'Enter a service name of 80 characters or fewer')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trialEndDate)) fail(400, 'Enter the trial end date')
  if (!Number.isFinite(price) || price < 0 || price > 99999) fail(400, 'Enter a price from 0 to 99,999')

  return { name, trialEndDate, price: Math.round(price * 100) / 100, status }
}

// Only what the page needs: the owner's id stays inside the "database".
const publicSubscription = ({ userId, ...row }) => row

export async function listSubscriptions() {
  await delay()
  const userId = currentUserId()
  return readList(SUBSCRIPTIONS_KEY)
    .filter((row) => row.userId === userId)
    .sort((a, b) => a.trialEndDate.localeCompare(b.trialEndDate))
    .map(publicSubscription)
}

export async function createSubscription(input) {
  await delay()
  const userId = currentUserId()
  const created = {
    ...cleanSubscription(input),
    id: crypto.randomUUID(),
    userId,
    created_at: new Date().toISOString(),
  }
  writeList(SUBSCRIPTIONS_KEY, [...readList(SUBSCRIPTIONS_KEY), created])
  return publicSubscription(created)
}

// Changes only the fields given, so the Keep/Cancel toggle can send
// { status } without resending the rest.
export async function updateSubscription(id, changes) {
  await delay()
  const userId = currentUserId()
  const rows = readList(SUBSCRIPTIONS_KEY)
  const index = rows.findIndex((row) => row.id === id && row.userId === userId)
  if (index === -1) fail(404, 'Not found')

  rows[index] = { ...rows[index], ...cleanSubscription({ ...rows[index], ...changes }) }
  writeList(SUBSCRIPTIONS_KEY, rows)
  return publicSubscription(rows[index])
}
