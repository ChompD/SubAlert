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
