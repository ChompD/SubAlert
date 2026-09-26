import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import { pool } from './db/pool.js'
import * as users from './usersRepo.js'
import * as subscriptions from './subscriptionsRepo.js'
import { CURRENCIES, FIELDS, validateSubscription } from './subscriptionRules.js'

// Same idea as DATABASE_URL in pool.js: fail at boot with one clear line. A
// missing secret would otherwise sign every token with "undefined".
if (!process.env.JWT_SECRET) {
  console.error(
    'JWT_SECRET is not set. Locally: add it to .env (see .env.example). ' +
    'On a host: add it in the dashboard, then redeploy.'
  )
  process.exit(1)
}

const app = express()

// On Render and similar hosts the request reaches us through their proxy, so
// without this every visitor looks like the same IP to the rate limiter below.
app.set('trust proxy', 1)

// CORS before the routes. Middleware registered after a route never sees that
// route's requests, which is the m4 lesson showing up in production.
//
// Name your origins. app.use(cors()) with no options sends
// Access-Control-Allow-Origin: *, which lets any site on the internet call this
// API from a visitor's browser, and is incompatible with cookies.
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({ origin: allowedOrigins }))
app.use(express.json({ limit: '100kb' }))

// Is the process alive?
app.get('/healthz', (request, response) => {
  response.json({ ok: true })
})

// Is the database reachable? A different question, and the one that tells you
// in two seconds which half of a problem you have.
app.get('/readyz', async (request, response) => {
  try {
    await pool.query('SELECT 1')
    response.json({ ok: true, db: 'up' })
  } catch (error) {
    console.error('readyz failed:', error.message)
    response.status(503).json({ ok: false, db: 'down' })
  }
})

// ---------------------------------------------------------------------------
// Accounts: register and log in.

// Guessing passwords means trying thousands. Ten tries per 15 minutes per IP
// is plenty for a person who mistyped and useless for a script.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many attempts. Wait 15 minutes and try again' },
})

// The same pattern the client checks (client/src/utils/validation.js).
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TOKEN_LIFETIME = '7d'

const signToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: TOKEN_LIFETIME })

// Checked against when the email has no account, so a wrong email takes as
// long to answer as a wrong password. Otherwise the speed of the reply would
// tell a stranger which emails are registered.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12)

// The one password rule, for registering and for changing it. Returns the
// problem as a sentence, or null if the password is fine.
function passwordProblem(password) {
  if (password.length < 8) return 'Use a password of at least 8 characters'
  // bcrypt only reads the first 72 BYTES, and an emoji is 4 of them. Past
  // that, two different passwords would both work.
  if (Buffer.byteLength(password) > 72) return 'Use a password of 72 characters or fewer'
  return null
}

function validateRegistration(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const errors = []

  if (!name || name.length > 80) errors.push('Enter a name of 80 characters or fewer')
  if (!EMAIL_PATTERN.test(email) || email.length > 254) errors.push('Enter a valid email, like name@email.com')
  const problem = passwordProblem(password)
  if (problem) errors.push(problem)

  return { errors, value: { name, email, password } }
}

app.post('/api/auth/register', authLimiter, async (request, response, next) => {
  const { errors, value } = validateRegistration(request.body ?? {})
  if (errors.length > 0) return response.status(400).json({ error: errors.join('. ') })

  try {
    const passwordHash = await bcrypt.hash(value.password, 12)
    const row = await users.create(pool, { name: value.name, email: value.email, passwordHash })
    response.status(201).json({ token: signToken(row.id), user: users.toPublicUser(row) })
  } catch (error) {
    // 23505 is Postgres for "unique constraint broken": the email is taken.
    if (error.code === '23505') {
      return response.status(409).json({ error: 'That email already has an account. Log in instead' })
    }
    next(error)
  }
})

app.post('/api/auth/login', authLimiter, async (request, response, next) => {
  const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : ''
  const password = typeof request.body?.password === 'string' ? request.body.password : ''

  try {
    const row = email ? await users.findByEmail(pool, email) : null
    const matches = await bcrypt.compare(password, row?.password_hash ?? DUMMY_HASH)

    // One message for "no such email" and "wrong password", on purpose.
    if (!row || !matches) return response.status(401).json({ error: 'Wrong email or password' })

    response.json({ token: signToken(row.id), user: users.toPublicUser(row) })
  } catch (error) {
    next(error)
  }
})

