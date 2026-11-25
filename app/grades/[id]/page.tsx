import Link from "next/link";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { addAssessment, removeAssessment, removeCourse, setCourseTarget, setScore } from "@/app/actions";
import { formatPercent, targetScore, weightedAverage } from "@/lib/calc";
import { dayLabel } from "@/lib/day";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const courses = await store.listCourses();
  const course = courses.find((c) => c.id === id);
  if (!course) notFound();

  const assessments = (await store.listAssessments()).filter((a) => a.courseId === id);
  const items = assessments.map((a) => ({ weight: a.weight, score: a.score, max: a.max }));
  const avg = weightedAverage(items);
  const target = course.target === null ? null : targetScore(items, course.target);
  const best = target ? target.earned + target.remainingWeight : 0;

  return (
    <main className="pt-6">
      <Link href="/grades" className="text-[13px] text-ink-3">
        Grades
      </Link>

      <h1 className="mt-4 font-display text-[30px] leading-[1.1] tracking-[-0.02em]">{course.name}</h1>
      <p className="tabular mt-2 text-[13px] text-ink-2">
        {avg === null ? "Nothing marked yet" : `${formatPercent(avg)} so far`}
        {course.credits > 0 && ` · ${course.credits} credits`}
      </p>

      <section className="mt-6 rounded-[12px] bg-ash p-4" aria-labelledby="target">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="target" className="text-[11px] uppercase tracking-[0.14em] text-ink-3">
            Target
          </h2>
          <form action={setCourseTarget} className="flex items-center gap-2">
            <input type="hidden" name="id" value={course.id} />
            <input
              name="target"
              type="number"
              min={0}
              max={100}
              defaultValue={course.target ?? ""}
              placeholder="—"
              aria-label="Target percent"
              className="tabular w-16 rounded-[8px] border border-rule bg-paper px-2 py-1 text-right text-[14px]"
            />
            <button className="press text-[12px] text-ink-2 underline underline-offset-4">Set</button>
          </form>
        </div>

        <p className="mt-3 text-[14px] leading-relaxed">
          {!target && "Set a target to see what the rest of the course has to deliver."}
          {target?.status === "none" && "Add an assessment below and the maths starts."}
          {target?.status === "reachable" && (
            <>
              You need <span className="tabular font-medium">{formatPercent(target.need!)}</span> across the remaining{" "}
              {formatPercent(target.remainingWeight)} of the course.
            </>
          )}
          {target?.status === "unreachable" && (
            <>
              {formatPercent(course.target!)} is out of reach. The most you can finish on is{" "}
              <span className="tabular font-medium">{formatPercent(best)}</span>.
            </>
          )}
          {target?.status === "secured" && (
            <>
              Secured. {formatPercent(target.earned)} is already banked against a {formatPercent(course.target!)} target.
            </>
          )}
          {target?.status === "no-remaining" && <>Everything is marked. Final: {formatPercent(target.earned)}.</>}
        </p>

        {target && Math.abs(target.weightTotal - 100) > 0.01 && (
          <p className="tabular mt-2 text-[12px] text-ochre">
            Weights add up to {formatPercent(target.weightTotal)}, not 100%.
          </p>
        )}
      </section>

      <section className="mt-8" aria-labelledby="assessments">
        <h2 id="assessments" className="text-[11px] uppercase tracking-[0.14em] text-ink-3">
          Assessments
        </h2>

        <ul className="mt-1">
          {assessments.map((a) => (
            <li key={a.id} className="flex items-center gap-2 border-b border-rule py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px]">{a.title}</p>
                <p className="tabular text-[12px] text-ink-3">
                  {a.weight}% of the course
                  {a.dueDay ? ` · due ${dayLabel(a.dueDay)}` : ""}
                </p>
              </div>
              <form action={setScore} className="flex items-center gap-1.5">
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="courseId" value={course.id} />
                <input
                  name="score"
                  type="number"
                  step="0.5"
                  min={0}
                  defaultValue={a.score ?? ""}
                  placeholder="—"
                  aria-label={`Score for ${a.title}`}
                  className="tabular w-14 rounded-[8px] border border-rule bg-paper px-2 py-1 text-right text-[14px]"
                />
                <span className="tabular text-[12px] text-ink-3">/{a.max}</span>
                <button className="press px-1 text-[12px] text-ink-2 underline underline-offset-4">Save</button>
              </form>
              <form action={removeAssessment}>
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="courseId" value={course.id} />
                <button aria-label={`Delete ${a.title}`} className="press p-1 text-ink-3">
                  <Trash2 size={14} strokeWidth={1.5} aria-hidden />
                </button>
              </form>
            </li>
          ))}
        </ul>

        {assessments.length === 0 && <p className="mt-2 text-[13px] text-ink-2">None yet.</p>}

        <form action={addAssessment} className="mt-4 space-y-2 rounded-[12px] bg-ash p-4">
          <input type="hidden" name="courseId" value={course.id} />
          <input
            name="title"
            required
            placeholder="Assessment name"
            aria-label="Assessment name"
            className="w-full rounded-[10px] border border-rule bg-paper px-3 py-2.5 text-[14px]"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              name="weight"
              type="number"
              min={0}
              max={100}
              required
              placeholder="Weight"
              aria-label="Weight"
              className="tabular w-full rounded-[10px] border border-rule bg-paper px-3 py-2.5 text-[14px]"
            />
            <input
              name="score"
              type="number"
              step="0.5"
              min={0}
              placeholder="Score"
              aria-label="Score"
              className="tabular w-full rounded-[10px] border border-rule bg-paper px-3 py-2.5 text-[14px]"
            />
            <input
              name="max"
              type="number"
              min={1}
              defaultValue={100}
              placeholder="Out of"
              aria-label="Out of"
              className="tabular w-full rounded-[10px] border border-rule bg-paper px-3 py-2.5 text-[14px]"
            />
          </div>
          <input
            name="dueDay"
            type="date"
            aria-label="Due date"
            className="tabular w-full rounded-[10px] border border-rule bg-paper px-3 py-2.5 text-[14px]"
          />
          <button className="press w-full rounded-[10px] bg-ink py-3 text-[14px] font-medium text-paper">Add</button>
        </form>
      </section>

      <form action={removeCourse} className="mt-10">
        <input type="hidden" name="id" value={course.id} />
        <button className="press w-full rounded-[10px] border border-rule py-3 text-[14px] text-ink-2">
          Delete course
        </button>
      </form>
    </main>
  );
}
