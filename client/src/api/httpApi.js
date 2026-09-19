// The real client. Every function here talks to YOUR Express API.
//
// This is the file that matters for your finals project. mockApi.js exists so
// you can build the interface before this has anywhere to point.

const BASE = import.meta.env.VITE_API_BASE_URL || ''

async function request(path, options) {
  const response = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    // Try to use the API's own message; fall back to the status line.
    let message = `${response.status} ${response.statusText}`
    try {
      const body = await response.json()
      if (body?.error) message = body.error
    } catch {
      // The body was not JSON. The status line is all we have.
    }
    throw new Error(message)
  }

  return response.status === 204 ? null : response.json()
}

export const listSightings = () => request('/api/sightings')

export const getSighting = (id) => request(`/api/sightings/${id}`)

export const createSighting = (input) =>
  request('/api/sightings', { method: 'POST', body: JSON.stringify(input) })

export const updateSighting = (id, input) =>
  request(`/api/sightings/${id}`, { method: 'PUT', body: JSON.stringify(input) })

export const deleteSighting = (id) =>
  request(`/api/sightings/${id}`, { method: 'DELETE' })
