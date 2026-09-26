-- Sample data for development: deliberately none.
--
-- Every row in SubAlert belongs to an account, and an account needs a
-- password. A sample password written here would be public (this repository
-- is), and it would open the live database to anyone who read it. So instead:
-- make a demo account through the app's Register page, then add invented
-- subscriptions to it through the app, the way a real user would.
--
-- This file stays so `npm run db:reset` still works. It does nothing.
SELECT 'no seed data: register a demo account through the app' AS note;
