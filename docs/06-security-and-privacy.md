# Security and privacy checklist

Work through this **before your first push**, and again before you submit. It is
short, none of it is exotic, and a grader can check most of it in two minutes.

Your repository is public, in your own account, and permanent. That is the point
of it, and it is also why this file exists.

## Before the first push

- [ ] `.gitignore` includes `.env`, and `git check-ignore -v .env` confirms it
- [ ] `git ls-files | grep -iE '\.env$|\.pem$|id_rsa'` prints nothing
- [ ] `.env.example` is committed, with **placeholder** values only
- [ ] No connection string, key or password anywhere in the repository,
      including in a screenshot
- [ ] No `student.json`, and no name, student number or email of yours or anyone
      else's

Deleting a file later does **not** remove it from the history. If you commit a
credential, **rotate it first**, at the service, and clean up the history second.
The rotation is the fix; the cleanup is hygiene.

## The application

- [ ] Every SQL query is parameterised. Values go in the array, never into the
      string. This is one line of defence you already know how to do
- [ ] Input is validated **on the server**, not only in React. Length limits on
      every text field
- [ ] `cors({ origin: allowedOrigins })` names your origins. Not `cors()` with no
      options, which allows every site on the internet
- [ ] `NODE_ENV=production` on the host, and no stack trace in any response body
- [ ] `helmet` installed, which is one line for several real protections
- [ ] Anything that costs money or accepts a password is rate limited
- [ ] Passwords, if you have accounts, are hashed with bcrypt and never logged
- [ ] Every route that touches somebody's data has the ownership check **in the
      query**, as `AND user_id = $2`, not as an `if` above it
- [ ] `npm audit` run once, and the easy fixes taken

```bash
npm install helmet
```

```js
import helmet from 'helmet'
app.use(helmet())
```

## Privacy

The half that matters more, because it is about other people.

- [ ] **No real classmates' names, numbers, emails or photos**, anywhere. Not in
      seed data, not in screenshots, not in the demo video. Consent for a course
      project does not cover the next ten years of a public repository
- [ ] Seed data is invented. Yours will be read
- [ ] If real people tested your app, even three friends, their data is deleted
      before you submit
- [ ] If your app collects anything about anyone, the app says what it collects
- [ ] Any face in a screenshot is stock, generated, or yours

If your project handles personal information about real people, you are inside
the Philippine Data Privacy Act. Collect the minimum, say what you collect, and
do not collect anything you cannot justify.

## What to write in your journal

One short paragraph: the riskiest thing about your project from this list, what
you did about it, and what you knowingly accepted. A student who can name the
tradeoff they made scores better than one who claims there was none.
