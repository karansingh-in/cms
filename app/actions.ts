"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionToken } from "@/lib/auth";
import { addDays, studyDay } from "@/lib/day";
import { schedule, type Grade } from "@/lib/srs";
import { store } from "@/lib/store";

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const num = (fd: FormData, key: string): number | null => {
  const raw = text(fd, key);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

function refresh(...paths: string[]) {
  for (const p of ["/", ...paths]) revalidatePath(p);
}

// --- sessions -------------------------------------------------------------

export async function startSession(formData: FormData) {
  await store.startSession(text(formData, "subject") || null);
  revalidatePath("/", "layout");
}

export async function stopSession() {
  await store.stopSession();
  revalidatePath("/", "layout");
}

// --- tasks ----------------------------------------------------------------

export async function addTask(formData: FormData) {
  const title = text(formData, "title");
  if (!title) return;
  await store.addTask(title, text(formData, "course") || null, text(formData, "dueDay") || null);
  refresh("/tasks");
}

export async function toggleTask(formData: FormData) {
  await store.toggleTask(text(formData, "id"), text(formData, "done") === "1");
  refresh("/tasks");
}

export async function removeTask(formData: FormData) {
  await store.removeTask(text(formData, "id"));
  refresh("/tasks");
}

// --- courses --------------------------------------------------------------

export async function addCourse(formData: FormData) {
  const name = text(formData, "name");
  if (!name) return;
  await store.addCourse(name, num(formData, "credits") ?? 0, num(formData, "target"));
  refresh("/grades");
}

export async function setCourseTarget(formData: FormData) {
  await store.setCourseTarget(text(formData, "id"), num(formData, "target"));
  refresh("/grades");
}

export async function removeCourse(formData: FormData) {
  await store.removeCourse(text(formData, "id"));
  refresh("/grades");
}

// --- assessments ----------------------------------------------------------

export async function addAssessment(formData: FormData) {
  const title = text(formData, "title");
  const courseId = text(formData, "courseId");
  if (!title || !courseId) return;
  await store.addAssessment({
    courseId,
    title,
    weight: num(formData, "weight") ?? 0,
    score: num(formData, "score"),
    max: num(formData, "max") ?? 100,
    dueDay: text(formData, "dueDay") || null,
  });
  refresh("/grades", `/grades/${courseId}`);
}

export async function setScore(formData: FormData) {
  const courseId = text(formData, "courseId");
  await store.setScore(text(formData, "id"), num(formData, "score"));
  refresh("/grades", `/grades/${courseId}`);
}

export async function removeAssessment(formData: FormData) {
  const courseId = text(formData, "courseId");
  await store.removeAssessment(text(formData, "id"));
  refresh("/grades", `/grades/${courseId}`);
}

// --- cards ----------------------------------------------------------------

export async function addCard(formData: FormData) {
  const front = text(formData, "front");
  const back = text(formData, "back");
  if (!front || !back) return;
  await store.addCard(front, back, text(formData, "course") || null);
  refresh("/review");
}

export async function gradeCard(formData: FormData) {
  const cardId = text(formData, "id");
  const grade = text(formData, "grade") as Grade;
  const card = (await store.listCards()).find((c) => c.id === cardId);
  if (!card) return;
  const next = schedule({ interval: card.interval, ease: card.ease }, grade);
  await store.saveSchedule(cardId, next.interval, next.ease, addDays(studyDay(), next.interval));
  refresh("/review");
}

export async function removeCard(formData: FormData) {
  await store.removeCard(text(formData, "id"));
  refresh("/review");
}

// --- log ------------------------------------------------------------------

export async function addLog(formData: FormData) {
  const entry = text(formData, "text");
  if (!entry) return;
  await store.addLog(entry, text(formData, "category") || "Study", text(formData, "link") || null, text(formData, "day") || studyDay());
  refresh("/log");
}

export async function removeLog(formData: FormData) {
  await store.removeLog(text(formData, "id"));
  refresh("/log");
}

// --- auth -----------------------------------------------------------------

export async function unlock(formData: FormData) {
  const passcode = process.env.APP_PASSCODE ?? "";
  if (!passcode || text(formData, "passcode") === passcode) {
    (await cookies()).set("cms", await sessionToken(passcode), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    redirect("/");
  }
  redirect("/unlock?error=1");
}

export async function lock() {
  (await cookies()).delete("cms");
  redirect("/unlock");
}
