// Vercel runs this for every /api/... request, plus /healthz and /readyz
// (see ../vercel.json). It hands the request to the same Express app that
// runs on your laptop, so the routes, checks and database code are identical.
import app from '../server/app.js'

export default app
