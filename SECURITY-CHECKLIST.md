# Security checklist — SubTrack (formerly SubAlert)

First filled in on 23 September 2026. Updated on 27 September 2026, after the
API and the database went live, and on 11 October 2026, after the security and
bug check, the rename to SubTrack, and a fresh dependency audit.

Repository: https://github.com/ChompD/SubAlert
Live site: https://sub-track-chompd.vercel.app

**Where the project stands:** the app is live. The React client and the Express
API are one Vercel project, and accounts and subscriptions are stored in
PostgreSQL on Supabase. Demo mode is switched off on the live site. Every row
below was checked again on 11 October 2026.

## Secrets and credentials

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 1 | `.env` is gitignored and is not in the repository | Yes | `.gitignore` line 2 is `.env`, and `git check-ignore -v client/.env server/.env` confirms both are ignored. On 11 October `git ls-files` listed no `.env`, `.pem` or `.key` file. |
| 2 | A `.env.example` with placeholder values only is committed | Yes | Two are committed, `client/.env.example` and `server/.env.example` (the root one went with the unused Docker files on 3 October). The server one reads `DATABASE_URL=postgresql://subtrack_app.YOUR_PROJECT_REF:YOUR_APP_PASSWORD@…`, `DATABASE_ADMIN_URL=postgresql://postgres.YOUR_PROJECT_REF:YOUR_DB_PASSWORD@…` and `JWT_SECRET=REPLACE_WITH_A_LONG_RANDOM_STRING`: placeholders, not values. |
| 3 | No connection string, key, token or password is hardcoded in source, comments or commented-out code | Yes | On 11 October every tracked file was searched for the real database password and the real `JWT_SECRET` (read from `server/.env` without printing them): not found. The server reads both from `process.env` only, and refuses to start if either is missing. |
| 4 | Git history is clean: I searched `git log -p` for password, secret, api key and `postgres://` | Yes | On 11 October the whole history (`git log -p --all`) was searched for the current database password, the current `JWT_SECRET` and the old database password: none appear, and there are 0 JWT-shaped tokens. The only connection string with a real host is the placeholder above. |
| 5 | Any credential that was ever committed has been rotated | Yes | Nothing was ever committed. But on 27 September the database password and a `JWT_SECRET` were visible in a screenshot while I was filling in Vercel's settings, so both were replaced before anything was saved: a new database password in Supabase and a newly generated `JWT_SECRET`. |
| 6 | Production credentials live only in my hosting provider's environment settings | Yes | `DATABASE_URL` and `JWT_SECRET` are set in Vercel as **Sensitive** variables (shown as "Secret"; Production and Preview), so not even the dashboard can show them again. They are not in the repository. My laptop uses a different `JWT_SECRET` from the live site. |

## GitHub Actions

The repository has **no workflows**. The old GitHub Pages workflow was deleted
on 3 October 2026 (commit `9c45e5a`), because the site is deployed by Vercel,
which builds straight from the repository and keeps its secrets in its own
settings (row 6). `git ls-files .github` is empty.

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 7 | No secret value is written literally in any workflow YAML file | N/A | There are no workflow files since 3 October (`9c45e5a`). The one that existed before never held a secret: its only values were `${{ vars.VITE_USE_MOCK_API }}` and `${{ vars.VITE_API_BASE_URL }}`. |
| 8 | Secrets are stored in repository Actions secrets and read with `${{ secrets.NAME }}` | N/A | No workflows, so no Actions secrets are needed. The live secrets are in Vercel's settings (row 6). |
| 9 | No workflow step echoes, dumps or debug-prints a secret, and I opened a recent run's log to confirm | N/A | No workflows exist now. The old GitHub Pages workflow was removed on 3 October (`9c45e5a`); its 44 old runs are still listed under Actions, and their logs only show `ready=true/false` and notices about Pages (checked 27 September). No secret was ever used in them. |
| 10 | Uploaded build artifacts contain no `.env`, key file or generated config | N/A | No workflow uploads artifacts now. The old Pages runs only uploaded `client/dist`, never `.env`. Vercel builds `client/` itself, and `.env` files are gitignored (row 1), so they never reach its build. |
| 11 | Third-party actions are pinned to a commit SHA, not a moveable tag | N/A | No workflows, so no third-party actions are used. The old workflow's tag-pinned actions were removed with it on 3 October (`9c45e5a`). |
| 12 | Secret scanning and push protection are enabled on the repository | Yes | Both are switched on in GitHub → Settings → Code security, which is free for public repositories. |

