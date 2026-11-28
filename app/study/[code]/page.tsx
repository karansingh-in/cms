import Link from "next/link";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { removeSubject } from "@/app/actions";
import ConfirmSubmit from "@/components/confirm-submit";
import { getSubject } from "@/lib/content";
import { dayLabel, daysUntil, formatDuration, ROMAN } from "@/lib/day";
import { coverage, sectionKey } from "@/lib/progress";
import { store } from "@/lib/store";
import { buildTriage } from "@/lib/triage";

export const dynamic = "force-dynamic";

export default async function SubjectPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const subject = await getSubject(code);
  if (!subject) notFound();

  const done = await store.doneSections();
  const cov = coverage(subject, done);

  return (
    <main className="pt-7">
      <div className="flex items-center justify-between">
        <Link href="/study" className="text-[13px] text-ink-3">
          Study
        </Link>
        <form action={removeSubject}>
          <input type="hidden" name="id" value={subject.id} />
          <ConfirmSubmit
            label={`Delete ${subject.name}`}
            message={`Delete "${subject.name}" and its topics?`}
            className="press grid size-9 place-items-center text-ink-3"
          >
            <Trash2 size={15} strokeWidth={1.6} aria-hidden />
          </ConfirmSubmit>
        </form>
      </div>

      <h1 className="mt-4 font-display text-[32px] leading-[1.1] tracking-[-0.02em]">{subject.name}</h1>
      <p className="mt-2 text-[13px] text-ink-2">
        {subject.code}
        {subject.year && ` · ${subject.year}`}
        {subject.sem > 0 && ` · Sem ${ROMAN[subject.sem]}`}
        {subject.credits > 0 && ` · ${subject.credits} credits`}
      </p>
      <p className="tabular mt-1 text-[13px] text-ink-3">
        Exam {dayLabel(subject.examDate)} · {Math.max(0, daysUntil(subject.examDate))} days
      </p>

      <div className="mt-5 flex items-center gap-3">
        <span className="relative h-[5px] flex-1 overflow-hidden rounded-full bg-rule" aria-hidden>
          <span className="absolute inset-y-0 left-0 rounded-full bg-accent" style={{ width: `${Math.round(cov.share * 100)}%` }} />
        </span>
        <span className="tabular shrink-0 text-[12px] text-ink-3">
          {cov.doneSections}/{cov.sections} sections
        </span>
      </div>

      {subject.modules.length === 0 ? (
        <p className="mt-8 text-[13px] text-ink-2">No topics yet.</p>
      ) : (
        <ul className="mt-8">
          {subject.modules.map((m) => {
            const t = buildTriage(m.sections);
            const moduleDone = m.sections.filter((s) => done.has(sectionKey(subject.code, s.id))).length;
            return (
              <li key={m.no}>
                <Link href={`/study/${subject.code}/${m.no}`} className="press block border-b border-rule py-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="min-w-0 text-[15px]">
                      <span className="tabular mr-2 text-ink-3">{m.no}</span>
                      {m.title}
                    </p>
                    <span className="tabular shrink-0 text-[12px] text-ink-3">{formatDuration(t.totalMinutes)}</span>
                  </div>
                  <p className="tabular mt-1 text-[11px] text-ink-2">
                    {moduleDone}/{m.sections.length} done
                    {moduleDone === m.sections.length && m.sections.length > 0 ? " · finished" : ""}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
