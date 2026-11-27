import Link from "next/link";
import { Plus } from "lucide-react";
import { addCourse } from "@/app/actions";
import CgpaForm from "@/components/cgpa-form";
import { formatGpa, standing } from "@/lib/cgpa";
import { formatPercent, targetScore, weightedAverage } from "@/lib/calc";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Grades() {
  const [courses, assessments, semesters, target] = await Promise.all([
    store.listCourses(),
    store.listAssessments(),
    store.listSemesters(),
    store.cgpaTarget(),
  ]);

  const st = standing(semesters, target);

  return (
    <main className="pt-6">
      <h1 className="font-display text-[34px] leading-[1.05] tracking-[-0.02em]">Grades</h1>

      <section className="mt-6" aria-labelledby="cgpa">
        <div className="flex items-end justify-between gap-4">
          <h2 id="cgpa" className="text-[10px] uppercase tracking-[0.16em] text-ink-3">
            CGPA
          </h2>
          <span className="text-[11px] text-ink-3">
            {target === null ? "no target" : `target ${formatGpa(target)}`}
          </span>
        </div>
        <p className="mt-1 flex items-baseline gap-1.5">
          <span className="tabular font-display text-[52px] leading-none tracking-[-0.02em]">
            {st.cgpa === null ? "—" : formatGpa(st.cgpa)}
          </span>
          <span className="text-[13px] text-ink-3">/10</span>
        </p>

        <CgpaForm semesters={semesters} target={target} />
      </section>

      <section className="mt-10" aria-labelledby="courses">
        <h2 id="courses" className="text-[10px] uppercase tracking-[0.16em] text-ink-3">
          This semester
        </h2>

        <details className="tile mt-2">
          <summary className="press flex cursor-pointer list-none items-center gap-2 px-4 py-3.5 text-[14px] font-medium">
            <Plus size={16} strokeWidth={1.8} aria-hidden />
            Add course
          </summary>
          <form action={addCourse} className="space-y-2 px-4 pb-4">
            <input
              name="name"
              required
              placeholder="Course name"
              aria-label="Course name"
              className="w-full rounded-[10px] border border-rule bg-paper px-3 py-2.5 text-[14px]"
            />
            <div className="grid grid-cols-[1fr_96px] gap-2">
              <input
                name="target"
                type="number"
                min={0}
                max={100}
                placeholder="Target %"
                aria-label="Target percent"
                className="tabular w-full rounded-[10px] border border-rule bg-paper px-3 py-2.5 text-[14px]"
              />
              <input
                name="credits"
                type="number"
                min={0}
                placeholder="Credits"
                aria-label="Credits"
                className="tabular w-full rounded-[10px] border border-rule bg-paper px-3 py-2.5 text-[14px]"
              />
            </div>
            <button className="press w-full rounded-[10px] bg-ink py-3 text-[14px] font-medium text-paper">Add</button>
          </form>
        </details>

        {courses.length === 0 ? (
          <p className="mt-4 text-[13px] text-ink-2">No courses yet.</p>
        ) : (
          <ul className="mt-2">
            {courses.map((course) => {
              const items = assessments
                .filter((a) => a.courseId === course.id)
                .map((a) => ({ weight: a.weight, score: a.score, max: a.max }));
              const avg = weightedAverage(items);
              const goal = course.target === null ? null : targetScore(items, course.target);

              return (
                <li key={course.id} className="border-b border-rule">
                  <Link href={`/grades/${course.id}`} className="press block py-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="min-w-0 truncate text-[15px]">{course.name}</p>
                      <span className="tabular shrink-0 text-[15px]">{avg === null ? "—" : formatPercent(avg)}</span>
                    </div>
                    <p className="tabular mt-0.5 text-[11px] text-ink-3">
                      {course.credits > 0 && `${course.credits} credits · `}
                      {items.length} assessments
                      {goal?.status === "reachable" && ` · need ${formatPercent(goal.need!)} on the rest`}
                      {goal?.status === "unreachable" && ` · ${formatPercent(course.target!)} out of reach`}
                      {goal?.status === "secured" && " · target secured"}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
