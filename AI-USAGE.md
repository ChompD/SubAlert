# AI usage — SubTrack (formerly SubAlert)

Assistant used: **Claude (Anthropic), through Claude Code**, in the terminal
alongside the repository.

How much: **a lot.** Most of the React client in this repository was written by
Claude while I directed it: I chose the features, the flow and the look, tested
what came back, and rejected or changed plenty of it.

**The backend is the part I did myself.** Claude helped me with the setup and
guided me on the structure to follow. I wrote the Express routes, the SQL
queries and the schema from that guide, and when I got stuck I asked Claude how
to do it so I could understand it. Where Claude wrote code outright, it has its
own entry below: the Analytics calculations, and the security and bug fixes
from 3 October.

The app was called SubAlert until 3 October, when I renamed it SubTrack, which
is why the repository and older entries still say SubAlert.

This file is updated as I go, not at the end. Its commit history shows that.

Repository: https://github.com/ChompD/SubAlert

> Commit links use the form `https://github.com/ChompD/SubAlert/commit/<hash>`.

---

## 1. How I used AI

### 1. Planning documents and wireframes — 19 September, Claude
**What I asked for:** help turning my SubAlert idea into the proposal, the
wireframes worksheet and the design system, and a picture of what the app would
look like.
**What it gave back:** the three planning documents, grey box wireframes for
Dashboard, Add/Edit, Log in and Register, and a design system with a teal and
orange palette, a type scale and spacing.
**What I kept and changed:** I kept the structure. I cut the Settings page
myself after it failed the "is it core?" test, changed Add/Edit from a side
panel to its own route, and later replaced the palette. The wireframes are the
reason the app looks the way it does.
**Commit:** planning documents live in `docs/`; the first code from them is
[`27f5c8d`](https://github.com/ChompD/SubAlert/commit/27f5c8d) (design tokens).

### 2. Design tokens and the styling approach — 19 September, Claude
**What I asked for:** set up the CSS so my design system is actually used.
**What it gave back:** `client/src/styles/tokens.css` with every colour, font
size and space as a CSS variable, plus `global.css`, and CSS Modules per
component. No framework.
**What I kept and changed:** kept all of it. I later changed the palette values
several times (I tried a powder blue and coral palette from a reference image);
because everything reads from tokens, that is a change in one file.
**Commit:** [`27f5c8d`](https://github.com/ChompD/SubAlert/commit/27f5c8d)

### 3. The component library — 19 September, Claude
**What I asked for:** build every component from my wireframes, sorted into
atoms, molecules and organisms.
**What it gave back:** `Button`, `Badge`, `Pill`, `Avatar`, `FormField`,
`DecisionToggle`, `SummaryCard`, `SubscriptionRow`, `UserMenu`, `Header`,
`Footer`, `AuthCard`, plus a `/styleguide` page that shows them all and is left
out of the production build.
**What I kept and changed:** kept them. The styleguide was Claude's suggestion
and I kept it because it is how I check the app against my design system PDF.
**Commits:** [`3888672`](https://github.com/ChompD/SubAlert/commit/3888672),
[`b262667`](https://github.com/ChompD/SubAlert/commit/b262667),
[`e100d47`](https://github.com/ChompD/SubAlert/commit/e100d47)

### 4. Accounts in the browser, and the routes — 19 September, Claude
**What I asked for:** make login, register, the dashboard and adding a
subscription work, locally, without Supabase for now.
**What it gave back:** `AuthContext`, `ProtectedRoute`, `GuestRoute`, the login
and register forms with validation, and `mockApi.js`, which keeps accounts and
subscriptions in localStorage behind the same functions the real API will have.
**What I kept and changed:** I changed my mind twice here, and the history shows
it: first we built a real Express API with bcrypt and JWT, then I said to drop
it for now and keep everything local, so that work was reverted before it was
committed. I kept the localStorage version.
**Commits:** [`c0a8d3d`](https://github.com/ChompD/SubAlert/commit/c0a8d3d),
[`8db370b`](https://github.com/ChompD/SubAlert/commit/8db370b),
[`e338917`](https://github.com/ChompD/SubAlert/commit/e338917)

### 5. Edit and delete — 20 September, Claude
**What I asked for:** an edit button on each row, then "make the three dots go
straight to edit, and add delete".
**What it gave back:** first a dropdown menu with Edit and Delete on each row.
When I said I wanted one tap, it removed the menu entirely and made the ···
button open the edit page, with Delete moved onto that page behind a
confirmation.
**What I kept and changed:** kept the second version. The first had a menu I did
not need, and my own wireframes already said "Edit mode also shows: Delete
subscription", so the second matches my plan better.
**Commits:** [`bfe38c1`](https://github.com/ChompD/SubAlert/commit/bfe38c1),
[`20a3772`](https://github.com/ChompD/SubAlert/commit/20a3772)

### 6. Currency, then billing frequency — 21 September, Claude
**What I asked for:** a currency changer when adding or editing, and later a
billing frequency, plus renaming "trial end date" to "subscription end date".
**What it gave back:** nine currencies with `Intl.NumberFormat`, per-currency
totals, then weekly/monthly/quarterly/yearly with a `monthlyAmount` helper so
totals and price sorting compare per month. The rename went through eight files
and included a migration so rows already saved as `trialEndDate` still load.
**What I kept and changed:** kept it. I asked for the rename to go into the code
and not just the labels, so the code and the screen say the same thing.
**Commits:** [`be223de`](https://github.com/ChompD/SubAlert/commit/be223de),
[`78cc400`](https://github.com/ChompD/SubAlert/commit/78cc400)

### 7. Search, filters, sorting — 21 September, Claude
**What I asked for:** the search box, the pills (All, Ending soon, Keep, Cancel,
Undecided) and sorting from my wireframes.
**What it gave back:** `subscriptionFilters.js` (plain functions, no React) and
`useDashboardFilters.js`, which keeps the search, filter and sort in the URL
instead of `useState`, so a reload keeps them and Back undoes a change.
**What I kept and changed:** kept it, but I removed the second search box it put
above the pills on phones, because two search boxes on one screen was clutter.
**Commits:** [`e306bb6`](https://github.com/ChompD/SubAlert/commit/e306bb6),
[`204ae7e`](https://github.com/ChompD/SubAlert/commit/204ae7e)

### 8. Icons, notes and the details pop-up — 21 September, Claude
**What I asked for:** an icon picker, an optional note, and a pop-up when a card
is tapped that shows the data and the note.
**What it gave back:** 17 Lucide icons with 6 colours, a 500-character note with
a counter, and a details pop-up built on the browser's own `<dialog>` element.
**What I kept and changed:** kept them. I asked for the icons to be generic
rather than brand logos after we talked about trademarks, which is also why
service icons are pictures of categories, not company marks.
**Commits:** [`11efddc`](https://github.com/ChompD/SubAlert/commit/11efddc),
[`233090e`](https://github.com/ChompD/SubAlert/commit/233090e),
[`c745ec5`](https://github.com/ChompD/SubAlert/commit/c745ec5)

### 9. Dark mode, animations, Account page, phone search, roll-forward — 25–26 September, Claude
**What I asked for:** dark mode and animations, an Account page, search on
phones, and kept subscriptions that move on to their next charge date.
**What it gave back:** a System / Light / Dark switch in the user menu, motion
across the app, an Account page (name, currency, password, delete account), a
magnifier button for search on phones, and kept subscriptions that roll
forward to their next charge.
**What I kept and changed:** kept all of it.
**Commits:** [`c2829d2`](https://github.com/ChompD/SubAlert/commit/c2829d2),
[`10e9fd5`](https://github.com/ChompD/SubAlert/commit/10e9fd5),
[`7d5ce8e`](https://github.com/ChompD/SubAlert/commit/7d5ce8e),
[`ba74d15`](https://github.com/ChompD/SubAlert/commit/ba74d15),
[`0828445`](https://github.com/ChompD/SubAlert/commit/0828445)

### 10. The Express API and database — 26 September, Claude (guide)
**What I asked for:** a guide on how to set up the backend: the Express API,
the PostgreSQL database, and register and login.
**What it gave back:** help with the setup and the structure to follow. I wrote
the backend from that, and asked for help when I got stuck.
**What I kept and changed:** I created the Supabase project, set up Vercel, and
asked where the API should go.
**Commits:** [`19dbb51`](https://github.com/ChompD/SubAlert/commit/19dbb51),
[`ad99376`](https://github.com/ChompD/SubAlert/commit/ad99376),
[`065a381`](https://github.com/ChompD/SubAlert/commit/065a381),
[`11fea2a`](https://github.com/ChompD/SubAlert/commit/11fea2a),
[`a89faf0`](https://github.com/ChompD/SubAlert/commit/a89faf0),
[`70ffe27`](https://github.com/ChompD/SubAlert/commit/70ffe27),
[`b0f578d`](https://github.com/ChompD/SubAlert/commit/b0f578d)

### 11. Site and API as one Vercel project — 27 September, my decision
**What I asked for:** where to put the API. Using Vercel was my idea, because
it's what we used for our thesis.
**What it gave back:** a setup where one Vercel project serves the React site
and runs the Express API, so there is one link.
**What I kept and changed:** kept it.
**Commit:** [`bedc04c`](https://github.com/ChompD/SubAlert/commit/bedc04c)

### 12. The Analytics page — 27–28 September, Claude
**What I asked for:** help with the Analytics page. I tried to do it myself, but
I got stuck on the calculations, so I asked Claude to do them.
**What it gave back:** the calculations in `client/src/utils/analytics.js`:
monthly and yearly totals, savings, the most expensive subscription, and the
12-month forecast.
**What I kept and changed:** on 3 October I removed four of the six panels. I
asked my girlfriend to try the site and she was bombarded by the Analytics
page: she said it was too crowded and she didn't know what was going on. I kept
the summary cards, the 12-month chart and the most expensive list.
**Commits:** [`69eb9f8`](https://github.com/ChompD/SubAlert/commit/69eb9f8),
[`6e5f406`](https://github.com/ChompD/SubAlert/commit/6e5f406),
[`8a0ede5`](https://github.com/ChompD/SubAlert/commit/8a0ede5),
[`c7d01a9`](https://github.com/ChompD/SubAlert/commit/c7d01a9); panels removed in
[`f8b88b5`](https://github.com/ChompD/SubAlert/commit/f8b88b5),
[`d83ea31`](https://github.com/ChompD/SubAlert/commit/d83ea31),
[`4c8fa64`](https://github.com/ChompD/SubAlert/commit/4c8fa64),
[`ec5c0da`](https://github.com/ChompD/SubAlert/commit/ec5c0da)

### 13. "Paid with" and one currency per account — 29 September, my idea, Claude
**What I asked for:** both were my idea. I asked Claude to add "Paid with" to
each subscription, and to change the app to one currency per account so the
totals always add up.
**What it gave back:** a "Paid with" field with suggestions, which refuses six
or more digits in a row so card and account numbers are never stored; and one
currency per account, set on the Account page, with the currency picker removed
from the subscription form.
**What I kept and changed:** kept it.
**Commits:** [`d1d3335`](https://github.com/ChompD/SubAlert/commit/d1d3335),
[`2800266`](https://github.com/ChompD/SubAlert/commit/2800266),
[`3000592`](https://github.com/ChompD/SubAlert/commit/3000592)

### 14. iPhone Safari fixes — 29 September
**What I asked for:** I found the problems on my own phone (the Dashboard
shrinking, and the date field going outside the form) and asked Claude where to
fix them.
**What it gave back:** where in the code the problem was.
**What I kept and changed:** I made the fixes myself.
**Commits:** [`0e52f42`](https://github.com/ChompD/SubAlert/commit/0e52f42),
[`80b9acf`](https://github.com/ChompD/SubAlert/commit/80b9acf)

### 15. Login page polish — 1 October, Claude
**What I asked for:** a better login page, but not too much, done section by
section.
**What it gave back:** four sections: the card header, the input fields (focus
glow, Show/Hide password), a loading spinner and clearer error message, and a
card shadow with better centring.
**What I kept and changed:** some things were wrong, so I fixed them myself.
The bell icon was later replaced by my logo.
**Commits:** [`bea4433`](https://github.com/ChompD/SubAlert/commit/bea4433),
[`88a7a5c`](https://github.com/ChompD/SubAlert/commit/88a7a5c),
[`574fd77`](https://github.com/ChompD/SubAlert/commit/574fd77),
[`a6b283b`](https://github.com/ChompD/SubAlert/commit/a6b283b)

### 16. "Due this week" banner — 1 October, Claude
**What I asked for:** Claude suggested it, and I said to do it.
**What it gave back:** a banner on the Dashboard showing what charges this
week, the total, and a button to the "Due soon" filter.
**What I kept and changed:** kept it.
**Commit:** [`737aa3f`](https://github.com/ChompD/SubAlert/commit/737aa3f)

### 17. Security and bug check — 2–3 October, Claude
**What I asked for:** to check the system for security risks and bugs, then fix
them.
**What it gave back:** a list of problems and the fixes:
- logging out when a session ends, and going back to the same page
- the date range, and the password limit counted in bytes
- the monthly date drift
- separate login limits
- the database `REVOKE`
- deleting the unused Docker files and GitHub Pages workflow

**What I kept and changed:** kept them. I ran `npm run db:schema` before
pushing the database change.
**Commits:** [`74a6187`](https://github.com/ChompD/SubAlert/commit/74a6187),
[`72bd60c`](https://github.com/ChompD/SubAlert/commit/72bd60c),
[`e8ff49e`](https://github.com/ChompD/SubAlert/commit/e8ff49e),
[`0037672`](https://github.com/ChompD/SubAlert/commit/0037672),
[`d85fd05`](https://github.com/ChompD/SubAlert/commit/d85fd05),
[`9db9f79`](https://github.com/ChompD/SubAlert/commit/9db9f79),
[`9c45e5a`](https://github.com/ChompD/SubAlert/commit/9c45e5a)

### 18. Bottom navigation, the new name, and the logo — 3 October
**What I asked for:** a bottom navigation bar for phones. My friend sent me his
design and I asked if I could copy the format; he said sure. It's better on
mobile because thumbs can reach the bottom of the screen.
**What it gave back:** a bar with Dashboard, a round Add button and Analytics,
on phones only.
**What I kept and changed:** I renamed the app **SubTrack**, because it doesn't
alert the user or send notifications; it tracks their subscriptions. **The
logo is not AI-made:** my girlfriend drew it for me, a shark shaped like an S.
Claude only resized it and added it to the app.
**Commits:** [`5dedcac`](https://github.com/ChompD/SubAlert/commit/5dedcac),
[`f238a94`](https://github.com/ChompD/SubAlert/commit/f238a94),
[`546facd`](https://github.com/ChompD/SubAlert/commit/546facd)

---

## 2. Where the AI got it wrong

### 1. It suggested an auth design that did not match the course requirements
**What it gave me:** when I said I would use Supabase, it started setting up
Supabase Auth, where React talks to Supabase directly for login and register.
**What was wrong with it:** my starter repository says the finals submission is
"the React client, your Express API and your PostgreSQL database", and
`docs/06-security-and-privacy.md` expects passwords hashed with bcrypt and an
ownership check in the query. Supabase Auth would have skipped my own API for
the part the course is actually grading.
**What I did instead:** dropped Supabase for now and kept everything local while
the interface was built, so the API can be written properly later, by me.
**Commit:** [`e338917`](https://github.com/ChompD/SubAlert/commit/e338917)

### 2. Its first phone layout made the cards worse, not better
**What it gave me:** when I asked it to fix the mobile view, its first attempt
moved the price, days left and the Urgent badge onto one line under the name.
**What was wrong with it:** on a 375px screen that line did not fit, so it
wrapped and every card grew from 124px to 160px tall: the opposite of the fix I
asked for. I could see it in the screenshots.
**What I did instead:** told it the cards were still too tall; the badge moved
back up beside the name, which left the meta line short enough to fit. Cards are
now a consistent 136px, and a very long name is clamped to two lines.
**Commit:** [`204ae7e`](https://github.com/ChompD/SubAlert/commit/204ae7e)

### 3. It used colours that failed my own accessibility rule
**What it gave me:** when I sent palettes I liked (a powder blue and coral one,
and a pastel one with a soft green), it first drew the app in those exact
colours.
**What was wrong with it:** the light blue (#91ADC2) and coral (#D97C7C) give
only 2.3:1 and 3.0:1 contrast with white text, and my own design system says
every text pair must reach 4.5:1. The screens looked nice and would have failed
the accessibility section of my own document.
**What I did instead:** it showed the numbers when I pushed on it, and gave
deepened versions of the same colours (#47698A, #A83E3E) that keep the look and
pass at 4.8:1 or better. I am still deciding which palette to use, so the app
currently keeps the teal palette from my design system PDF.
**Commit:** current palette in
[`27f5c8d`](https://github.com/ChompD/SubAlert/commit/27f5c8d)

### 4. Some of the design wasn't right
**What it gave me:** layouts and screens built from my wireframes, and some
sentences in my documents.
**What was wrong with it:** some elements were too wide, uneven, or not the same
width as the ones next to them, and some sentences in the documents were wrong.
**What I did instead:** I fixed them myself.
**Commits:** [`0e52f42`](https://github.com/ChompD/SubAlert/commit/0e52f42),
[`80b9acf`](https://github.com/ChompD/SubAlert/commit/80b9acf)

### 5. Going back to where you were after logging in never worked
**What it gave me:** a login flow meant to log you out when your session ends
(after 7 days) and send you back to the page you were on.
**What was wrong with it:** I noticed it had been 7 days and it hadn't logged me
out. When a session ended, the page got stuck saying "Your session has ended"
instead of logging you out, and the Log in page always sent you to the
Dashboard instead of back where you were.
**What I did instead:** asked Claude to fix it. Now the app logs you out, shows
why, and returns you to the same page after logging in.
**Commit:** [`74a6187`](https://github.com/ChompD/SubAlert/commit/74a6187)

### 6. The password limit was counted two different ways
**What it gave me:** a limit of 72 characters on passwords.
**What was wrong with it:** I tested passwords with emojis. The form counted
characters but the server counted bytes, and an emoji is up to 4 bytes, so a
password could pass the form and then be refused by the server.
**What I did instead:** asked Claude to fix it. Both sides now count the same
way and show the same message.
**Commit:** [`72bd60c`](https://github.com/ChompD/SubAlert/commit/72bd60c)

### 7. A plan on the 31st slowly drifted to the 28th
**What it gave me:** the code that moves a kept subscription to its next charge
date.
**What was wrong with it:** it counted each month from the previous charge, so
after February a plan on the 31st became the 28th and stayed there, showing
renewals up to 3 days early.
**What I did instead:** it was found in the security and bug check, and Claude
fixed it so every charge is counted from the original date.
**Commit:** [`e8ff49e`](https://github.com/ChompD/SubAlert/commit/e8ff49e)

---

## 3. Who wrote what

### Written by me

**The backend** — I wrote it from Claude's guide, and asked for help when I got
stuck.

- **`server/db/schema.sql`** — the users and subscriptions tables.
  **Commit:** [`19dbb51`](https://github.com/ChompD/SubAlert/commit/19dbb51)
  **Why it's built this way:** every limit the app checks (name length, price
  range, no card numbers in "Paid with") is also a rule in the database, so
  even a bug in the API can't save bad data. Row Level Security is on so
  Supabase's public API can't read the tables.
- **`server/subscriptionsRepo.js`** — the SQL for subscriptions.
  **Commits:** [`11fea2a`](https://github.com/ChompD/SubAlert/commit/11fea2a),
  [`a89faf0`](https://github.com/ChompD/SubAlert/commit/a89faf0)
  **Why:** every query has `AND user_id = $2` in it, so a subscription that
  belongs to someone else is never found. The ownership check can't be
  forgotten, because it's in the query, not in an if-statement. Values always
  go in the `$1, $2` list, never into the SQL text, so typed text can't run as
  SQL.
- **`server/app.js` and `server/usersRepo.js`** — register, login, the routes.
  **Commits:** [`ad99376`](https://github.com/ChompD/SubAlert/commit/ad99376),
  [`065a381`](https://github.com/ChompD/SubAlert/commit/065a381),
  [`70ffe27`](https://github.com/ChompD/SubAlert/commit/70ffe27)
  **Why:** passwords are stored only as bcrypt hashes. Login answers "Wrong
  email or password" for both mistakes, so a stranger can't find out which
  emails have accounts. The user's id comes from the login token, never from
  what the browser sends.

**Front end**
- The iPhone Safari fixes (entry 14):
  [`0e52f42`](https://github.com/ChompD/SubAlert/commit/0e52f42),
  [`80b9acf`](https://github.com/ChompD/SubAlert/commit/80b9acf)

**Not mine:** the changes Claude made to the backend on 3 October (entry 17):
the login limits, logging out when a session ends, the date and password
limits, and the database `REVOKE`.

### The AI-written code I understand best

`client/src/hooks/useDashboardFilters.js` — search, filter and sort live in the
address bar.

The search text, the filter pill and the sort order are saved in the page
address (for example `/?q=net&filter=keep&sort=price`) instead of in React
state. The search box is in the header and the pills are on the Dashboard, and
the address is one place both can read, so they always agree. Because it's in
the address, reloading the page keeps your filters, and a link you share opens
already filtered. Anything typed into the address by hand is checked, so a
made-up `?filter=banana` falls back to "All" instead of showing an empty list.

It also decides how the Back button behaves. Changing a pill adds a new history
entry, so Back undoes it. Typing in search replaces the current entry instead,
so searching "netflix" doesn't take seven Back presses to undo.

---

## Honest summary

Most of the client code in this repository was written by Claude with me
directing, testing and rejecting. The backend I did myself, from Claude's guide,
asking for help when I got stuck; the parts Claude wrote outright are listed
above. I made the decisions: Vercel, one currency per account, "Paid with",
cutting the crowded Analytics panels after my girlfriend tried the site, the
bottom bar, and the SubTrack name. The logo was drawn by my girlfriend, not AI.
I have tried to make this file match what the commit history actually shows
rather than what sounds better.
