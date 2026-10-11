// Run a .sql file against DATABASE_ADMIN_URL, or DATABASE_URL if that isn't set.
//
//   node --env-file=.env db/run.js db/schema.sql
//
// This exists instead of a psql command in package.json so the same script
// works on macOS, Windows, Linux and a Codespace, and so you do not need the
// PostgreSQL client tools installed to set up the database.

import { readFileSync } from 'node:fs'

// Changing tables needs their owner, postgres. The API itself logs in as
// subtrack_app (DATABASE_URL), which can only read and write rows, so the
// schema runs with DATABASE_ADMIN_URL. On a local database with one user,
// leave DATABASE_ADMIN_URL out and DATABASE_URL is used for both.
// pool.js reads DATABASE_URL as it loads, hence the swap before the import.
if (process.env.DATABASE_ADMIN_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_ADMIN_URL
}
const { pool } = await import('./pool.js')

const file = process.argv[2]

if (!file) {
  console.error('usage: node --env-file=.env db/run.js <file.sql>')
  process.exit(1)
}

try {
  await pool.query(readFileSync(file, 'utf8'))
  console.log(`ran ${file}`)
} catch (error) {
  console.error(`failed on ${file}: ${error.message}`)
  // 42501 is "permission denied" / "must be owner": the limited app user tried
  // to change a table.
  if (error.code === '42501' && !process.env.DATABASE_ADMIN_URL) {
    console.error('Set DATABASE_ADMIN_URL in .env to the postgres connection string, then run this again.')
  }
  process.exitCode = 1
} finally {
  await pool.end()
}
