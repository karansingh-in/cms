import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubject } from "@/lib/content";
import { dayLabel, daysUntil, formatDuration } from "@/lib/day";
import { buildTriage } from "@/lib/triage";

export default async function SubjectPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const subject = getSubject(code);
  if (!subject) notFound();

  return (
    <main className="pt-6">
      <Link href="/study" className="text-[13px] text-ink-3">
        Study
      </Link>

      <h1 className="mt-4 font-display text-[32px] leading-[1.1] tracking-[-0.02em]">{subject.name}</h1>
      <p className="mt-2 text-[13px] text-ink-2">
        {subject.year} · Semester {["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"][subject.sem]} · {subject.credits} credits
      </p>
      <p className="tabular mt-1 text-[13px] text-ink-3">
        Exam {dayLabel(subject.examDate)} · {Math.max(0, daysUntil(subject.examDate))} days
      </p>

      <ul className="mt-8">
        {subject.modules.map((m) => {
          const t = buildTriage(m.sections);
          const high = t.rows.filter((r) => r.priority === "high").length;
          return (
            <li key={m.no}>
              <Link
                href={`/study/${subject.code}/${m.no}`}
                className="press block border-b border-rule py-4"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-[15px]">
                    <span className="tabular mr-2 text-ink-3">{m.no}</span>
                    {m.title}
                  </p>
                  <span className="tabular shrink-0 text-[13px] text-ink-3">{formatDuration(t.totalMinutes)}</span>
                </div>
                <p className="mt-1 text-[12px] text-ink-2">
                  {m.sections.length} sections · {high} high priority
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
