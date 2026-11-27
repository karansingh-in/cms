import fs from "node:fs/promises";
import path from "node:path";
import seed from "@/content/subjects.json";
import { studyDay } from "./day";
import type { Section } from "./triage";

export type Session = {
  id: string;
  subject: string | null;
  startedAt: string;
  endedAt: string | null;
  studyDay: string;
};

export type Task = {
  id: string;
  title: string;
  course: string | null;
  dueDay: string | null;
  done: boolean;
};

export type Course = { id: string; name: string; credits: number; target: number | null };

export type Assessment = {
  id: string;
  courseId: string;
  title: string;
  weight: number;
  score: number | null;
  max: number;
  dueDay: string | null;
};

export type LogEntry = { id: string; text: string; category: string; link: string | null; day: string };

/** One university semester. sgpa stays null until the result is out. */
export type Semester = { id: string; number: number; credits: number; sgpa: number | null };

/** A course taken for knowledge, not marks: Stanford CS161, a textbook, a MOOC. */
export type SelfCourse = {
  id: string;
  code: string;
  title: string;
  source: string;
  link: string | null;
  units: number;
  done: number;
};

export type Project = {
  id: string;
  name: string;
  status: "idea" | "building" | "shipped";
  link: string | null;
  note: string | null;
};

export type LinkItem = { id: string; title: string; url: string; tag: string | null };

export type Module = { no: number; title: string; sections: Section[] };
export type Subject = {
  id: string;
  code: string;
  name: string;
  year: string;
  sem: number;
  credits: number;
  examDate: string;
  modules: Module[];
};

export type PushSub = { id: string; endpoint: string; p256dh: string; auth: string };

type Doc = {
  sessions: Session[];
  tasks: Task[];
  courses: Course[];
  assessments: Assessment[];
  logs: LogEntry[];
  semesters: Semester[];
  selfCourses: SelfCourse[];
  projects: Project[];
  links: LinkItem[];
  subjects: Subject[];
  /** Section keys ("ES201:m1:s2") that are done. */
  sections: { key: string; day: string }[];
  /** The CGPA you are aiming at, out of 10. */
  cgpaTarget: number | null;
  /** Whose app this is. Empty means the greeting stands alone. */
  name: string;
  push: PushSub[];
};

const EMPTY: Doc = {
  sessions: [],
  tasks: [],
  courses: [],
  assessments: [],
  logs: [],
  semesters: [],
  selfCourses: [],
  projects: [],
  links: [],
  subjects: [],
  sections: [],
  cgpaTarget: null,
  name: "",
  push: [],
};

const SEMESTER_COUNT = 8;
const file = path.join(process.cwd(), ".data", "db.json");
const id = () => crypto.randomUUID();

/** The bundled syllabus becomes the first row of a database you can extend. */
function seedSubjects(): Subject[] {
  return (seed.subjects as Omit<Subject, "id">[]).map((s) => ({ ...s, id: id() }));
}

async function read(): Promise<Doc> {
  let doc: Doc;
  try {
    doc = { ...EMPTY, ...(JSON.parse(await fs.readFile(file, "utf8")) as Doc) };
  } catch {
    doc = { ...EMPTY };
  }
  if (doc.subjects.length === 0) doc.subjects = seedSubjects();
  return doc;
}

async function write(doc: Doc) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(doc, null, 2));
}

async function mutate<T>(fn: (doc: Doc) => T): Promise<T> {
  const doc = await read();
  const out = fn(doc);
  await write(doc);
  return out;
}

/** Eight empty semesters the first time the degree is opened. */
function seedSemesters(doc: Doc): Semester[] {
  if (doc.semesters.length === 0) {
    doc.semesters = Array.from({ length: SEMESTER_COUNT }, (_, i) => ({
      id: id(),
      number: i + 1,
      credits: 20,
      sgpa: null,
    }));
  }
  return doc.semesters.sort((a, b) => a.number - b.number);
}

