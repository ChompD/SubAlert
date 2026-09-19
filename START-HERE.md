# Start here

You have just made your own copy of this template. This file is the first hour.
Delete it once you have worked through it.

## What you have

A working full-stack application, small on purpose, that you are going to replace
with your own.

```
client/     React, built by Vite. Deploys to GitHub Pages already.
server/     Express and PostgreSQL. Deploys nowhere yet: that is your job.
docs/       where your planning documents and weekly reports go
```

**It runs right now, with no database and no server**, because the client ships
pointing at a simulated backend. That is deliberate: it means your repository has
a live link on day one, and it means you can build your interface in week one
without waiting on a deployment.

It is also **not** a finished project. Your finals submission is the React
client, your Express API and your PostgreSQL database, all three deployed and
reachable from a link. Read
`content/extending-your-app/03-demo-mode-in-the-template.md` in your course
workspace before you decide otherwise.

## The first hour

### 1. Make it yours

- [ ] **Rename the repository** to your app's name. This is your repository, in
      your own account, so there is no `classcode-yourname` convention this time.
- [ ] Put your name in `LICENSE`.
- [ ] Replace `README.md` with your own. Keep the shape; change everything else.
- [ ] Change the `<title>` and description in `client/index.html`.
- [ ] Delete this file when you are finished with it.

### 2. Run it

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173. Add a sighting, reload, see it persist. That data is
in your browser's `localStorage`, nowhere else.

### 3. Deploy it, today

Do not save this for December. Every deployment problem is twenty minutes now and
a lost night the week before the deadline.

- [ ] **Settings > General > Danger Zone:** make the repository **public**.
      GitHub Pages will not serve a private repository on a free account.
- [ ] **Settings > Pages > Build and deployment > Source: GitHub Actions.**
      Miss this and the workflow runs green and publishes nothing.
- [ ] You do not need to set any repository variable yet. Demo mode is the
      default, so a fresh copy deploys into a working site on its own.
- [ ] Push to `main`. Watch the Actions tab. The deploy job prints your URL.
- [ ] Open that URL **in a private browsing window**, on your phone as well as
      your laptop.

You now have a live link. Put it at the top of your README.

### 4. Link it to your workspace

Your project repository is public and carries **no `student.json`** and nothing
else that identifies you. The private pointer that connects it to you for
grading lives in your **workspace** repository. Create `project/README.md` there:

```markdown
# My final project

**Repository:** https://github.com/yourusername/your-repo-name
**Live site:** https://yourusername.github.io/your-repo-name/
**API:** https://your-api.onrender.com/healthz
```

Without this, your project is a repository nobody can connect to a student. Do it
the day the repository exists.

## The rest of the term

### Week one to two: make the interface yours

Work entirely in `client/`, in demo mode. Change `src/api/mockApi.js` and
`src/api/seed.json` to hold your data rather than ghost sightings, and rebuild
`App.jsx` into your actual screens.

**Keep the shape of `src/api/`.** One interface, two implementations, chosen by a
variable. It is what makes the switch to your real API a one-line change instead
of a rewrite. Whatever functions you end up with, make sure both files provide
all of them.

### Week two to three: a real database

Read `content/extending-your-app/04-running-postgres-for-real.md`. Every test you
passed in Module 5 ran against `pg-mem`, an imitation, so there is a good chance
you have never actually run PostgreSQL. Close that gap early, because everything
afterwards assumes it.

```bash
cd server
npm install
cp .env.example .env
npm run db:reset      # creates your tables, adds sample rows
npm run dev
curl http://localhost:3000/readyz
```

Edit `db/schema.sql` to be your schema, and `sightingsRepo.js` to be your
queries. Keep every query parameterised.

### Week three to four: get all three online

Pages 5 to 10 of the extending unit. Pick a database host, pick an API host,
deploy both, then flip the client:

- `VITE_USE_MOCK_API` to `false`
- `VITE_API_BASE_URL` to your API's URL
- `CORS_ORIGINS` on the API to your Pages origin

Rebuild the client, because those values are compiled in at build time. The demo
notice disappears by itself.

### The rest of the term: build your project

One new thing at a time. Working, committed, deployed, then the next one.

## Things that will catch you

| Symptom | Cause |
| --- | --- |
| Blank white page on Pages, 404s on the JavaScript | the base path. The workflow sets it; do not hardcode it |
| Refreshing a nested route gives 404 | `404.html`. The build already copies it; do not remove that step |
| Live site still shows demo data after deploying the API | you changed a variable but did not **rebuild** |
| `CORS policy` in the console | `CORS_ORIGINS` on the API does not name your Pages origin exactly. An origin has no path and no trailing slash |
| First request takes 45 seconds | your free-tier API was asleep. Expected. Say so in the interface |
| `DATABASE_URL is not set` | you set it locally and not in the host's dashboard |
| Deploy fails on an import that obviously exists | capitalisation. The runner is Linux and your laptop probably is not |

## The one rule

**Never commit a secret.** This repository is public, in your own account, and
permanent, and deleting a file does not remove it from the history. Keys,
passwords and connection strings go in `.env`, which is git-ignored, and in your
host's dashboard. If you ever commit one, rotate it first and clean up second.

Page 16 of the extending unit is the full version, and it is worth ten minutes
before your first push.
