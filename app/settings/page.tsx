import { lock } from "@/app/actions";
import { listSubjects } from "@/lib/content";
import { dayLabel } from "@/lib/day";

export default function Settings() {
  const subjects = listSubjects();
  const rows = [
    ["Passcode", process.env.APP_PASSCODE ? "On" : "Off"],
    ["Timezone", process.env.APP_TZ ?? "Asia/Kolkata"],
    ["Day starts", "03:00"],
    ["Storage", process.env.SUPABASE_URL ? "Supabase" : "Local file"],
  ];

  return (
    <main className="pt-6">
      <h1 className="font-display text-[34px] leading-[1.05] tracking-[-0.02em]">Settings</h1>

      <dl className="mt-8">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between border-b border-rule py-3.5">
            <dt className="text-[14px] text-ink-2">{label}</dt>
            <dd className="text-[14px]">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-10" aria-labelledby="exams">
        <h2 id="exams" className="text-[11px] uppercase tracking-[0.14em] text-ink-3">
          Exam dates
        </h2>
        <ul className="mt-1">
          {subjects.map((s) => (
            <li key={s.code} className="flex items-baseline justify-between border-b border-rule py-3.5">
              <span className="text-[14px]">{s.name}</span>
              <span className="tabular text-[13px] text-ink-2">{dayLabel(s.examDate)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[12px] text-ink-3">Edit exam dates and syllabus in content/subjects.json.</p>
      </section>

      <form action={lock} className="mt-10">
        <button className="press w-full rounded-[10px] border border-rule py-3 text-[14px]">Lock</button>
      </form>
    </main>
  );
}
