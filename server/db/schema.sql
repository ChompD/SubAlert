-- The complete shape of the database. Safe to run against an empty database,
-- and safe to run twice.
--
-- This file is committed on purpose. Your schema is a fact about your
-- application, not a runtime concern: it should be readable by opening a file
-- rather than by connecting to a server. It is also what lets you move to a
-- hosted database in one command.
--
-- The limits here match the ones the client and the server already check
-- (utils/validation.js). The database is the last line: even a bug in the API
-- can't store a 10,000-character name or a price of -5.

-- ---------------------------------------------------------------------------
-- The template's example table. Gone now that SubTrack has its own.
DROP TABLE IF EXISTS sightings;

-- ---------------------------------------------------------------------------
-- Accounts. The password is only ever stored as a bcrypt hash.
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  email TEXT NOT NULL UNIQUE CHECK (email = lower(email) AND char_length(email) <= 254),
  password_hash TEXT NOT NULL,
  default_currency CHAR(3) NOT NULL DEFAULT 'PHP',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- One row per subscription or free trial. Every row belongs to one user, and
-- deleting the user deletes their subscriptions with them.
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  price NUMERIC(10,2) NOT NULL CHECK (price BETWEEN 0 AND 9999999),
  currency CHAR(3) NOT NULL DEFAULT 'PHP',
  frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'undecided' CHECK (status IN ('keep', 'cancel', 'undecided')),
  icon TEXT NOT NULL DEFAULT 'letter' CHECK (char_length(icon) <= 40),
  color TEXT NOT NULL DEFAULT 'gray' CHECK (char_length(color) <= 40),
  note TEXT NOT NULL DEFAULT '' CHECK (char_length(note) <= 500),
  payment_method TEXT NOT NULL DEFAULT '' CHECK (char_length(payment_method) <= 40 AND payment_method !~ '[0-9]{6}'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Added after the table already existed on the live database: CREATE TABLE IF
-- NOT EXISTS skips a table that's there, so the new column needs its own line.
-- Does nothing on a database that already has it.
--
-- "Paid with": the NAME of how it's paid (GCash, MariBank, Credit card), never
-- an account or card number. Six digits in a row is refused here as a last
-- line; the API checks first and explains why.
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT ''
  CHECK (char_length(payment_method) <= 40 AND payment_method !~ '[0-9]{6}');

-- The Dashboard asks for one user's subscriptions, soonest first, on every
-- visit. This index answers exactly that question without reading the table.
CREATE INDEX IF NOT EXISTS subscriptions_user_end_date_idx
  ON subscriptions (user_id, end_date);

-- ---------------------------------------------------------------------------
-- Row Level Security. Supabase publishes every table in `public` through its
-- own REST API, reachable with the project's public "anon" key. RLS switched
-- on with NO policies means that API can read and write nothing at all.
--
-- The Express server is unaffected: it connects as `postgres`, which owns
-- these tables, and an owner is not subject to RLS. So the only way to the
-- data is through our API, with its login and its "AND user_id = $2" checks.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- A second lock behind RLS. Supabase gives its two public roles, anon (anyone
-- holding the public key) and authenticated (anyone signed in through
-- Supabase Auth, which SubTrack doesn't use), every permission on new tables.
-- RLS stops them reading or changing rows, but RLS is one switch that could be
-- turned off by mistake, and one of those permissions, TRUNCATE (empty the
-- whole table), ignores RLS altogether. Taking the permissions away means the
-- public roles can do nothing here whatever RLS says. Our server is not
-- affected: it connects as postgres, which owns the tables.
--
-- rls_auto_enable() is Supabase's own helper that switches RLS on for every
-- new table. Supabase's security check flags it because anyone may call it;
-- only the database itself needs to. Its owner, postgres, keeps the right to
-- run it, so it still switches RLS on for new tables.
--
-- Inside a check because these roles and that function exist only on
-- Supabase: on a plain local PostgreSQL, REVOKE would stop with "role anon
-- does not exist". Safe to run twice, like the rest of this file.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON users, subscriptions FROM anon, authenticated;
    IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
      REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
    END IF;
  END IF;
END
$$;
