// Starts the API on your laptop: npm run dev (or npm start).
//
// On Vercel this file is not used. Vercel runs ../api/index.js instead, which
// takes the same app from app.js, so both run exactly the same routes.
import app, { allowedOrigins } from './app.js'

// The host chooses the port and tells you through PORT. Hardcoding 3000 is the
// commonest reason a first deploy is marked unhealthy and killed.
const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
  console.log(`CORS allows: ${allowedOrigins.join(', ')}`)
})
