import pg from 'pg'

// DATE columns come back as the plain text Postgres stores ("2026-10-01"),
// not as a JavaScript Date. A Date is a moment in time: pg would make it
// midnight in the SERVER's timezone, and on a host running in UTC the client
// could then show 30 September for a subscription ending 1 October. 1082 is
// Postgres's internal number for the DATE type.
pg.types.setTypeParser(1082, (value) => value)

// Fail at boot with one clear line, rather than with a mystery 500 an hour
// later. The commonest deployment mistake is setting a variable in .env on your
// laptop and never setting it in the host's dashboard.
if (!process.env.DATABASE_URL) {
  console.error(
    'DATABASE_URL is not set. Locally: copy .env.example to .env and fill it in. ' +
    'On a host: add it in the dashboard, then redeploy.'
  )
  process.exit(1)
}

// A local PostgreSQL has no TLS configured. Every managed host requires it and
// presents a certificate chain Node does not trust out of the box, which is why
// rejectUnauthorized is false: the connection is still encrypted, it is just not
// verifying who is on the other end. That is the standard tradeoff for a
// student project. If your host publishes a CA certificate, pass it as
// ssl: { ca: readFileSync('ca.pem') } instead and say so in your journal.
const isLocal =
  process.env.DATABASE_URL.includes('localhost') ||
  process.env.DATABASE_URL.includes('127.0.0.1')

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: 5,                          // free tiers allow far fewer than you think
  idleTimeoutMillis: 10_000,       // hand connections back quickly
  connectionTimeoutMillis: 5_000,  // fail fast rather than hanging the request
})

// A pool whose server goes away should say so once, loudly, not take the
// process down.
pool.on('error', (error) => {
  console.error('Unexpected database pool error:', error.message)
})