export const store = {
  // sessions
  async running() {
    return (await read()).sessions.find((s) => !s.endedAt);
  },
  async sessionsOn(day: string) {
    return (await read()).sessions.filter((s) => s.studyDay === day && s.endedAt);
  },
  async sessionsSince(day: string) {
    return (await read()).sessions.filter((s) => s.studyDay >= day && s.endedAt);
  },
  async startSession(subject: string | null) {
    await mutate((doc) => {
      if (doc.sessions.some((s) => !s.endedAt)) return;
      doc.sessions.push({ id: id(), subject, startedAt: new Date().toISOString(), endedAt: null, studyDay: studyDay() });
    });
  },
  async stopSession() {
    await mutate((doc) => {
      const now = new Date().toISOString();
      doc.sessions.forEach((s) => {
        if (!s.endedAt) s.endedAt = now;
      });
    });
  },

  // tasks
  async listTasks() {
    return (await read()).tasks.sort((a, b) => (a.dueDay ?? "9999").localeCompare(b.dueDay ?? "9999"));
  },
  async addTask(title: string, course: string | null, dueDay: string | null) {
    await mutate((doc) => {
      doc.tasks.push({ id: id(), title, course, dueDay, done: false });
    });
  },
  async toggleTask(taskId: string, done: boolean) {
    await mutate((doc) => {
      const t = doc.tasks.find((x) => x.id === taskId);
      if (t) t.done = done;
    });
  },
  async removeTask(taskId: string) {
    await mutate((doc) => {
      doc.tasks = doc.tasks.filter((x) => x.id !== taskId);
    });
  },

  // courses
  async listCourses() {
    return (await read()).courses;
  },
  async addCourse(name: string, credits: number, target: number | null) {
    await mutate((doc) => {
      doc.courses.push({ id: id(), name, credits, target });
    });
  },
  async setCourseTarget(courseId: string, target: number | null) {
    await mutate((doc) => {
      const c = doc.courses.find((x) => x.id === courseId);
      if (c) c.target = target;
    });
  },
  async removeCourse(courseId: string) {
    await mutate((doc) => {
      doc.courses = doc.courses.filter((x) => x.id !== courseId);
      doc.assessments = doc.assessments.filter((a) => a.courseId !== courseId);
    });
  },

  // assessments
  async listAssessments() {
    return (await read()).assessments;
  },
  async addAssessment(a: Omit<Assessment, "id">) {
    await mutate((doc) => {
      doc.assessments.push({ ...a, id: id() });
    });
  },
  async setScore(assessmentId: string, score: number | null) {
    await mutate((doc) => {
      const a = doc.assessments.find((x) => x.id === assessmentId);
      if (a) a.score = score;
    });
  },
  async removeAssessment(assessmentId: string) {
    await mutate((doc) => {
      doc.assessments = doc.assessments.filter((x) => x.id !== assessmentId);
    });
  },

  // log
  async listLogs() {
    return (await read()).logs.sort((a, b) => b.day.localeCompare(a.day));
  },
  async logsOn(day: string) {
    return (await read()).logs.filter((l) => l.day === day);
  },
  async addLog(text: string, category: string, link: string | null, day: string) {
    await mutate((doc) => {
      doc.logs.push({ id: id(), text, category, link, day });
    });
  },
  async removeLog(logId: string) {
    await mutate((doc) => {
      doc.logs = doc.logs.filter((x) => x.id !== logId);
    });
  },

  // semesters
  async listSemesters() {
    return mutate((doc) => seedSemesters(doc));
  },
  async setSemester(number: number, credits: number, sgpa: number | null) {
    await mutate((doc) => {
      const s = seedSemesters(doc).find((x) => x.number === number);
      if (s) {
        s.credits = credits;
        s.sgpa = sgpa;
      }
    });
  },
  async setCgpaTarget(target: number | null) {
    await mutate((doc) => {
      doc.cgpaTarget = target;
    });
  },
  async cgpaTarget(): Promise<number | null> {
    return (await read()).cgpaTarget ?? null;
  },

  // self-study courses
  async listSelfCourses() {
    return (await read()).selfCourses;
  },
  async addSelfCourse(c: Omit<SelfCourse, "id">) {
    await mutate((doc) => {
      doc.selfCourses.push({ ...c, id: id() });
    });
  },
  async setSelfCourseDone(courseId: string, done: number) {
    await mutate((doc) => {
      const c = doc.selfCourses.find((x) => x.id === courseId);
      if (c) c.done = Math.max(0, Math.min(c.units, done));
    });
  },
  async removeSelfCourse(courseId: string) {
    await mutate((doc) => {
      doc.selfCourses = doc.selfCourses.filter((x) => x.id !== courseId);
    });
  },

  // projects
  async listProjects() {
    return (await read()).projects;
  },
  async addProject(name: string, status: Project["status"], link: string | null, note: string | null) {
    await mutate((doc) => {
      doc.projects.push({ id: id(), name, status, link, note });
    });
  },
  async setProjectStatus(projectId: string, status: Project["status"]) {
    await mutate((doc) => {
      const p = doc.projects.find((x) => x.id === projectId);
      if (p) p.status = status;
    });
  },
  async removeProject(projectId: string) {
    await mutate((doc) => {
      doc.projects = doc.projects.filter((x) => x.id !== projectId);
    });
  },

  // links
  async listLinks() {
    return (await read()).links;
  },
  async addLink(title: string, url: string, tag: string | null) {
    await mutate((doc) => {
      doc.links.push({ id: id(), title, url, tag });
    });
  },
  async removeLink(linkId: string) {
    await mutate((doc) => {
      doc.links = doc.links.filter((x) => x.id !== linkId);
    });
  },

  // subjects
  async listSubjects() {
    return (await read()).subjects.sort((a, b) => a.examDate.localeCompare(b.examDate));
  },
  async addSubject(name: string, code: string, examDate: string, credits: number, topics: string[]) {
    await mutate((doc) => {
      doc.subjects.push({
        id: id(),
        code: code.toUpperCase(),
        name,
        year: "",
        sem: 0,
        credits,
        examDate,
        modules: topics.length
          ? [
              {
                no: 1,
                title: "Syllabus",
                sections: topics.map((title, i) => ({
                  id: `s${i + 1}`,
                  title,
                  marks: 5,
                  papers: 5,
                  minutes: 30,
                })),
              },
            ]
          : [],
      });
    });
  },
  async removeSubject(subjectId: string) {
    await mutate((doc) => {
      doc.subjects = doc.subjects.filter((s) => s.id !== subjectId);
    });
  },

  // syllabus progress
  async doneSections(): Promise<Set<string>> {
    return new Set((await read()).sections.map((s) => s.key));
  },
  async toggleSection(key: string, done: boolean) {
    await mutate((doc) => {
      const has = doc.sections.some((s) => s.key === key);
      if (done && !has) doc.sections.push({ key, day: studyDay() });
      if (!done) doc.sections = doc.sections.filter((s) => s.key !== key);
    });
  },

  // profile
  async name(): Promise<string> {
    return (await read()).name || (process.env.APP_NAME ?? "");
  },
  async setName(name: string) {
    await mutate((doc) => {
      doc.name = name;
    });
  },

  // push subscriptions
  async listPush() {
    return (await read()).push;
  },
  async addPush(sub: Omit<PushSub, "id">) {
    await mutate((doc) => {
      doc.push = doc.push.filter((p) => p.endpoint !== sub.endpoint);
      doc.push.push({ ...sub, id: id() });
    });
  },
  async removePush(endpoint: string) {
    await mutate((doc) => {
      doc.push = doc.push.filter((p) => p.endpoint !== endpoint);
    });
  },
};

/** Minutes of finished work on a study day, across all sessions. */
export function minutesOn(sessions: Session[], day: string): number {
  return sessions
    .filter((s) => s.studyDay === day && s.endedAt)
    .reduce((sum, s) => sum + (+new Date(s.endedAt!) - +new Date(s.startedAt)) / 60_000, 0);
}

/** Log entries per day, for the heatmap. */
export function logCounts(logs: LogEntry[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const l of logs) counts.set(l.day, (counts.get(l.day) ?? 0) + 1);
  return counts;
}
