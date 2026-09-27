# Weekly Increment Report

## Week of: September 19–23, 2026

## What changed this week

This was the first week of building, so the whole client went from the template
to a working app. 18 commits.

**Setup and design system**

- Replaced the template's sighting app with SubAlert: new title, the Inter
  font, and `src/styles/tokens.css` holding every colour, font size and space
  from my design system as CSS variables.
- Added React Router with five routes: `/`, `/add`, `/edit/:id`, `/login` and
  `/register`, plus a dev-only `/styleguide` page that shows every component in
  one place (it is left out of the production build).
- Built the components from my wireframes, sorted into atoms, molecules and
  organisms: `Button`, `Badge`, `Pill`, `ServiceIcon`, `FormField`,
  `SelectField`, `TextAreaField`, `DecisionToggle`, `SummaryCard`, `UserMenu`,
  `SubscriptionRow`, `SearchBar`, `IconPicker`, `Header`, `Footer`, `AuthCard`,
  `FilterBar`, `SubscriptionDetails`.

**Accounts**

- Log in and Register pages with their own validation (required fields, email
  format, password of at least 8 characters, passwords must match), error
  messages under each field, and the cursor jumping to the first problem.
- `AuthContext` holds who is logged in; `ProtectedRoute` sends logged-out
  visitors to `/login` and remembers where they were going; `GuestRoute` sends
  logged-in users away from the login pages.
- A user menu in the header with the signed-in email and Log out.

**Subscriptions**

- Dashboard with three summary cards (ending in 48h, active, saved by
  cancelling), the list sorted by end date, and Urgent / Soon badges worked out
  from the end date on every render, never stored.
- Add, Edit and Delete. Add and Edit are one page (`SubscriptionFormPage`) used
  by two routes, so the two screens cannot drift apart. Delete asks for
  confirmation first.
- Keep / Cancel toggle on each row that saves straight away, and puts the old
  value back if saving fails.
- Search, filter pills with counts (All, Ending soon, Keep, Cancel, Undecided)
  and sorting (end date, name, price). These live in the URL
  (`/?q=net&filter=keep&sort=name`), so a reload keeps them and Back undoes a
  change.
- Currency picker (9 currencies) with each price shown in its own currency.
- Billing frequency (weekly, monthly, every 3 months, yearly). "Saved by
  cancelling" adds everything up per month, so a yearly plan counts as a
  twelfth of its price.
- An icon and colour for each subscription (17 icons, 6 colours, from Lucide).
- An optional note, up to 500 characters, with a live counter.
- Tapping a subscription opens a details pop-up with its dates, price per
  month, decision and note. It uses the browser's own `<dialog>`, so Escape
  closes it and focus stays inside.
- Renamed "trial end date" to "subscription end date" everywhere, in the screen
  text and in the code (`endDate` instead of `trialEndDate`).

**Other**

- Reworked the phone layout: shorter demo notice, cards where the name gets the
  full width, sort moved into the filter row, and the savings card shown again.
- Added `client/vercel.json` so routes like `/edit/123` still work on refresh
  when deployed to Vercel.

## Why

The plan in my proposal was to get the whole interface working in demo mode
first, the way `START-HERE.md` suggests, so the backend has something real to
plug into instead of being built blind. Everything runs on `mockApi.js`, which
keeps accounts and subscriptions in localStorage behind exactly the same
functions the real API will have, so switching over should mean changing
`src/api/`, not the pages.

The currency, frequency, icon and note fields came from using the app myself:
my own subscriptions are in pesos, some bill yearly, and I wanted somewhere to
write down how to cancel.

## What broke or what I got stuck on

- **Blank page with "Invalid hook call" after installing React Router.** The dev
  server was still running and served an old cached copy of React, so the app
  had two copies. Restarting `npm run dev` fixed it. It happened again after
  installing Lucide, and I now restart the server after every `npm install`.
- **GitHub Pages deploy kept failing** with "Failed to create deployment
  (status: 404) … Ensure GitHub Pages has been enabled". The build job passed
  every time; only the deploy step failed, because Pages was never switched on
  in Settings. Nothing to do with my code.
