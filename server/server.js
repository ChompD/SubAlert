import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import { pool } from './db/pool.js'
import * as users from './usersRepo.js'

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

function validateRegistration(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const errors = []

  if (!name || name.length > 80) errors.push('Enter a name of 80 characters or fewer')
  if (!EMAIL_PATTERN.test(email) || email.length > 254) errors.push('Enter a valid email, like name@email.com')
  if (password.length < 8) errors.push('Use a password of at least 8 characters')
  // bcrypt only reads the first 72 BYTES, and an emoji is 4 of them. Past
  // that, two different passwords would both work.
  if (Buffer.byteLength(password) > 72) errors.push('Use a password of 72 characters or fewer')

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

function requireAuth(request, response, next) {
  // "Authorization: Bearer <token>", as client/src/api/httpApi.js sends it.
  const [scheme, token] = (request.get('Authorization') ?? '').split(' ')
  if (scheme !== 'Bearer' || !token) return response.status(401).json({ error: SESSION_ENDED })

  try {
    // algorithms is pinned so a forged token can't pick a weaker one (or
    // "none") for itself. verify also rejects expired tokens.
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
    request.userId = payload.sub
    next()
  } catch {
    // Expired, tampered with, or signed with another secret: all the same to
    // the visitor, and the client answers a 401 by logging them out.
    response.status(401).json({ error: SESSION_ENDED })
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

// Subscriptions and the rest of the account routes go here, from section 5.

app.use((request, response) => {
  response.status(404).json({ error: 'No such route' })
})

// The detail goes in your logs; the visitor gets a plain message. Sending a
// stack trace to a stranger tells them about your file layout and dependencies.
app.use((error, request, response, next) => {
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
