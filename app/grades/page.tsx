import Link from "next/link";
import { Plus } from "lucide-react";
import { addCourse } from "@/app/actions";
import { formatPercent, targetScore, weightedAverage } from "@/lib/calc";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Grades() {
  const [courses, assessments] = await Promise.all([store.listCourses(), store.listAssessments()]);

  return (
    <main className="pt-6">
      <h1 className="font-display text-[34px] leading-[1.05] tracking-[-0.02em]">Grades</h1>
      <p className="mt-2 text-[13px] text-ink-2">
        {courses.length === 0 ? "No courses yet." : `${courses.length} courses tracked.`}
      </p>

      <details className="mt-6 rounded-[12px] bg-ash">
        <summary className="press flex cursor-pointer list-none items-center gap-2 px-4 py-3.5 text-[14px] font-medium">
          <Plus size={16} strokeWidth={1.5} aria-hidden />
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

      <ul className="mt-6">
        {courses.map((course) => {
          const items = assessments
            .filter((a) => a.courseId === course.id)
            .map((a) => ({ weight: a.weight, score: a.score, max: a.max }));
          const avg = weightedAverage(items);
          const target = course.target === null ? null : targetScore(items, course.target);

          return (
            <li key={course.id} className="border-b border-rule">
              <Link href={`/grades/${course.id}`} className="press block py-4">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="min-w-0 truncate text-[15px]">{course.name}</p>
                  <span className="tabular shrink-0 text-[15px]">
                    {avg === null ? "—" : formatPercent(avg)}
                  </span>
                </div>
                <p className="tabular mt-0.5 text-[12px] text-ink-3">
                  {course.credits > 0 && `${course.credits} credits · `}
                  {items.length} assessments
                  {target?.status === "reachable" && ` · need ${formatPercent(target.need!)} on the rest`}
                  {target?.status === "unreachable" && ` · ${formatPercent(course.target!)} out of reach`}
                  {target?.status === "secured" && " · target secured"}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
