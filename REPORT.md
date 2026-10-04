# Weekly Increment Report

## Week of: September 19–23, 2026

## What changed this week

This was the first week of building, so the whole client went from the template
to a working app. 18 commits.

**Setup and design system**

- Replaced the template's sighting app with SubAlert: new title, the Inter
  font, and `src/styles/tokens.css` holding every colour, font size and space
  from my design system as CSS variables. ([`27f5c8d`](https://github.com/ChompD/SubAlert/commit/27f5c8d))
- Added React Router with five routes: `/`, `/add`, `/edit/:id`, `/login` and
  `/register`, plus a dev-only `/styleguide` page that shows every component in
  one place (it is left out of the production build). ([`9b7929f`](https://github.com/ChompD/SubAlert/commit/9b7929f), [`bfe38c1`](https://github.com/ChompD/SubAlert/commit/bfe38c1), [`e100d47`](https://github.com/ChompD/SubAlert/commit/e100d47))
- Built the components from my wireframes, sorted into atoms, molecules and
  organisms: `Button`, `Badge`, `Pill`, `ServiceIcon`, `FormField`,
  `SelectField`, `TextAreaField`, `DecisionToggle`, `SummaryCard`, `UserMenu`,
  `SubscriptionRow`, `SearchBar`, `IconPicker`, `Header`, `Footer`, `AuthCard`,
  `FilterBar`, `SubscriptionDetails`. ([`3888672`](https://github.com/ChompD/SubAlert/commit/3888672), [`b262667`](https://github.com/ChompD/SubAlert/commit/b262667), [`e100d47`](https://github.com/ChompD/SubAlert/commit/e100d47))

**Accounts**

- Log in and Register pages with their own validation (required fields, email
  format, password of at least 8 characters, passwords must match), error
  messages under each field, and the cursor jumping to the first problem. ([`c0a8d3d`](https://github.com/ChompD/SubAlert/commit/c0a8d3d), [`8db370b`](https://github.com/ChompD/SubAlert/commit/8db370b))
- `AuthContext` holds who is logged in; `ProtectedRoute` sends logged-out
  visitors to `/login` and remembers where they were going; `GuestRoute` sends
  logged-in users away from the login pages. ([`e338917`](https://github.com/ChompD/SubAlert/commit/e338917))
- A user menu in the header with the signed-in email and Log out. ([`b262667`](https://github.com/ChompD/SubAlert/commit/b262667), [`e338917`](https://github.com/ChompD/SubAlert/commit/e338917))

**Subscriptions**

- Dashboard with three summary cards (ending in 48h, active, saved by
  cancelling), the list sorted by end date, and Urgent / Soon badges worked out
  from the end date on every render, never stored. ([`e338917`](https://github.com/ChompD/SubAlert/commit/e338917))
- Add, Edit and Delete. Add and Edit are one page (`SubscriptionFormPage`) used
  by two routes, so the two screens cannot drift apart. Delete asks for
  confirmation first. ([`e338917`](https://github.com/ChompD/SubAlert/commit/e338917), [`bfe38c1`](https://github.com/ChompD/SubAlert/commit/bfe38c1), [`20a3772`](https://github.com/ChompD/SubAlert/commit/20a3772))
- Keep / Cancel toggle on each row that saves straight away, and puts the old
  value back if saving fails. ([`e338917`](https://github.com/ChompD/SubAlert/commit/e338917))
- Search, filter pills with counts (All, Ending soon, Keep, Cancel, Undecided)
  and sorting (end date, name, price). These live in the URL
  (`/?q=net&filter=keep&sort=name`), so a reload keeps them and Back undoes a
  change. ([`e306bb6`](https://github.com/ChompD/SubAlert/commit/e306bb6))
- Currency picker (9 currencies) with each price shown in its own currency. ([`be223de`](https://github.com/ChompD/SubAlert/commit/be223de))
- Billing frequency (weekly, monthly, every 3 months, yearly). "Saved by
  cancelling" adds everything up per month, so a yearly plan counts as a
  twelfth of its price. ([`78cc400`](https://github.com/ChompD/SubAlert/commit/78cc400))
- An icon and colour for each subscription (17 icons, 6 colours, from Lucide). ([`11efddc`](https://github.com/ChompD/SubAlert/commit/11efddc))
- An optional note, up to 500 characters, with a live counter. ([`233090e`](https://github.com/ChompD/SubAlert/commit/233090e))
- Tapping a subscription opens a details pop-up with its dates, price per
  month, decision and note. It uses the browser's own `<dialog>`, so Escape
  closes it and focus stays inside. ([`c745ec5`](https://github.com/ChompD/SubAlert/commit/c745ec5))
- Renamed "trial end date" to "subscription end date" everywhere, in the screen
  text and in the code (`endDate` instead of `trialEndDate`). ([`78cc400`](https://github.com/ChompD/SubAlert/commit/78cc400))

**Other**

- Reworked the phone layout: shorter demo notice, cards where the name gets the
  full width, sort moved into the filter row, and the savings card shown again. ([`204ae7e`](https://github.com/ChompD/SubAlert/commit/204ae7e))
- Added `client/vercel.json` so routes like `/edit/123` still work on refresh
  when deployed to Vercel. ([`067e89a`](https://github.com/ChompD/SubAlert/commit/067e89a))

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
  11:30pm in both Manila and Los Angeles time. ([`b262667`](https://github.com/ChompD/SubAlert/commit/b262667))
- **Mixed currencies and frequencies broke the totals.** Adding ₱549 to $15.99
  is meaningless, and so is adding a monthly price to a yearly one. The
  summary now groups by currency and converts everything to a per-month figure
  ("₱807.25 + ¥1,500/mo"). ([`be223de`](https://github.com/ChompD/SubAlert/commit/be223de), [`78cc400`](https://github.com/ChompD/SubAlert/commit/78cc400))
- **Long names wrecked the phone cards.** "Adobe Creative Cloud All Apps Plan"
  wrapped onto four lines and made its card much taller than the rest. Fixed by
  giving the name the full width and clamping it to two lines. ([`204ae7e`](https://github.com/ChompD/SubAlert/commit/204ae7e))
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

## Week of: September 24–27
## What changed this week

The backend went from nothing to live, and the app now runs against a real
database. 17 commits.

**Client**

- Search on phones: a magnifier button in the header opens a full-width search
  row under it, since the phone header has no room for the search box. ([`c2829d2`](https://github.com/ChompD/SubAlert/commit/c2829d2))
- Dark mode with a System, Light and Dark choice in the user menu. Only the
  colours change; `tokens.css` has one dark block, and switching crossfades
  instead of snapping. ([`10e9fd5`](https://github.com/ChompD/SubAlert/commit/10e9fd5))
- An Account page: change name and default currency, change password (needs
  the current one), and delete the account (asks for the password again). ([`7d5ce8e`](https://github.com/ChompD/SubAlert/commit/7d5ce8e))
- Kept subscriptions roll forward to their next charge date ("Renews in 12
  days") instead of showing "Ended", and a new Ended filter pill. ([`ba74d15`](https://github.com/ChompD/SubAlert/commit/ba74d15))
- Motion across the app: timing tokens, a Keep/Cancel highlight that slides,
  summary numbers that count up, loading skeletons instead of "Loading…",
  pop-ups that animate in and out. All of it switches off for people who ask
  their device for reduced motion. ([`0828445`](https://github.com/ChompD/SubAlert/commit/0828445))

**Backend (Express + PostgreSQL on Supabase)**

- `schema.sql` with `users` and `subscriptions`. The limits match the client's
  validation (80-character names, 500-character notes), prices are
  `NUMERIC(10,2)` rather than floats, end dates are `DATE` with no timezone,
  and deleting a user deletes their subscriptions (`ON DELETE CASCADE`). ([`19dbb51`](https://github.com/ChompD/SubAlert/commit/19dbb51))
- Register and log in: passwords hashed with bcrypt, a signed token (JWT) that
  lasts 7 days, and the same "Wrong email or password" whether the email or
  the password is wrong, so the API never confirms which emails have accounts.
  Ten attempts per 15 minutes per IP. ([`ad99376`](https://github.com/ChompD/SubAlert/commit/ad99376))
- `requireAuth` in front of every personal route: it checks the token's
  signature and expiry, pins the algorithm, and checks the account still
  exists. `GET /api/auth/me` keeps you logged in after a reload. ([`065a381`](https://github.com/ChompD/SubAlert/commit/065a381))
- All five subscription routes. The ownership check is in every query
  (`WHERE id = $1 AND user_id = $2`), the owner always comes from the token and
  never from the request body, and another user's subscription gets the same
  404 as one that doesn't exist. ([`11fea2a`](https://github.com/ChompD/SubAlert/commit/11fea2a), [`a89faf0`](https://github.com/ChompD/SubAlert/commit/a89faf0))
- Server-side validation (`subscriptionRules.js`), because the browser can be
  bypassed. `PATCH` merges the change into the saved row and checks the whole
  result, so the Keep/Cancel toggle can send only `{ status }`. ([`a89faf0`](https://github.com/ChompD/SubAlert/commit/a89faf0))
- Account routes: update profile, change password, delete account. ([`70ffe27`](https://github.com/ChompD/SubAlert/commit/70ffe27))
- `helmet` for security headers, and `npm audit fix` (3 moderate issues in
  Express's dependencies, down to 0). ([`b0f578d`](https://github.com/ChompD/SubAlert/commit/b0f578d))

**Deployment**

- The site and the API are one Vercel project at one address: `vercel.json`
  builds the client and sends `/api/...` to the Express app (`api/index.js`).
  `server.js` is split into `app.js` (the routes) and `server.js` (starts it
  locally), so both run the same code. ([`bedc04c`](https://github.com/ChompD/SubAlert/commit/bedc04c))
- Demo mode is off in production (`VITE_USE_MOCK_API=false`). The database
  password and token secret are Vercel secrets, not in the repository. ([`bedc04c`](https://github.com/ChompD/SubAlert/commit/bedc04c))

**Analytics tab**

- A Dashboard | Analytics switch, and an `/analytics` page with loading,
  error and empty states. ([`69eb9f8`](https://github.com/ChompD/SubAlert/commit/69eb9f8))
- `utils/analytics.js`: spend per month and per year, saved by cancelling,
  most expensive, spend per category, decisions, upcoming charges and a
  12-month forecast. Checked against figures worked out by hand for nine test
  subscriptions, and in three timezones. ([`6e5f406`](https://github.com/ChompD/SubAlert/commit/6e5f406))
- Four headline cards, and three charts (spending by category, decisions,
  next 12 months), each with a Table view holding every exact number. ([`8a0ede5`](https://github.com/ChompD/SubAlert/commit/8a0ede5))

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
  repository as one project. ([`bedc04c`](https://github.com/ChompD/SubAlert/commit/bedc04c))
- **Dates again, on the server this time.** The `pg` library turns a `DATE`
  into a JavaScript `Date` at midnight in the server's timezone, so on a host
  running in UTC a subscription ending 1 October could come back as 30
  September. It now returns the plain `"2026-10-01"` text. Prices also came
  back as strings (`"549.00"`) and are converted to numbers. ([`11fea2a`](https://github.com/ChompD/SubAlert/commit/11fea2a))
- **Broken JSON crashed with a 500 and logged the raw request**, which on the
  login route would have written a password into the logs. Now it's a 400 (or
  413 for a request that is too big) and only the error type is logged. ([`a89faf0`](https://github.com/ChompD/SubAlert/commit/a89faf0))
- **A deleted account's token still worked.** It is still validly signed after
  the account is gone, and adding a subscription with it would have failed with
  a 500. `requireAuth` now checks the account exists. ([`70ffe27`](https://github.com/ChompD/SubAlert/commit/70ffe27))
- **Secrets on screen.** While setting the Vercel environment variables, the
  database password and token secret were visible in a screenshot. Both were
  replaced before saving: a new database password in Supabase and a new
  random token secret.
- **`NODE_ENV=production` would have broken the Vercel build**, because it also
  applies while installing and would skip Vite. It isn't set; Vercel runs the
  server in production mode already. ([`bedc04c`](https://github.com/ChompD/SubAlert/commit/bedc04c))
- **The header overflowed at tablet width** once the tabs were added: the search
  box shrank to its icon. The tabs now get their own row below 1024px. ([`69eb9f8`](https://github.com/ChompD/SubAlert/commit/69eb9f8))
- **Numbers broke in half on phones** ("₱17,832.0 / 0"). The first check said
  they fit, but it measured before the web font loaded. They now shrink a
  little on narrow screens, and "/mo" moved to the line underneath. ([`8a0ede5`](https://github.com/ChompD/SubAlert/commit/8a0ede5))
- **My brand teal was too muted for charts.** A colour-blindness checker
  rejected it next to other colours, so the charts use a more vivid step of it. ([`8a0ede5`](https://github.com/ChompD/SubAlert/commit/8a0ede5))
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

---

## Week of: September 28 – October 3, 2026
## What changed this week

The app was already live, so this week was about finishing it: the last
Analytics pieces, two features I wanted from using it, a better phone layout,
a full security and bug check, and a new name. 25 commits.

**Features**

- Analytics: a "Charging in the next 30 days" list and a "Most expensive"
  list. ([`c7d01a9`](https://github.com/ChompD/SubAlert/commit/c7d01a9))
- "Paid with" on each subscription (GCash, a bank, a card type), with
  suggestions. It refuses six or more digits in a row, so a card or account
  number can never be saved. ([`d1d3335`](https://github.com/ChompD/SubAlert/commit/d1d3335))
- One currency per account: the currency picker is gone from the form, the
  currency is set on the Account page, and changing it relabels every
  subscription without converting the amounts. ([`2800266`](https://github.com/ChompD/SubAlert/commit/2800266), [`3000592`](https://github.com/ChompD/SubAlert/commit/3000592))
- A "Due this week" banner on the Dashboard: what charges in the next 7 days,
  by name, with the total and a button to the "Due soon" filter.
  ([`737aa3f`](https://github.com/ChompD/SubAlert/commit/737aa3f))

**Phone and design**

- iPhone Safari shrank the whole Dashboard when anything was even slightly
  wider than the screen. Pages now stay screen-width. ([`0e52f42`](https://github.com/ChompD/SubAlert/commit/0e52f42))
- The date field ran outside the form on iPhones. It now fits like every other
  field. ([`80b9acf`](https://github.com/ChompD/SubAlert/commit/80b9acf))
- Log in and Register, polished one section at a time: the card header and
  "Welcome back" ([`bea4433`](https://github.com/ChompD/SubAlert/commit/bea4433)), a focus glow and a Show/Hide button on
  password fields ([`88a7a5c`](https://github.com/ChompD/SubAlert/commit/88a7a5c)), a loading spinner and a clearer error
  message ([`574fd77`](https://github.com/ChompD/SubAlert/commit/574fd77)), and a card shadow with better centring
  ([`a6b283b`](https://github.com/ChompD/SubAlert/commit/a6b283b)).
- A bottom navigation bar on phones: Dashboard, a round Add button in the
  middle, and Analytics. It hides on the Add and Edit forms and while typing.
  ([`5dedcac`](https://github.com/ChompD/SubAlert/commit/5dedcac))
- Analytics simplified: four of its six panels removed (where your money goes,
  by payment method, your decisions, charging in the next 30 days).
  ([`f8b88b5`](https://github.com/ChompD/SubAlert/commit/f8b88b5), [`d83ea31`](https://github.com/ChompD/SubAlert/commit/d83ea31), [`4c8fa64`](https://github.com/ChompD/SubAlert/commit/4c8fa64), [`ec5c0da`](https://github.com/ChompD/SubAlert/commit/ec5c0da))

**Security and bugs**

I asked Claude to check the whole system and list every problem before
changing anything, then fixed them one at a time:

- When a session ends, the app now logs you out, says why, and takes you back
  to the same page after you log in again. ([`74a6187`](https://github.com/ChompD/SubAlert/commit/74a6187))
- End dates must be between 2000 and 2100, and the password limit is counted
  the same way (in bytes) in the browser and on the server. ([`72bd60c`](https://github.com/ChompD/SubAlert/commit/72bd60c))
- Renewals are counted from the original date, so a plan on the 31st no longer
  drifts to the 28th. ([`e8ff49e`](https://github.com/ChompD/SubAlert/commit/e8ff49e))
- Separate login limits: 10 wrong passwords per email and 50 per network,
  correct logins don't count, and 10 wrong tries per account for changing the
  password or deleting the account. ([`0037672`](https://github.com/ChompD/SubAlert/commit/0037672))
- Supabase's public roles lost all access to the tables, a second lock behind
  Row Level Security. ([`d85fd05`](https://github.com/ChompD/SubAlert/commit/d85fd05))
- Removed the unused Docker files and the failing GitHub Pages workflow.
  ([`9db9f79`](https://github.com/ChompD/SubAlert/commit/9db9f79), [`9c45e5a`](https://github.com/ChompD/SubAlert/commit/9c45e5a))

**Name and logo**

- The app is now called **SubTrack**. ([`f238a94`](https://github.com/ChompD/SubAlert/commit/f238a94))
- The SubTrack logo, drawn by my girlfriend, is the browser tab icon, the
  iPhone home-screen icon, and the logo in the header and on Log in.
  ([`546facd`](https://github.com/ChompD/SubAlert/commit/546facd))

## Why

"Paid with" and one currency came from using the app. I wanted to see which
wallet pays for what, and adding pesos to dollars without an exchange rate
gives totals that mean nothing, so one currency per account makes every total
add up.

I asked my girlfriend to try the site, and she found the Analytics page too
crowded: she didn't know what was going on. I kept only what answers "how much
am I paying?": the summary cards, the 12-month chart and the most expensive
list.

The bottom bar comes from a friend's design, which he let me copy. On a phone
your thumb rests at the bottom, so that's where the main buttons should be.

Before finishing, I wanted to know what was wrong with the app, so I asked for
a full check and a list first, and chose what to fix.

The new name: the app doesn't send alerts or notifications. It tracks your
subscriptions.

## What broke or what I got stuck on

- **iPhone Safari shrank the Dashboard**, leaving an empty strip down the
  side, and the date field stuck out of the form. I found both on my own
  phone.
- **The Analytics page was too much.** Six panels was more than a new user
  could follow.
- **The check found bugs that were already live:**
  - A kept plan on the 29th–31st drifted to the 28th after February, so it
    showed renewals up to 3 days early, and a plan due today could show next
    month instead.
  - "Back to where you were after logging in" never worked; the Log in page
    always sent you to the Dashboard.
  - When a session ended, the page got stuck on "Your session has ended" with
    no way out.
  - One shared login limit of 10 tries, counting correct logins too, could have
    locked a whole classroom on one Wi-Fi out during a demo.
  - The password limit was counted in characters in the browser but bytes on
    the server, so a password with emoji could pass one and fail the other.
  - Any date was accepted, even year 0100 or 9999.
  - Supabase's public roles still had every permission on the tables,
    including emptying them, which Row Level Security doesn't block.
- **The database change had to go in before the code.** I ran
  `npm run db:schema` myself before pushing, after a dry run that was undone.
- **Renaming without breaking links.** The GitHub repository and the Vercel
  address still say SubAlert, because changing them would break links I had
  already shared, and the browser storage keys stayed the same so nobody got
  logged out.

## What is left
- Fill in the `docs/` files, especially `docs/06-security-and-privacy.md`.
- Turn on secret scanning and push protection in the GitHub settings.
- Automated tests for the date and schedule code.