## Database

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 13 | Every query taking user input uses parameters, never string concatenation | Yes | Every query in `server/usersRepo.js`, `server/subscriptionsRepo.js` and `server/app.js` passes values in the array (`$1`, `$2`). The only `${...}` inside SQL is `COLUMNS`, a fixed list of column names written in the file, never user input. Tested on 2 October: an id that isn't a UUID gets a clean 404, and an HTML name is stored as plain text. |
| 14 | The database is not open to the whole internet, or is reachable only by the app | No | Supabase accepts connections from any IP address. What protects it is the database password and an encrypted (TLS) connection. Supabase's Network Restrictions could limit it to known addresses, but Vercel's servers don't have fixed addresses on the free plans, so that isn't practical here. |
| 15 | The database user the app connects as has only the permissions it needs | Yes | Since 11 October the API connects as `subtrack_app`, its own database user, made in `server/db/schema.sql`. It has only `SELECT`, `INSERT`, `UPDATE` and `DELETE` on `users` and `subscriptions`: no `TRUNCATE`, it can't create, change or drop tables or create other users, and it doesn't skip RLS. Checked with `has_table_privilege` and by trying `CREATE TABLE` and `ALTER TABLE` as it (both refused), and in Supabase's `pg_stat_activity`: the live site's queries now run as `subtrack_app`. Its password is only in my `server/.env` and in Vercel. `postgres`, which owns the tables, is used only by `npm run db:schema` on my laptop (`DATABASE_ADMIN_URL`), never by the live site. |
| 16 | Seed and sample data is invented, not real people's data | Yes | There is no seed data: `seed.sql` deliberately inserts nothing, so no sample password sits in a public repository. Every test account made while building and testing was deleted again, which was checked in the database afterwards. |
| 17 | Debug, seed and reset routes are removed before going public | Yes | None exist. The API's only routes without a login are `/healthz` and `/readyz` (which answer only "up" or "down"), register and log in. The template's example routes were deleted. `/styleguide` is left out of the production build. |

## Access control

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 18 | The app has an access layer: Cloudflare Zero Trust, an app-level password, or a real login | Yes | A real login, enforced by the server: passwords hashed with bcrypt, a signed token (JWT, 7 days, algorithm pinned) checked on every personal route, and login limits: 10 wrong passwords per email and 50 per network every 15 minutes, and 10 wrong tries per account for changing the password or deleting the account (commit `0037672`). |
| 19 | If Supabase or Firebase: Row Level Security or security rules are on, and I tested it signed out | Yes | RLS is on for both tables. The only policies are for `subtrack_app`, the API's own user (row 15); `anon` and `authenticated` have none, so Supabase's public API can read and change nothing. Since 3 October (`d85fd05`) Supabase's public roles also have no privileges on the tables at all, including `TRUNCATE`, which RLS doesn't cover. Checked on 11 October: `relrowsecurity = true` for both tables, no policies for anyone but `subtrack_app`, and `anon` and `authenticated` have no `SELECT` or `TRUNCATE`. |
| 20 | If Zero Trust: tjakoen.s@gmail.com is on the access policy. If an app password: the credentials are in my private workspace `project/README.md` | N/A | Neither is used: anyone can register their own account. So the teacher can see a filled-in account, a demo account's login goes in my private workspace `project/README.md`, never in the repository. |
| 21 | The gate covers every route, including the ones that only change data | Yes | Every route that reads or changes data runs `requireAuth` first (`server/app.js`): `/api/auth/me` (read, change, delete), `/api/auth/password` and all of `/api/subscriptions`. The only routes without it are `/healthz`, `/readyz`, register and log in. `requireAuth` also rejects the token of an account that has been deleted, and a session that has ended logs the app out (`74a6187`). |
| 22 | The credentials for the gate are environment variables, not in source | Yes | The only credential is `JWT_SECRET`, which signs the tokens: `.env` on my laptop and a Sensitive variable in Vercel (row 6). The server stops at startup if it's missing. |

