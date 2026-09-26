// The data-access layer for accounts.
//
// Every query is parameterised: values go in the array, never into the
// string. That is what stops "'; DROP TABLE users; --" typed into a form from
// being a real problem.

// The shape the client gets. Built by hand, column by column, so the password
// hash can never leak out by accident when a column is added later.
export function toPublicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    defaultCurrency: row.default_currency,
  }
}

// Includes password_hash, because logging in needs to check it. Only the
// login route calls this, and it never sends the row as it is.
export async function findByEmail(pool, email) {
  const result = await pool.query(
    'SELECT id, name, email, password_hash, default_currency FROM users WHERE email = $1',
    [email]
  )
  return result.rows[0] ?? null
}

// For "who is this token for?". No password_hash: nothing that only needs to
// know who you are should ever load it.
export async function findById(pool, id) {
  const result = await pool.query(
    'SELECT id, name, email, default_currency FROM users WHERE id = $1',
    [id]
  )
  return result.rows[0] ?? null
}

// Throws a Postgres error with code '23505' if the email is already taken;
// the route turns that into a 409.
export async function create(pool, { name, email, passwordHash }) {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, default_currency`,
    [name, email, passwordHash]
  )
  return result.rows[0]
}

// Only for checking a password the user just typed (change password, delete
// account). Returns the hash or null.
export async function getPasswordHash(pool, id) {
  const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [id])
  return result.rows[0]?.password_hash ?? null
}

export async function updateProfile(pool, id, { name, defaultCurrency }) {
  const result = await pool.query(
    `UPDATE users SET name = $2, default_currency = $3
     WHERE id = $1
     RETURNING id, name, email, default_currency`,
    [id, name, defaultCurrency]
  )
  return result.rows[0] ?? null
}

export async function updatePasswordHash(pool, id, passwordHash) {
  await pool.query('UPDATE users SET password_hash = $2 WHERE id = $1', [id, passwordHash])
}

// Their subscriptions go with them: ON DELETE CASCADE in schema.sql.
export async function remove(pool, id) {
  const result = await pool.query('DELETE FROM users WHERE id = $1', [id])
  return result.rowCount > 0
}