- **Dates.** This was the risk I named in my proposal, and it was worth
  worrying about: `new Date("2026-09-21")` is read as midnight UTC, which can
  land on the day before in some timezones. I wrote `daysUntil` to split the
  "YYYY-MM-DD" string myself and compare local midnights, and tested it at
  11:30pm in both Manila and Los Angeles time.
- **Mixed currencies and frequencies broke the totals.** Adding ₱549 to $15.99
  is meaningless, and so is adding a monthly price to a yearly one. The
  summary now groups by currency and converts everything to a per-month figure
  ("₱807.25 + ¥1,500/mo").
- **Long names wrecked the phone cards.** "Adobe Creative Cloud All Apps Plan"
  wrapped onto four lines and made its card much taller than the rest. Fixed by
  giving the name the full width and clamping it to two lines.
- **Still stuck on:** the backend half. I have not written my own Express routes
  for subscriptions yet, and `params` and route structure are the part I still
  need a guide for.

## What is left

- The Express API: `GET`, `POST`, `PATCH` and `DELETE /api/subscriptions`, with
  the ownership check written into the query as `AND user_id = $2`, plus
  register and login with bcrypt-hashed passwords.
- A real PostgreSQL database with a `subscriptions` table and a `users` table,
  and `db/schema.sql` updated to match.
- Deploy all three pieces and switch `VITE_USE_MOCK_API` to `false`, with
  `CORS_ORIGINS` naming the deployed client.
- Replace `mockApi.js` calls with `httpApi.js` (one environment variable), then
  check every screen again against the real API's loading and error states.
- Smaller things: search on phones (the header has no room for it), and a
  proper README with the live link and a screenshot.

---

## Week of: September 24–37, 2026

## What changed this week

The backend went from nothing to live, and the app now runs against a real
database. 17 commits.

**Client**

- Search on phones: a magnifier button in the header opens a full-width search
  row under it, since the phone header has no room for the search box.
- Dark mode with a System, Light and Dark choice in the user menu. Only the
  colours change; `tokens.css` has one dark block, and switching crossfades
  instead of snapping.
- An Account page: change name and default currency, change password (needs
  the current one), and delete the account (asks for the password again).
