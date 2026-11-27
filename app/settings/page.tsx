import Link from "next/link";
import { cookies } from "next/headers";
import { lock, setName, setTheme } from "@/app/actions";
import PushToggle from "@/components/push-toggle";
import { listSubjects } from "@/lib/content";
import { dayLabel } from "@/lib/day";
import { pushConfigured } from "@/lib/push";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Settings() {
  const [cookieStore, name, subjects] = await Promise.all([cookies(), store.name(), listSubjects()]);
  const dark = cookieStore.get("theme")?.value !== "light";
  const rows = [
    ["Passcode", process.env.APP_PASSCODE ? "On" : "Off"],
    ["Timezone", process.env.APP_TZ ?? "Asia/Kolkata"],
    ["Day rolls at", "01:30"],
    ["Storage", process.env.SUPABASE_URL ? "Supabase" : "Local file"],
  ];

  return (
    <main className="pt-6">
      <h1 className="font-display text-[34px] leading-[1.05] tracking-[-0.02em]">Settings</h1>

      <section className="mt-8" aria-labelledby="you">
        <h2 id="you" className="text-[10px] uppercase tracking-[0.16em] text-ink-3">
          You
        </h2>
        <form action={setName} className="mt-2 flex gap-2">
          <input
            name="name"
            defaultValue={name}
            placeholder="Your name"
            aria-label="Your name"
            className="min-w-0 flex-1 rounded-[10px] border border-rule bg-ash px-3 py-2.5 text-[14px]"
          />
          <button className="press rounded-[10px] border border-rule px-4 text-[13px] text-ink-2">Save</button>
        </form>
      </section>

      <section className="mt-8" aria-labelledby="appearance">
        <h2 id="appearance" className="text-[10px] uppercase tracking-[0.16em] text-ink-3">
          Appearance
        </h2>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {[
            { value: "light", label: "Paper" },
            { value: "dark", label: "Black" },
          ].map((option) => {
            const active = (option.value === "dark") === dark;
            return (
              <form key={option.value} action={setTheme}>
                <input type="hidden" name="theme" value={option.value} />
                <button
                  aria-pressed={active}
                  className={`press w-full rounded-[10px] border py-3 text-[14px] ${
                    active ? "border-ink bg-ink text-paper" : "border-rule text-ink-2"
                  }`}
                >
                  {option.label}
                </button>
              </form>
            );
          })}
        </div>
      </section>

      <section className="mt-8" aria-labelledby="alerts">
        <h2 id="alerts" className="text-[10px] uppercase tracking-[0.16em] text-ink-3">
          Alerts
        </h2>
        <div className="mt-1">
          <PushToggle configured={pushConfigured()} />
        </div>
      </section>

      <dl className="mt-8">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between border-b border-rule py-3.5">
            <dt className="text-[14px] text-ink-2">{label}</dt>
            <dd className="text-[14px]">{value}</dd>
          </div>
        ))}
      </dl>

      <Link
        href="/widget"
        className="press mt-8 flex items-center justify-between border-y border-rule py-3.5 text-[14px]"
      >
        Home screen widget
        <span className="text-[12px] text-ink-3">Preview</span>
      </Link>

      <section className="mt-8" aria-labelledby="exams">
        <h2 id="exams" className="text-[10px] uppercase tracking-[0.16em] text-ink-3">
          Exam dates
        </h2>
        <ul className="mt-1">
          {subjects.map((s) => (
            <li key={s.id} className="flex items-baseline justify-between border-b border-rule py-3.5">
              <span className="min-w-0 truncate text-[14px]">{s.name}</span>
              <span className="tabular shrink-0 text-[13px] text-ink-2">{dayLabel(s.examDate)}</span>
            </li>
          ))}
        </ul>
      </section>

      <form action={lock} className="mt-10">
        <button className="press w-full rounded-[10px] border border-rule py-3 text-[14px]">Lock</button>
      </form>
    </main>
  );
}
