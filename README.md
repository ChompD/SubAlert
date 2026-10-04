# SubTrack

Track your subscriptions and free trials in one list, see what's about to
charge you, and decide to keep or cancel each one before you pay.

**Live site:** https://sub-alert-eight.vercel.app
**API health check:** https://sub-alert-eight.vercel.app/healthz
**Demo video:** https://drive.google.com/drive/folders/1O0SaVj9BNOJGTlp1Xd3Gcuxjwbqzy9kG?usp=sharing

[![Built with AI: Claude](https://img.shields.io/badge/built%20with%20AI-Claude-0E6E5C)](AI-USAGE.md)

> **Built with AI.** Most of this project was written with **Claude (Anthropic),
> through Claude Code**. What I asked for, what it got wrong, and who wrote what
> is in **[AI-USAGE.md](AI-USAGE.md)**.

> SubTrack was called SubAlert until October 2026, which is why the repository
> and the web address still say SubAlert.

## What it does

- **Accounts:** register and log in; every subscription is private to its account.
- **Subscriptions:** add, edit and delete them, with price, billing cycle
  (weekly, monthly, every 3 months, yearly), end date, an icon, "Paid with"
  (GCash, a bank, a card type — never a card number) and a note.
- **Decide:** mark each one Keep, Cancel or Undecided with one tap. Kept ones
  roll forward to their next charge date instead of ending.
- **Dashboard:** a "Due this week" banner with the total, what's due in the next
  48 hours, how many are active, and how much you save each month from the ones
  you're cancelling. Search, filter and sort, kept in the address so a reload
  keeps them.
- **Analytics:** what you pay per month and per year, your savings, your most
  expensive subscription, and a 12-month forecast of real charge dates, with a
  table view for every chart.
- **Account:** change your name, currency and password, or delete your account
  and everything in it.
- **Works everywhere:** phone layout with a bottom navigation bar, dark mode, and
  keyboard and screen-reader support.

## Built with

| Part | What |
| --- | --- |
| Front end | React 18, Vite, React Router, CSS Modules, Lucide icons |
| Back end | Express 4 on Node 20, `pg`, bcryptjs, jsonwebtoken, helmet, express-rate-limit |
| Database | PostgreSQL on Supabase |
| Hosting | Vercel: one project serves the React site and runs the Express API |

## Architecture

    Browser ── React (built by Vite) ─┐
                                      │  https://sub-alert-eight.vercel.app
                         Vercel ──────┤
                                      │  /api/*, /healthz, /readyz
                                      └─ Express (api/index.js → server/app.js)
                                                   │  SQL over TLS
                                                   └─ PostgreSQL (Supabase)

One Vercel project does both jobs. It serves the built React site, and sends
every `/api/...` request to the Express app, which Vercel runs as a serverless
function. Express is the only thing that talks to the database: Row Level
Security is on and Supabase's public roles have no access, so the data can only
be reached through the API, with its login check and an ownership check in
every query.

## API

Every route except register and log in needs an `Authorization: Bearer <token>`
header. A user only ever sees and changes their own subscriptions.

| Method | Route | What it does |
| --- | --- | --- |
| POST | `/api/auth/register` | create an account, returns a token |
| POST | `/api/auth/login` | log in, returns a token |
| GET | `/api/auth/me` | who is logged in |
| PATCH | `/api/auth/me` | change name and currency |
| POST | `/api/auth/password` | change password (needs the current one) |
| DELETE | `/api/auth/me` | delete the account and its subscriptions |
| GET | `/api/subscriptions` | your subscriptions, soonest first |
| GET | `/api/subscriptions/:id` | one subscription |
| POST | `/api/subscriptions` | add one |
| PATCH | `/api/subscriptions/:id` | change one (only the fields sent) |
| DELETE | `/api/subscriptions/:id` | delete one |
| GET | `/healthz` | is the API running |
| GET | `/readyz` | can the API reach the database |

## Security

- Passwords are stored only as **bcrypt** hashes. Login gives the same answer
  for a wrong email and a wrong password.
- Logins are **JWT** tokens, valid for 7 days, with the signing method pinned.
- Every query is **parameterised**, and every subscription query includes
  `AND user_id = $n`, so nobody can read or change another account's data.
- The server checks every field again (the browser can be bypassed), and the
  database has the same limits as a last line.
- **Rate limits** on log in, register, password change and account deletion.
- **helmet** security headers, CORS limited to named origins.
- Row Level Security on both tables, and no table access for Supabase's public
  roles.

More in [docs/06-security-and-privacy.md](docs/06-security-and-privacy.md).

## Demo mode

The client can run without any server. One variable, set when the client is
**built**, decides:

| `VITE_USE_MOCK_API` | What happens |
| --- | --- |
| unset, or `true` | Demo mode: accounts and subscriptions are kept in your browser (`localStorage`). No server, nothing shared between visitors, and a notice says so. |
| `false` | The client calls the Express API. **The live site uses this.** |

Both modes use the same functions (`client/src/api/`), so switching is one
variable, not a rewrite.

## Running it yourself

**Just the client, in demo mode.** No database needed.

    cd client
    npm install
    copy .env.example .env      # leave VITE_USE_MOCK_API=true
    npm run dev                 # http://localhost:5173

**The whole app.** Needs a PostgreSQL database: a free Supabase project, or one
on your own computer.

    # 1. the API
    cd server
    npm install
    copy .env.example .env      # fill in DATABASE_URL and JWT_SECRET
    npm run db:schema           # creates the tables
    npm run dev                 # http://localhost:3000

    # 2. the client, in a second terminal
    cd client
    npm install
    copy .env.example .env      # set VITE_USE_MOCK_API=false
    npm run dev

Check the API on its own first:

    curl http://localhost:3000/healthz     # is it running
    curl http://localhost:3000/readyz      # can it reach the database

## Environment variables

None of these are committed. Each folder's `.env.example` lists them with
placeholder values.

| Name | Where | What it is |
| --- | --- | --- |
| `DATABASE_URL` | server | PostgreSQL connection string. Contains a password |
| `JWT_SECRET` | server | signs the login tokens. Long, random, never shared |
| `CORS_ORIGINS` | server | the website addresses allowed to call the API |
| `NODE_ENV` | server, locally | `development`. **Don't set it on Vercel**: Vercel sets it, and setting it yourself breaks the build |
| `VITE_USE_MOCK_API` | client, at build time | only `false` turns demo mode off |
| `VITE_API_BASE_URL` | client, at build time | the API's address. Leave empty on Vercel, where the API is on the same address |

Every `VITE_` value is built into the website's JavaScript and is **public**.
Never put a password or key in one.

## Deploying

Everything is one **Vercel** project, configured by `vercel.json`:

1. Import the repository into Vercel. `vercel.json` already tells it to build
   `client/` and send `/api/*`, `/healthz` and `/readyz` to Express.
2. In the Vercel dashboard, set `DATABASE_URL` (Supabase's **Transaction
   pooler**, port 6543), `JWT_SECRET`, `CORS_ORIGINS` and
   `VITE_USE_MOCK_API=false`.
3. Run `npm run db:schema` in `server/` once against the Supabase database.
4. Push to `main`. Vercel builds and deploys by itself.

## Project structure

    api/           index.js: the entry point Vercel runs, which loads server/app.js
    client/        React front end, built by Vite
      src/api/     one set of API functions, two versions (demo and real)
      src/pages/   Dashboard, Analytics, Add/Edit, Account, Log in, Register
      src/utils/   dates, money, the roll-forward schedule, analytics
    server/        Express API
      app.js       every route
      db/          schema.sql, the connection pool, and a runner for SQL files
    docs/          planning documents and reports
    vercel.json    builds the site and routes the API on Vercel

## What I would do next

- **Email reminders** a few days before a charge, so you don't have to open the
  app to find out.
- **A safer login:** keep the token in an httpOnly cookie instead of the browser's
  storage, and log out other devices when the password changes.

## Author
· Dexter Christian C. Toribio 
· https://github.com/ChompD 
· CS-401 

## Licence

MIT, see [LICENSE](LICENSE).