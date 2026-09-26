// The data-access layer for subscriptions.
//
// Every query has "user_id = $n" in it. That is the ownership check, and it
// lives IN the query rather than in an if above it: a row that belongs to
// somebody else is simply never found, so there is nothing to forget to check.

// A fixed list written here, never anything a user sent, so it is safe to put
// in the SQL text. Values from the request always go in the $1, $2 array.
const COLUMNS = 'id, name, price, currency, frequency, end_date, status, icon, color, note'

// The shape the client gets, the same one client/src/api/mockApi.js returns.
export function toPublicSubscription(row) {
  return {
    id: row.id,
    name: row.name,
    // NUMERIC arrives as the string "549.00" so no precision is lost on the
    // way; the client does arithmetic with it, so it gets a number.
    price: Number(row.price),
    currency: row.currency,
    frequency: row.frequency,
    endDate: row.end_date,
    status: row.status,
    icon: row.icon,
    color: row.color,
    note: row.note,
  }
}

// Soonest first, the Dashboard's default order. Served by the
// (user_id, end_date) index in schema.sql.
export async function listForUser(pool, userId) {
  const result = await pool.query(
    `SELECT ${COLUMNS} FROM subscriptions WHERE user_id = $1 ORDER BY end_date, name`,
    [userId]
  )
  return result.rows
}

export async function getForUser(pool, id, userId) {
  const result = await pool.query(
    `SELECT ${COLUMNS} FROM subscriptions WHERE id = $1 AND user_id = $2`,
    [id, userId]
  )
  return result.rows[0] ?? null
}

// userId comes from the login token, never from the request body.
export async function createForUser(pool, userId, s) {
  const result = await pool.query(
    `INSERT INTO subscriptions (user_id, name, price, currency, frequency, end_date, status, icon, color, note)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING ${COLUMNS}`,
    [userId, s.name, s.price, s.currency, s.frequency, s.endDate, s.status, s.icon, s.color, s.note]
  )
  return result.rows[0]
}

// Writes every field. The route has already merged the change into the saved
// row and validated the result. Returns null if the row isn't this user's.
export async function updateForUser(pool, id, userId, s) {
  const result = await pool.query(
    `UPDATE subscriptions
     SET name = $3, price = $4, currency = $5, frequency = $6, end_date = $7,
         status = $8, icon = $9, color = $10, note = $11
     WHERE id = $1 AND user_id = $2
     RETURNING ${COLUMNS}`,
    [id, userId, s.name, s.price, s.currency, s.frequency, s.endDate, s.status, s.icon, s.color, s.note]
  )
  return result.rows[0] ?? null
}

// True if something was deleted, false if there was nothing of theirs to delete.
export async function removeForUser(pool, id, userId) {
  const result = await pool.query('DELETE FROM subscriptions WHERE id = $1 AND user_id = $2', [id, userId])
  return result.rowCount > 0
}
