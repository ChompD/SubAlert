import { useEffect, useState } from 'react'
import { listSightings, createSighting, deleteSighting } from './api'
import DemoNotice from './components/DemoNotice.jsx'

// A deliberately small working app. Replace all of it with your own project.
//
// What is worth keeping is the SHAPE: four states rather than two, a loading
// message that admits a free-tier server can be slow to wake, and errors that
// say something rather than rendering an empty list.

const EMPTY_FORM = { place: '', description: '', spookiness: 3 }

export default function App() {
  const [status, setStatus] = useState('loading')   // loading | ready | error
  const [rows, setRows] = useState([])
  const [error, setError] = useState(null)
  const [slow, setSlow] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  async function load() {
    setStatus('loading')
    setError(null)

    // A free-tier API sleeps. If this is taking a while, say so rather than
    // spinning silently, which looks broken. See page 6.
    const timer = setTimeout(() => setSlow(true), 3000)

    try {
      setRows(await listSightings())
      setStatus('ready')
    } catch (caught) {
      setError(caught)
      setStatus('error')
    } finally {
      clearTimeout(timer)
      setSlow(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.place.trim()) return

    setSaving(true)
    try {
      const created = await createSighting({
        place: form.place.trim(),
        description: form.description.trim(),
        spookiness: Number(form.spookiness),
      })
      setRows([created, ...rows])
      setForm(EMPTY_FORM)
    } catch (caught) {
      setError(caught)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    const previous = rows
    setRows(rows.filter((row) => row.id !== id))   // optimistic
    try {
      await deleteSighting(id)
    } catch (caught) {
      setRows(previous)                            // put it back on failure
      setError(caught)
    }
  }

  return (
    <div className="page">
      <header>
        <h1>HAUnted Sightings</h1>
        <p className="lede">
          Replace this with your own project. This one is here so the template
          has something that works.
        </p>
      </header>

      <DemoNotice />

      {error && (
        <p className="error" role="alert">
          {error.message} <button onClick={load}>Try again</button>
        </p>
      )}

      <form onSubmit={handleSubmit} className="card">
        <h2>Report a sighting</h2>

        <label htmlFor="place">Place</label>
        <input
          id="place"
          value={form.place}
          onChange={(event) => setForm({ ...form, place: event.target.value })}
          maxLength={120}
          required
        />

        <label htmlFor="description">What happened</label>
        <textarea
          id="description"
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          maxLength={2000}
          rows={3}
        />

        <label htmlFor="spookiness">Spookiness, 1 to 5</label>
        <input
          id="spookiness"
          type="number"
          min="1"
          max="5"
          value={form.spookiness}
          onChange={(event) => setForm({ ...form, spookiness: event.target.value })}
          required
        />

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Add sighting'}
        </button>
      </form>

      {/* Four states. Empty and error are different things and must not look
          the same: an empty list means "nothing here yet", an error means
          "we could not find out". */}
      {status === 'loading' && (
        <p className="muted">
          Loading{slow ? '. The server may be waking up, which can take up to a minute.' : '...'}
        </p>
      )}

      {status === 'ready' && rows.length === 0 && (
        <p className="muted">No sightings reported yet. Add the first one above.</p>
      )}

      {status === 'ready' && rows.length > 0 && (
        <ul className="list">
          {rows.map((row) => (
            <li key={row.id} className="card">
              <div className="row-head">
                <h3>{row.place}</h3>
                <span className="spooky" aria-label={`Spookiness ${row.spookiness} of 5`}>
                  {'*'.repeat(row.spookiness)}
                </span>
              </div>
              {row.description
                ? <p>{row.description}</p>
                : <p className="muted">No description given.</p>}
              <footer>
                <time dateTime={row.reported_at}>
                  {new Date(row.reported_at).toLocaleString()}
                </time>
                <button onClick={() => handleDelete(row.id)}>Delete</button>
              </footer>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
