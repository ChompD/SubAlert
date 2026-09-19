// The data-access layer, the same shape as m5a3.
//
// Every query is parameterised: values go in the array, never into the string.
// This is the single most important habit in database code, and it is what
// stops "'; DROP TABLE sightings; --" in a form field from being a real
// problem.

export async function getAll(pool) {
  const result = await pool.query(
    'SELECT * FROM sightings ORDER BY reported_at DESC'
  )
  return result.rows
}

export async function getById(pool, id) {
  const result = await pool.query('SELECT * FROM sightings WHERE id = $1', [id])
  return result.rows[0] ?? null
}

export async function create(pool, { place, description, spookiness }) {
  const result = await pool.query(
    `INSERT INTO sightings (place, description, spookiness)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [place, description ?? '', spookiness]
  )
  return result.rows[0]
}

export async function update(pool, id, { place, description, spookiness }) {
  const result = await pool.query(
    `UPDATE sightings
     SET place = $1, description = $2, spookiness = $3
     WHERE id = $4
     RETURNING *`,
    [place, description ?? '', spookiness, id]
  )
  return result.rows[0] ?? null
}

export async function remove(pool, id) {
  const result = await pool.query(
    'DELETE FROM sightings WHERE id = $1 RETURNING id',
    [id]
  )
  return result.rowCount > 0
}
