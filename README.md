# Triage

A private, single-user study app for university papers. One person, one phone.

It answers one question: **given the time you have, what should you actually study?**

## What it does

- **Triage** — every section of a module ranked by `marks x how often the paper asks`. Priority is arithmetic against a past-paper record, not an LLM's opinion. It also tells you what to skip and what that risks.
- **Capture in three taps** — the `+` in the tab bar takes a title and nothing else. Date chips set the due day. It lands as a task, and late work is grey, never red.
- **Today** — one list: tasks due within a week, assessments due within a week, and cards due for review. Ten rows, then a link to the rest.
- **Wall-clock timer** — elapsed time is derived from a persisted start, so backgrounding the tab or locking the phone cannot drift it. One running session maximum, enforced by the database.
- **Day boundary at 03:00** — a 1am session belongs to the day you are living, not tomorrow.
- **Courses and grades** — weighted assessments and a target calculator: what you need on what is left, what is out of reach, and a warning when the weights do not add to 100.
- **Review** — three-button spaced repetition (again / good / easy), so practice testing is one tap away.
- **Learning log** — what you actually did, grouped by month, exportable as Markdown.
- **Inline demo data** — Environmental Studies (MU, SY Sem II), six modules.

## Running

```bash
npm install
cp .env.example .env.local   # optional: set APP_PASSCODE
npm run dev
```

Without `APP_PASSCODE` the gate is off: deliberate, for local development.

```bash
npm test        # day-boundary, triage, target-grade and review-scheduling maths
npm run build
```

## Screens

`/` Today · `/study` timer, subjects, review · `/tasks` everything captured ·
`/grades` courses and assessments · `/review` cards · `/log` learning log ·
`/settings`

## Storage

Defaults to a local JSON file at `.data/db.json` so the app boots with no setup.

For real data, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` and run `supabase/schema.sql`. RLS is enabled with **no policies**, so the anon key can read nothing; the server uses the service-role key only. That is what keeps a public deployment private without building an auth system for one person.

## Design

Newsreader for display, Geist for everything else, tabular figures on every number. Paper `#FAF8F3`, ink `#14130F`, one accent (oxblood) reserved for urgency. Hairlines instead of shadows, glass only on the tab bar, 8pt spacing, 48dp touch targets.

## Adding a subject

Edit `content/subjects.json`. Each section needs `marks` (what a question carries) and `papers` (how many of the last 10 asked it). Those two numbers are the entire priority engine.
