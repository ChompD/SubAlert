# Demo video

Three to five minutes, recorded with my own voice and on camera, using the
**deployed** site.

**Link:** https://drive.google.com/drive/folders/1O0SaVj9BNOJGTlp1Xd3Gcuxjwbqzy9kG?usp=sharing
(also in the main [README](../README.md))

## What it covers, in order

1. **What SubTrack is and who it's for**: the title slide and the problem
   (free trials turn into charges you forget).
2. **Live demo on https://sub-track-chompd.vercel.app**, with sample data
   prepared in advance:
   - the Dashboard and its "Due this week" banner,
   - deciding Keep or Cancel with one click,
   - adding a subscription, where a card number in "Paid with" is refused,
   - Analytics, with the 12-month forecast.
3. **How it's built and the code behind my choices**:
   - one Vercel project for the site and the API (`vercel.json`),
   - the ownership check in every query (`server/subscriptionsRepo.js`) and
     the database's own rules (`server/db/schema.sql`),
   - what was hard in the backend: connecting to Supabase through its pooler
     (`server/db/pool.js`), keeping login in Express
     (`server/app.js`), and deploying the API.
4. **How I used AI (2–3 minutes)**: Claude through Claude Code, what I wrote
   myself, and three times the AI was wrong, matching
   [AI-USAGE.md](../AI-USAGE.md).
5. **What's next**: tests for the date code, email reminders, and a safer
   login.

## Before recording

- [ ] Open the site a few minutes early so the API is awake
- [ ] Record the **deployed** address, not `localhost`
- [ ] Log in to the demo account beforehand, so no password is typed on camera
- [ ] Close other tabs, notifications and any `.env` file
- [ ] Check the whole video is under 5:00, and the AI part is 2–3 minutes
- [ ] Set the Drive link to "Anyone with the link", and test it in a private
      window

## Fallback

If the live site is down: the client can run in **demo mode**
(`VITE_USE_MOCK_API=true`), with data kept in the browser and no server, or a
practice recording of the working app can be used instead.
