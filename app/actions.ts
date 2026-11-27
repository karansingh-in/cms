"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionToken } from "@/lib/auth";
import { studyDay } from "@/lib/day";
import { store, type Project } from "@/lib/store";

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

// --- log ------------------------------------------------------------------

export async function addLog(formData: FormData) {
  const entry = text(formData, "text");
  if (!entry) return;
  await store.addLog(
    entry,
    text(formData, "category") || "Study",
    text(formData, "link") || null,
    text(formData, "day") || studyDay(),
  );
  refresh("/log", "/library");
}

export async function removeLog(formData: FormData) {
  await store.removeLog(text(formData, "id"));
  refresh("/log");
}

// --- semesters -------------------------------------------------------------

export async function saveSemesters(formData: FormData) {
  await store.setCgpaTarget(num(formData, "target"));
  for (let n = 1; n <= 8; n++) {
    const credits = num(formData, `credits_${n}`);
    const sgpa = num(formData, `sgpa_${n}`);
    if (credits === null && sgpa === null) continue;
    await store.setSemester(n, credits ?? 0, sgpa === null ? null : Math.min(10, Math.max(0, sgpa)));
  }
  refresh("/grades");
}

// --- self-study courses ----------------------------------------------------

export async function addSelfCourse(formData: FormData) {
  const title = text(formData, "title");
  if (!title) return;
  await store.addSelfCourse({
    code: text(formData, "code") || title.slice(0, 8).toUpperCase(),
    title,
    source: text(formData, "source") || "Self-study",
    link: text(formData, "link") || null,
    units: Math.max(1, num(formData, "units") ?? 1),
    done: 0,
  });
  refresh("/study");
}

export async function bumpSelfCourse(formData: FormData) {
  const courseId = text(formData, "id");
  const by = num(formData, "by") ?? 0;
  const course = (await store.listSelfCourses()).find((c) => c.id === courseId);
  if (!course) return;
  await store.setSelfCourseDone(courseId, course.done + by);
  refresh("/study");
}

export async function removeSelfCourse(formData: FormData) {
  await store.removeSelfCourse(text(formData, "id"));
  refresh("/study");
}

// --- subjects --------------------------------------------------------------

export async function addSubject(formData: FormData) {
  const name = text(formData, "name");
  const code = text(formData, "code");
  const examDate = text(formData, "examDate");
  if (!name || !code || !examDate) return;
  const topics = text(formData, "topics")
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean);
  await store.addSubject(name, code, examDate, num(formData, "credits") ?? 0, topics);
  refresh("/study");
}

export async function removeSubject(formData: FormData) {
  await store.removeSubject(text(formData, "id"));
  refresh("/study");
}

// --- projects --------------------------------------------------------------

export async function addProject(formData: FormData) {
  const name = text(formData, "name");
  if (!name) return;
  await store.addProject(
    name,
    (text(formData, "status") || "idea") as Project["status"],
    text(formData, "link") || null,
    text(formData, "note") || null,
  );
  refresh("/library");
}

export async function setProjectStatus(formData: FormData) {
  await store.setProjectStatus(text(formData, "id"), text(formData, "status") as Project["status"]);
  refresh("/library");
}

export async function removeProject(formData: FormData) {
  await store.removeProject(text(formData, "id"));
  refresh("/library");
}

// --- links -----------------------------------------------------------------

export async function addLink(formData: FormData) {
  const title = text(formData, "title");
  const url = text(formData, "url");
  if (!title || !url) return;
  await store.addLink(title, url, text(formData, "tag") || null);
  refresh("/library");
}

export async function removeLink(formData: FormData) {
  await store.removeLink(text(formData, "id"));
  refresh("/library");
}

// --- syllabus progress -----------------------------------------------------

export async function toggleSection(formData: FormData) {
  const key = text(formData, "key");
  if (!key) return;
  await store.toggleSection(key, text(formData, "done") === "1");
  revalidatePath("/", "layout");
}

// --- profile ---------------------------------------------------------------

export async function setName(formData: FormData) {
  await store.setName(text(formData, "name"));
  revalidatePath("/", "layout");
}

// --- theme -----------------------------------------------------------------

export async function setTheme(formData: FormData) {
  const theme = text(formData, "theme") === "dark" ? "dark" : "light";
  (await cookies()).set("theme", theme, {
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  revalidatePath("/", "layout");
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