- Kept subscriptions roll forward to their next charge date ("Renews in 12
  days") instead of showing "Ended", and a new Ended filter pill.
- Motion across the app: timing tokens, a Keep/Cancel highlight that slides,
  summary numbers that count up, loading skeletons instead of "Loading…",
  pop-ups that animate in and out. All of it switches off for people who ask
  their device for reduced motion.

**Backend (Express + PostgreSQL on Supabase)**

- `schema.sql` with `users` and `subscriptions`. The limits match the client's
  validation (80-character names, 500-character notes), prices are
  `NUMERIC(10,2)` rather than floats, end dates are `DATE` with no timezone,
  and deleting a user deletes their subscriptions (`ON DELETE CASCADE`).
- Register and log in: passwords hashed with bcrypt, a signed token (JWT) that
  lasts 7 days, and the same "Wrong email or password" whether the email or
  the password is wrong, so the API never confirms which emails have accounts.
  Ten attempts per 15 minutes per IP.
- `requireAuth` in front of every personal route: it checks the token's
  signature and expiry, pins the algorithm, and checks the account still
  exists. `GET /api/auth/me` keeps you logged in after a reload.
- All five subscription routes. The ownership check is in every query
  (`WHERE id = $1 AND user_id = $2`), the owner always comes from the token and
  never from the request body, and another user's subscription gets the same
  404 as one that doesn't exist.
- Server-side validation (`subscriptionRules.js`), because the browser can be
  bypassed. `PATCH` merges the change into the saved row and checks the whole
  result, so the Keep/Cancel toggle can send only `{ status }`.
- Account routes: update profile, change password, delete account.
- `helmet` for security headers, and `npm audit fix` (3 moderate issues in
  Express's dependencies, down to 0).

**Deployment**

- The site and the API are one Vercel project at one address: `vercel.json`
  builds the client and sends `/api/...` to the Express app (`api/index.js`).
  `server.js` is split into `app.js` (the routes) and `server.js` (starts it
  locally), so both run the same code.
- Demo mode is off in production (`VITE_USE_MOCK_API=false`). The database
  password and token secret are Vercel secrets, not in the repository.

**Analytics tab**

- A Dashboard | Analytics switch, and an `/analytics` page with loading,
  error and empty states.
- `utils/analytics.js`: spend per month and per year, saved by cancelling,
  most expensive, spend per category, decisions, upcoming charges and a
  12-month forecast. Checked against figures worked out by hand for nine test
  subscriptions, and in three timezones.
- Four headline cards, and three charts (spending by category, decisions,
  next 12 months), each with a Table view holding every exact number.

## Why

The backend was all of last week's "What is left". Switching the client over
was one environment variable, as the week 1 plan intended: no page had to
change, because `httpApi.js` already had the same functions as `mockApi.js`.

Supabase is only the database. Login, passwords and the ownership checks stay
in Express, where the course expects them. Supabase also publishes every table
through its own API, so Row Level Security is switched on with no policies,
which closes that door; the Express server connects as the tables' owner and
isn't affected.

One Vercel project instead of two means one link, one dashboard, and no
cross-site (CORS) requests, since the page and the API share an address.

Analytics came from using the app: the question I actually wanted answered was
"how much am I paying a month, and a year?"

## What broke or what I got stuck on

- **Registering on the live site never reached the database.** The site was
  still in demo mode, and the server wasn't deployed anywhere: the Vercel
  project only built `client/`. Fixed by deploying both from the top of the
  repository as one project.
- **Dates again, on the server this time.** The `pg` library turns a `DATE`
  into a JavaScript `Date` at midnight in the server's timezone, so on a host
  running in UTC a subscription ending 1 October could come back as 30
  September. It now returns the plain `"2026-10-01"` text. Prices also came
  back as strings (`"549.00"`) and are converted to numbers.
- **Broken JSON crashed with a 500 and logged the raw request**, which on the
  login route would have written a password into the logs. Now it's a 400 (or
  413 for a request that is too big) and only the error type is logged.
- **A deleted account's token still worked.** It is still validly signed after
  the account is gone, and adding a subscription with it would have failed with
  a 500. `requireAuth` now checks the account exists.
- **Secrets on screen.** While setting the Vercel environment variables, the
  database password and token secret were visible in a screenshot. Both were
  replaced before saving: a new database password in Supabase and a new
  random token secret.
- **`NODE_ENV=production` would have broken the Vercel build**, because it also
  applies while installing and would skip Vite. It isn't set; Vercel runs the
  server in production mode already.
- **The header overflowed at tablet width** once the tabs were added: the search
  box shrank to its icon. The tabs now get their own row below 1024px.
- **Numbers broke in half on phones** ("₱17,832.0 / 0"). The first check said
  they fit, but it measured before the web font loaded. They now shrink a
  little on narrow screens, and "/mo" moved to the line underneath.
- **My brand teal was too muted for charts.** A colour-blindness checker
  rejected it next to other colours, so the charts use a more vivid step of it.
- **Personal email in commits.** New commits use the GitHub no-reply address;
  the older commits still carry my email, and rewriting that history is still
  undecided.

## What is left

- Analytics, last part: the "charging in the next 30 days" list, the most
  expensive subscriptions, and a final polish pass.
- Turn on secret scanning and push protection in the GitHub settings.
- Remove the GitHub Pages workflow, which fails on every push now that the site
  is on Vercel.
- The README is still the template's: live link, screenshot, and how to run it.
- Fill in `docs/06-security-and-privacy.md`, including two known limits: the
  login rate limit is counted per server instance on Vercel, and changing a
  password doesn't log out other devices until their tokens expire.
- Add this week's entries to `AI-USAGE.md`.
- Add what billing you used when subscribing
