# AI usage — SubAlert

Assistant used: **Claude (Anthropic), through Claude Code**, in the terminal
alongside the repository.

How much: **a lot.** The whole React client in this repository was written by
Claude while I directed it: I chose the features, the flow and the look, tested
what came back, and rejected or changed plenty of it.

**The backend is the part I am writing myself.** The Express routes, the SQL
queries and the database schema are mine to write, and they are what I point at
in section 3. When I get stuck I will ask Claude to explain the thing I do not
understand, or to look at code I have already written and tell me what is wrong
with it, rather than asking it to write the code for me. Any help I take that
way gets its own entry in section 1, with what I asked and what I changed, so
the split between my work and the AI's stays honest.

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

<!-- TODO (you): add an entry for every AI use in weeks 2 and 3, especially the
     ones while building the API. Same shape: date, tool, what you asked, what
     it gave back, what you kept or changed, commit link. -->

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

<!-- TODO (you): add more as they happen. The API work will produce good ones:
     AI is often wrong about SQL, about where to put the ownership check, and
     about async error handling. -->

---

## 3. Who wrote what

### Written by me

<!-- TODO (you). This section is worth 30 points and needs at least a fifth of
     the project. Write the Express API and the database queries yourself, then
     fill this in with, for each part: the file, the commit link, what it does,
     and WHY it is built that way, in your own words.

     Planned, not yet written:
       - server/db/schema.sql: the users and subscriptions tables
       - server/subscriptionsRepo.js: the SQL, with the ownership check written
         into the query as "AND user_id = $2" rather than an if-statement
       - server/server.js: the /api/subscriptions routes
       - server/auth.js: register and login, with bcrypt

     For each one, explain the decision, not just the code. For example: why the
     ownership check belongs in the WHERE clause, why the queries are
     parameterised, why login answers the same message for a wrong email and a
     wrong password. -->

### The AI-written code I understand best

<!-- TODO (you). Pick ONE and explain it in your own words. Good candidates,
     because they have a real reason behind them:

     1. client/src/utils/dates.js — daysUntil().
        Why it splits the "YYYY-MM-DD" string by hand instead of using
        new Date(string): the string form is read as midnight UTC, so in some
        timezones it lands on the day before and "2 days left" shows as 1. This
        was the risk I named in my proposal.

     2. client/src/hooks/useDashboardFilters.js.
        Why search, filter and sort live in the URL instead of useState: the
        search box is in the header and the pills are on the dashboard, and the
        URL is one place both can read; a reload keeps the filters, and Back
        undoes a change.

     3. client/src/api/index.js.
        Why there is one interface with two implementations chosen by an
        environment variable, and why demo mode is the default. -->

---

## Honest summary

Most of the client code in this repository was written by Claude with me
directing, testing and rejecting. The API and database work is mine: I write it,
and I ask for explanations or a review when I am stuck instead of asking for the
finished code. I have tried to make this file match what the commit history
actually shows rather than what sounds better.
