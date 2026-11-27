import { NextResponse } from "next/server";
import { addDays, dayLabel, daysUntil, studyDay } from "@/lib/day";
import { sendPush } from "@/lib/push";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

function allowed(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

/** 01:00 local: what is still due, and what you got through today. */
export async function GET(request: Request) {
  if (!allowed(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const today = studyDay();
  const horizon = addDays(today, 10);
  const [tasks, assessments, courses, logs] = await Promise.all([
    store.listTasks(),
    store.listAssessments(),
    store.listCourses(),
    store.logsOn(today),
  ]);

  const due = [
    ...tasks.filter((t) => !t.done && t.dueDay && t.dueDay <= horizon).map((t) => `${t.title} · ${short(t.dueDay!)}`),
    ...assessments
      .filter((a) => a.score === null && a.dueDay && a.dueDay <= horizon)
      .map((a) => `${a.title} · ${short(a.dueDay!)}`),
  ];

  const body = [
    due.length ? `Due: ${due.slice(0, 4).join(" · ")}${due.length > 4 ? ` +${due.length - 4}` : ""}` : "Nothing due.",
    logs.length ? `Today: ${logs.map((l) => l.text).slice(0, 3).join(" · ")}` : "Nothing logged today.",
  ].join("\n");

  const sent = await sendPush({ title: "Wind down", body, url: "/" });
  return NextResponse.json({ sent, due: due.length, logged: logs.length });
}

function short(day: string): string {
  const d = daysUntil(day);
  if (d === 0) return "today";
  if (d === 1) return "tomorrow";
  return dayLabel(day);
}