// ---------------------------------------------------------------------------
// The door in front of everything personal. Put requireAuth on a route and it
// only runs for a request carrying a valid token, with request.userId set to
// whose it is. Every query after this uses request.userId, never an id the
// browser sent, so nobody can ask for somebody else's data.

const SESSION_ENDED = 'Your session has ended. Log in again'

async function requireAuth(request, response, next) {
  // "Authorization: Bearer <token>", as client/src/api/httpApi.js sends it.
  const [scheme, token] = (request.get('Authorization') ?? '').split(' ')
  if (scheme !== 'Bearer' || !token) return response.status(401).json({ error: SESSION_ENDED })

  let payload
  try {
    // algorithms is pinned so a forged token can't pick a weaker one (or
    // "none") for itself. verify also rejects expired tokens.
    payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
  } catch {
    // Expired, tampered with, or signed with another secret: all the same to
    // the visitor, and the client answers a 401 by logging them out.
    return response.status(401).json({ error: SESSION_ENDED })
  }

  try {
    // A token outlives the account it was made for: it is still validly
    // signed after the account is deleted. Without this check, adding a
    // subscription with it would point at a user who isn't there (a 500).
    // One lookup by primary key per request, which is cheap.
    if (!(await users.findById(pool, payload.sub))) {
      return response.status(401).json({ error: SESSION_ENDED })
    }
    request.userId = payload.sub
    next()
  } catch (error) {
    next(error)
  }
}

// Who am I? The client asks on every page load to turn a saved token back
// into a logged-in user.
app.get('/api/auth/me', requireAuth, async (request, response, next) => {
  try {
    const row = await users.findById(pool, request.userId)
    // A token that is still valid for an account that has since been deleted.
    if (!row) return response.status(401).json({ error: SESSION_ENDED })
    response.json({ user: users.toPublicUser(row) })
  } catch (error) {
    next(error)
  }
})

// ---------------------------------------------------------------------------
// Subscriptions: reading. Only ever the logged-in user's own.

const NOT_FOUND = 'That subscription no longer exists'
// Ids are UUIDs. Anything else can't be one of ours, and passing it to
// Postgres would be a 500 ("invalid input syntax for type uuid"), not a 404.
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

app.get('/api/subscriptions', requireAuth, async (request, response, next) => {
  try {
    const rows = await subscriptions.listForUser(pool, request.userId)
    response.json(rows.map(subscriptions.toPublicSubscription))
  } catch (error) {
    next(error)
  }
})

app.get('/api/subscriptions/:id', requireAuth, async (request, response, next) => {
  if (!UUID_PATTERN.test(request.params.id)) return response.status(404).json({ error: NOT_FOUND })

  try {
    const row = await subscriptions.getForUser(pool, request.params.id, request.userId)
    // Someone else's id looks exactly like one that doesn't exist. Never
    // "that belongs to another account", which would confirm it's real.
    if (!row) return response.status(404).json({ error: NOT_FOUND })
    response.json(subscriptions.toPublicSubscription(row))
  } catch (error) {
    next(error)
  }
})

// ---------------------------------------------------------------------------
// Subscriptions: creating, changing, deleting.

// Only the fields a user may set, from a body that must be a JSON object.
function pickFields(body) {
  const picked = {}
  if (body && typeof body === 'object' && !Array.isArray(body)) {
    for (const field of FIELDS) if (field in body) picked[field] = body[field]
  }
  return picked
}

app.post('/api/subscriptions', requireAuth, async (request, response, next) => {
  const { errors, value } = validateSubscription(pickFields(request.body))
  if (errors.length > 0) return response.status(400).json({ error: errors.join('. ') })

  try {
    const row = await subscriptions.createForUser(pool, request.userId, value)
    response.status(201).json(subscriptions.toPublicSubscription(row))
  } catch (error) {
    next(error)
  }
})

// PATCH, not PUT: send only what changed. The Keep/Cancel toggle sends just
// { status }, the edit form sends everything.
app.patch('/api/subscriptions/:id', requireAuth, async (request, response, next) => {
  if (!UUID_PATTERN.test(request.params.id)) return response.status(404).json({ error: NOT_FOUND })

  try {
    const current = await subscriptions.getForUser(pool, request.params.id, request.userId)
    if (!current) return response.status(404).json({ error: NOT_FOUND })

    // The change laid over what's saved, then the WHOLE result checked, so a
    // partial update can never leave a row that would fail a full one.
    const merged = { ...subscriptions.toPublicSubscription(current), ...pickFields(request.body) }
    const { errors, value } = validateSubscription(merged)
    if (errors.length > 0) return response.status(400).json({ error: errors.join('. ') })

    const row = await subscriptions.updateForUser(pool, request.params.id, request.userId, value)
    // Deleted in another tab between the read and the write.
    if (!row) return response.status(404).json({ error: NOT_FOUND })
    response.json(subscriptions.toPublicSubscription(row))
  } catch (error) {
    next(error)
  }
})