## Input and output

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 23 | Input from the user is validated on the server, not only in the browser | Yes | `server/subscriptionRules.js` checks every subscription field, including end dates between 2000 and 2100, and `server/app.js` checks names, emails and passwords, with the password limit counted in bytes the same way as the form (`72bd60c`). The database checks again with its own constraints. Fields a user may not set, such as `user_id`, are ignored. |
| 24 | User-supplied text is escaped when rendered, so it cannot inject markup or script | Yes | React escapes text by default, and `dangerouslySetInnerHTML` and `innerHTML` appear nowhere in the client. Tested on 2 October: a subscription named `<img src=x onerror=alert(1)>` is shown as plain text. |
| 25 | Error responses do not expose stack traces, file paths or connection details | Yes | Server errors answer `{ error: 'Something went wrong on the server' }`. Broken JSON gets a 400 and an oversized request a 413, and only the kind of error is logged, never the request body (which on log in would hold a password). |
| 26 | CORS is not a wildcard on routes that change data | Yes | `cors({ origin: allowedOrigins })` reads a named list from `CORS_ORIGINS`, never `*`. Tested on 2 October: a request from another site's origin gets no `Access-Control-Allow-Origin` header. The site and the API also share one address (`sub-track-chompd.vercel.app`), so the app itself makes no cross-site requests. |

## Repository and privacy

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 27 | No student number, personal email, phone number or home address in the repository or in commit messages | No | The files are clean, and every commit since 26 September (50 so far) uses GitHub's no-reply address. The 28 commits before that still carry my personal Gmail; removing it would mean rewriting the history of a graded repository, so I've left it. My GitHub profile name also shows beside the repository's contributors. |
| 28 | No classmate's personal data in the repository | Yes | None anywhere. Test accounts were invented and deleted. The screenshots in `docs/assets/` use invented sample data in demo mode. |
| 29 | Dependencies come from official registries, and `node_modules` is gitignored | Yes | All from npm, recorded in the two `package-lock.json` files, and `node_modules/` is in `.gitignore`. On 11 October `npm audit` found 1 critical issue in the server (`proxy-addr`, inside Express) and 1 high in the client (`source-map-js`, used only while building); `npm audit fix` updated both, and both now report 0 vulnerabilities. |
| 30 | Images, fonts and other assets are mine, licensed, or credited | Yes | The SubTrack logo (and the tab and iPhone icons made from it) was drawn by my girlfriend for this app, and is credited in `AI-USAGE.md` and `docs/02-mockup.md`. The screenshots, wireframes and design system PDF in `docs/assets/` are my own. Icons come from `lucide-react` (ISC licence), and Inter from Google Fonts (SIL Open Font License). |
| 31 | Repository visibility is deliberate, and I checked it after my last push | Yes | Checked through the GitHub API on 11 October: `"visibility": "public"`, which it needs to be for grading. |

## Anything I found and fixed

**Found and fixed, 27 September:**

- **Secrets in a screenshot.** The database password and a token secret were
  visible in a screenshot of Vercel's settings. Both were replaced before
  anything was saved (row 5).
- **Passwords could have reached the logs.** A login request with broken JSON
  made the server log the raw request, password included. It now answers 400
  and logs only the kind of error.
- **Deleted accounts kept working.** A deleted account's token was still validly
  signed and was accepted. `requireAuth` now checks that the account still
  exists.
- **Personal email in commits.** New commits use the GitHub no-reply address
  (row 27).
- **Security headers and dependencies.** Added `helmet`, and cleared 3 moderate
  `npm audit` findings.

**Found and fixed, 3 October** (a full security and bug check):

- **Supabase's public roles could still empty the tables.** They had every
  privilege, including `TRUNCATE`, which RLS doesn't cover. Revoked in
  `schema.sql` after a dry run that was undone (`d85fd05`, row 19).
- **One login limit for everything.** Register, log in, password change and
  account deletion shared one count of 10 per network, counting correct logins
  too, so a classroom on one Wi-Fi could lock itself out. Split into separate
  limits (`0037672`, row 18).
- **An ended session left the page stuck.** The app now logs you out and sends
  you to Log in (`74a6187`, row 21).
- **Any date and inconsistent password limits were accepted.** End dates are now
  limited to 2000–2100, and the password limit is counted in bytes on both
  sides (`72bd60c`, row 23).
- **The old GitHub Pages workflow** was removed, with its tag-pinned actions
  (`9c45e5a`, rows 7–11), along with the unused Docker files (`9db9f79`).

**Found and fixed, 11 October:**

- **Two new dependency advisories** (`proxy-addr` in the server, `source-map-js`
  in the client), fixed with `npm audit fix` (row 29).
- **The app's database user could do too much.** The API connected as
  `postgres`, which owns the tables. It now connects as `subtrack_app`, which
  can only read and write rows (row 15).

**Found, not fixed:**

- **The database is reachable from any address** (row 14). Restricting it needs
  fixed server addresses, which Vercel's free plan doesn't have.
- **The 28 older commits** still carry my personal email (row 27).
- **Two limits of the login system.** The login limits are counted per server
  copy on Vercel, so they are not exact; and changing a password doesn't log out
  other devices until their tokens expire (7 days).
