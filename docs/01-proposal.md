# Proposal — SubTrack (formerly SubAlert)

This is the proposal I submitted for m8a1, copied from my proposal document so
the plan and the code sit next to each other. It is unchanged below the line,
apart from formatting. Everything that changed since is in
[What changed since the proposal](#what-changed-since-the-proposal) at the end.

---

## App name

SubAlert *(renamed SubTrack on 3 October 2026, see below)*

## What the app is for, in one sentence

SubAlert lets budget-conscious users log their free trials and subscriptions,
see which ones are about to bill them, and decide whether to keep or cancel
each one before the renewal charge goes through. Each user has their own
account, so their list is saved online and shows up on any device they log in
from.

## Who is it for

**Who:** It's for me, and for students like me who often sign up for free
trials and promo subscriptions on a tight budget and then forget about them
until an unexpected charge shows up on their bank statement.

**What they're trying to do when they open it:** They want to see in a few
seconds which trials end soonest and whether they've already decided to keep or
cancel each one. They might also be adding a trial they just signed up for, so
they don't forget it.

## Sections or routes this app needs

SubAlert uses React Router with five routes. The first three are protected: a
logged-out user is sent to Log in.

| # | Section / route | What it is for |
| --- | --- | --- |
| 1 | Dashboard (`/`) | The home screen. It lists every subscription sorted by trial end date, highlights the ones ending soon, and lets the user toggle Keep or Cancel on each one. |
| 2 | Add subscription (`/add`) | A form where the user enters a new trial's name, trial end date, renewal price and decision. |
| 3 | Edit subscription (`/edit/:id`) | The same form, filled in with an existing subscription, so the user can change it or delete it. |
| 4 | Log in (`/login`) | Where a returning user signs in with their email and password. It is the first screen for anyone who is not logged in. |
| 5 | Register (`/register`) | Where a new user creates an account with their name, email and password. |

**Core test:**

- **Dashboard:** Without it, the user can't see upcoming deadlines, so it's core.
- **Add:** Without it, there's no way to enter data, so it's core.
- **Edit:** Without it, a typo in a date or price can only be fixed by deleting
  and re-adding, and there's nowhere to delete from. It's core, and it reuses
  the Add form, so it costs little extra.
- **Log in / Register:** Subscriptions are saved per user in Supabase, so
  without an account there is no list to load. Both are core.

**Parked for later:** I first planned a Settings page (clear sample data,
export/import JSON, reset app). It failed the core test, so I removed it.
"Clear sample data" moves to a small banner on the Dashboard, and export/import
JSON is left out, because accounts already keep the data safe and available on
every device.

**Backend:** I'm using Supabase for both parts: Supabase Auth for log in,
register and log out, and a Supabase subscriptions table for the data.
localStorage is no longer used for subscriptions.

## State: what data does the app hold?

Most important screen: Dashboard

| Data | Shape (rough) | Who owns it (which component) | Changes when... |
| --- | --- | --- | --- |
| user | `{ id, email, name }`, or null when logged out | AuthProvider (a context that wraps App), filled from the Supabase session | The user logs in, registers or logs out |
| subscriptions | `[{ id, userId, name, trialEndDate, price, status, isSample }]`, where status is "keep", "cancel" or "undecided" | App (through a useSubscriptions hook), because the Dashboard and the Add/Edit routes all need it. Loaded from and saved to Supabase. | The user adds, edits or deletes a subscription, toggles Keep/Cancel, or a different user logs in |
| loading / error | Boolean / string or null | useSubscriptions (the auth forms keep their own) | A Supabase request starts, finishes or fails |
| filter | String: "all", "soon", "keep", "cancel" or "undecided" | Dashboard | The user taps a filter pill |
| searchQuery | String | Dashboard | The user types in the search box |
| sortOrder | String: "endDate" or "price" | Dashboard | The user changes the sort dropdown |

**Calculated values that are not state:** days left, the urgency level (red,
amber or none), whether the sample data banner shows (any subscription with
isSample: true), and the summary card numbers. I'll calculate these from
subscriptions and today's date each time the component renders, instead of
storing them. Stored copies could fall out of sync with the real data.

## What each screen contains

**Screen: Dashboard**

- **Block 1, header:** The app name and logo, a search box, and an "Add
  subscription" button. On phone, these become a search icon and a small
  "+ Add" button. A user menu (avatar and name) opens a dropdown with the
  signed-in email and "Log out".
- **Block 2, sample data banner:** Shown only while sample data is loaded. It
  says "You're viewing sample data" and has a "Clear sample data" link.
- **Block 3, summary cards:** How many trials end within 48 hours, how many
  trials are active, and how much money cancelling has saved per month.
- **Block 4, filter bar:** Pills for All, Ending soon, Keep, Cancel and
  Undecided, plus a sort control.
- **Block 5, subscription list:** A row for each subscription on desktop, or a
  card on mobile. Each shows the service name, days left, price and a
  Keep/Cancel toggle, plus a menu with Edit and Delete. A coloured stripe marks
  urgency.
- **Block 6, empty state:** Shown when there are no subscriptions. It has a
  short line of text and an "Add your first trial" button.

## Content you need to gather

- **Sample data:** 6–8 fake subscriptions with end dates relative to today
  (tomorrow, in 2 days, in 6 days, in 19 days), so the "ending soon" styles
  always appear in demos.
- **Service icons:** I'll use a coloured circle with the service's first letter
  instead of real brand logos, which avoids trademark problems.
- **Urgency rules and colours:** Red for trials ending within 48 hours, amber
  for within 7 days, and nothing after that. The exact colour values also need
  to be decided.
- **UI text:** Wording for the empty state, delete confirmation, form
  validation errors and button labels.
- **App logo/icon:** A simple bell or calendar icon (for example from Tabler
  Icons or Lucide).
- **Supabase project:** A free Supabase project, with the project URL and anon
  key saved in a .env file (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). The
  .env file stays out of Git.
- **Database table:** A subscriptions table with id, user_id, name,
  trial_end_date, price, status, is_sample and created_at, plus Row Level
  Security policies so each user can only read and change their own rows.
- **Auth text:** Error messages for a wrong password, an email that is already
  registered, a weak password and passwords that don't match.

## One risk

Connecting the app to Supabase is the part I'm least sure about. Logging in
looks simple, but moving the subscriptions from React state into a database
means every add, edit and toggle becomes an async request that needs a loading
and an error state. Row Level Security also has to be set up correctly, or one
user could see another user's subscriptions. I plan to do this part first: set
up the project and table, get log in and register working, then load one
subscription from the database before building the rest of the screens. I'll
ask for help early if RLS or the session handling doesn't behave.

**Also watch, date handling:** "Days left" and the 48-hour warning depend on
comparing the trial end date with today. JavaScript Date objects are known for
timezone surprises: `new Date("2026-09-21")` is read as midnight UTC, which can
show up as the day before in local time, and then a trial could say "2 days"
when it should say "1 day." I plan to test this early with a small
`daysUntil(dateString)` helper function and a few hand-picked dates, and to ask
for help if the numbers come out wrong.

---

## What changed since the proposal

### The backend: Express instead of Supabase Auth

The proposal used **Supabase Auth** for logging in and had React talk to
Supabase directly. I changed this: the course grades the React client, **an
Express API**, and a PostgreSQL database, and Supabase Auth would have skipped
the API. So login, passwords and ownership checks are in my own Express server
(`server/app.js`): passwords hashed with bcrypt, a signed login token (JWT) that
lasts 7 days, and `AND user_id = $n` in every query. Supabase is now only the
PostgreSQL database. This is also entry 1 in section 2 of
[AI-USAGE.md](../AI-USAGE.md).

Because of that, the `.env` values changed too: no `VITE_SUPABASE_*` keys in the
client. The server has `DATABASE_URL` and `JWT_SECRET` instead, which are never
sent to the browser. Row Level Security is on with **no** policies (so
Supabase's public API can do nothing), and Supabase's public roles have no
access to the tables at all.

### Where each piece is hosted

| Piece | Where | The free tier's catch |
| --- | --- | --- |
| React client | Vercel | none that matters here |
| Express API | Vercel, in the **same project** as the client, as a serverless function | it starts on demand, so the first request after a quiet spell is slower, and the login limits are counted per running copy |
| PostgreSQL | Supabase (Singapore), through its connection pooler | a free project pauses after a period of no activity |

The API and database went live on 26–27 September 2026. The live address
changed in October to **https://sub-track-chompd.vercel.app**, after the
rename.

### The date demo mode went off

**27 September 2026.** Since then the live site uses the real API and database
(`VITE_USE_MOCK_API=false`). Demo mode still exists for running the client
without a server.

### Core features

**All five routes were built**, and they work as planned: Dashboard, Add, Edit,
Log in and Register.

**Not built:**

- **The sample data banner and "Clear sample data"** (and the `isSample`
  field). With real accounts, a new user starts with an empty list, and the
  empty state ("Add your first subscription") does that job instead.

**Changed:**

- "Trial end date" became **"subscription end date"** (`endDate`), because the
  app is used for paid subscriptions as well as trials.
- **The phone header** no longer holds "+ Add". On phones the main navigation
  is a **bottom bar** with Dashboard, a round Add button and Analytics.
- **The logo** is no longer a bell icon. It is a shark shaped like an S, drawn
  by my girlfriend.
- **The name** changed from SubAlert to **SubTrack** on 3 October 2026, because
  the app doesn't send alerts or notifications; it tracks subscriptions. The
  GitHub repository is still named SubAlert.

**Added (beyond the proposal):**

- **Analytics** (`/analytics`): per month, per year, savings, the most
  expensive subscription, and a 12-month forecast.
- **Account** (`/account`): change name, currency and password, or delete the
  account.
- Billing frequency (weekly, monthly, every 3 months, yearly), and kept
  subscriptions that roll forward to their next charge.
- One currency per account, an icon and colour per subscription, notes, and
  "Paid with" (refusing card numbers).
- Search, filter pills with counts, and four sort orders, kept in the address
  bar.
- A "Due this week" banner, a details pop-up, and dark mode.

**Stretch goals, not built:** export/import, and email reminders before a
charge.

### Risks: how they turned out

- **Connecting to Supabase (the main risk): it grew, then was solved.** The
  direct connection doesn't work from most hosts, so the server connects
  through Supabase's pooler (the session pooler locally, the transaction pooler
  on Vercel). Row Level Security is on, and the ownership check is in every
  query, so one user can't see another's subscriptions.
- **Dates: it was real, twice.** `daysUntil` splits the date text itself, as
  planned. On the server, the database library also turned dates into
  midnight in the server's timezone, which could show 30 September for 1
  October; dates now stay as plain text. A third date bug was found on 3
  October: a kept plan on the 31st drifted to the 28th after February. It is
  fixed, and is entry 7 in section 2 of [AI-USAGE.md](../AI-USAGE.md).
- **New:** the login token is kept in the browser's storage, where an
  httpOnly cookie would be safer. It is listed as a next step in the README.