app.delete('/api/subscriptions/:id', requireAuth, async (request, response, next) => {
  if (!UUID_PATTERN.test(request.params.id)) return response.status(404).json({ error: NOT_FOUND })

  try {
    const removed = await subscriptions.removeForUser(pool, request.params.id, request.userId)
    if (!removed) return response.status(404).json({ error: NOT_FOUND })
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

// ---------------------------------------------------------------------------
// Account settings: name and default currency, password, deleting the account.

const text = (value) => (typeof value === 'string' ? value : '')

app.patch('/api/auth/me', requireAuth, async (request, response, next) => {
  const name = text(request.body?.name).trim()
  const defaultCurrency = request.body?.defaultCurrency
  const errors = []
  if (!name || name.length > 80) errors.push('Enter a name of 80 characters or fewer')
  if (!CURRENCIES.includes(defaultCurrency)) errors.push('Pick a currency from the list')
  if (errors.length > 0) return response.status(400).json({ error: errors.join('. ') })

  try {
    const row = await users.updateProfile(pool, request.userId, { name, defaultCurrency })
    if (!row) return response.status(401).json({ error: SESSION_ENDED })
    response.json({ user: users.toPublicUser(row) })
  } catch (error) {
    next(error)
  }
})

// Needs the current password, so someone at an unlocked laptop can't lock
// the owner out. Rate limited like login: it's another place to guess one.
//
// Known limit: tokens already handed out stay valid until they expire (7
// days), so a device that is logged in stays logged in after a change.
app.post('/api/auth/password', requireAuth, authLimiter, async (request, response, next) => {
  const currentPassword = text(request.body?.currentPassword)
  const newPassword = text(request.body?.newPassword)

  try {
    const hash = await users.getPasswordHash(pool, request.userId)
    if (!hash) return response.status(401).json({ error: SESSION_ENDED })
    // 401 with this message is what AccountPage.jsx shows on the field.
    if (!(await bcrypt.compare(currentPassword, hash))) {
      return response.status(401).json({ error: 'That is not your current password' })
    }

    const problem = passwordProblem(newPassword)
    if (problem) return response.status(400).json({ error: problem })

    await users.updatePasswordHash(pool, request.userId, await bcrypt.hash(newPassword, 12))
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

// Deletes the account and, through ON DELETE CASCADE, every subscription in
// it. Asks for the password again, because this can't be undone.
app.delete('/api/auth/me', requireAuth, authLimiter, async (request, response, next) => {
  try {
    const hash = await users.getPasswordHash(pool, request.userId)
    if (!hash) return response.status(401).json({ error: SESSION_ENDED })
    if (!(await bcrypt.compare(text(request.body?.password), hash))) {
      return response.status(401).json({ error: 'Wrong password' })
    }

    await users.remove(pool, request.userId)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.use((request, response) => {
  response.status(404).json({ error: 'No such route' })
})

// The detail goes in your logs; the visitor gets a plain message. Sending a
// stack trace to a stranger tells them about your file layout and dependencies.
app.use((error, request, response, next) => {
  // The request itself was bad: broken JSON, or a body over the 100kb limit.
  // That's a 400-something, not our fault, and it is NOT logged whole,
  // because the error carries the raw body, which on /login is a password.
  if (error.status >= 400 && error.status < 500) {
    console.warn(`${request.method} ${request.path}: ${error.type ?? error.message}`)
    const message = error.type === 'entity.too.large' ? 'That request is too large' : 'That request could not be read'
    return response.status(error.status).json({ error: message })
  }

  console.error(error)
  response.status(500).json({ error: 'Something went wrong on the server' })
})

// The host chooses the port and tells you through PORT. Hardcoding 3000 is the
// commonest reason a first deploy is marked unhealthy and killed.
const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
  console.log(`CORS allows: ${allowedOrigins.join(', ')}`)
})
