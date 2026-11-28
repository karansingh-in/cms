# Synesis

σύνεσις — understanding, from bringing things together.

A private, single-user study app for university papers. One person, one phone.

It answers one question: **given the time you have, what should you actually study?**

## What it does

- **Triage** — every section of a module ranked by `marks x how often the paper asks`. Priority is arithmetic against a past-paper record, not an LLM's opinion. It also tells you what to skip and what that risks.
- **Capture in two taps** — the `+` in the tab bar takes either a due item or a log entry. Date chips set the due day. Late work is grey, never red.
- **Today** — a log heatmap (GitHub's contribution grid), self-study directly under it, due items inside ten days with one-tap done, the project you are building, and the CGPA line.
- **Log** — what you actually did, one line at a time, grouped by month, with a heatmap and Markdown / PDF export. The day rolls at **01:30**, so a 1am entry belongs to the day you are living.
- **Self-study** — courses taken for knowledge, not marks. `−` and `+` per course, delete behind a confirm, exportable alongside the log.
- **Courses and grades** — weighted assessments and a target calculator: what you need on what is left, what is out of reach, and a warning when the weights do not add to 100. The required SGPA for the rest of the degree updates as you type.
- **Notifications** — a 00:30 nudge only when nothing was logged, and a 01:00 wind-down with what is still due and what you got through.
- **Widgets** — `/widget` holds the 2×2 and 4×2 home-screen designs to rebuild in Scriptable or KWGT.
- **Inline demo data** — Environmental Studies (MU, SY Sem II), six modules.

## Running

```bash
npm install
cp .env.example .env.local   # optional: set APP_PASSCODE
npm run dev
```

Without `APP_PASSCODE` the gate is off: deliberate, for local development.

```bash
npm test        # day-boundary, triage, target-grade and CGPA maths
npm run build
```

Push notifications need VAPID keys: `npx web-push generate-vapid-keys`, then put both keys in `.env.local`. The cron routes (`/api/cron/reminder`, `/api/cron/nightly`) are wired in `vercel.json` and protected by `CRON_SECRET`.

## Screens

`/` Today · `/log` learning log · `/study` timer, subjects, self-study ·
`/tasks` everything captured · `/grades` courses, assessments, CGPA ·
`/library` projects and links · `/widget` · `/settings`

## Storage

Defaults to a local JSON file at `.data/db.json` so the app boots with no setup.

For real data, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` and run `supabase/schema.sql`. RLS is enabled with **no policies**, so the anon key can read nothing; the server uses the service-role key only. That is what keeps a public deployment private without building an auth system for one person.

## Design

Newsreader for display, Geist for everything else, tabular figures on every number. True black by default (this is an OLED phone), warm paper as the option. Cardinal `#8C1515` is the single accent, with warm clay and cool steel only where two things must be told apart. The log is a bare grid: no legend, no counters. Hairlines instead of shadows, no glass, 8pt spacing, 44dp touch targets.

## Adding a subject

Use the `+` on Study, or edit `content/subjects.json`. Each section needs `marks` (what a question carries) and `papers` (how many of the last 10 asked it). Those two numbers are the entire priority engine.
