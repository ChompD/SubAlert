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
