import fs from "node:fs/promises";
import path from "node:path";
import { studyDay } from "./day";

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

export type Card = {
  id: string;
  front: string;
  back: string;
  course: string | null;
  dueDay: string;
  interval: number;
  ease: number;
};

export type LogEntry = { id: string; text: string; category: string; link: string | null; day: string };

type Doc = {
  sessions: Session[];
  tasks: Task[];
  courses: Course[];
  assessments: Assessment[];
  cards: Card[];
  logs: LogEntry[];
};

const EMPTY: Doc = { sessions: [], tasks: [], courses: [], assessments: [], cards: [], logs: [] };
const file = path.join(process.cwd(), ".data", "db.json");
const id = () => crypto.randomUUID();

/**
 * One user, one JSON file. Read-modify-write is safe enough at this concurrency;
 * supabase/schema.sql holds the same shape when this moves to a real database.
 */
async function read(): Promise<Doc> {
  try {
    return { ...EMPTY, ...(JSON.parse(await fs.readFile(file, "utf8")) as Doc) };
  } catch {
    return { ...EMPTY };
  }
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

  // cards
  async listCards() {
    return (await read()).cards;
  },
  async addCard(front: string, back: string, course: string | null) {
    await mutate((doc) => {
      doc.cards.push({
        id: id(),
        front,
        back,
        course,
        dueDay: studyDay(),
        interval: 0,
        ease: 2.5,
      });
    });
  },
  async saveSchedule(cardId: string, interval: number, ease: number, dueDay: string) {
    await mutate((doc) => {
      const c = doc.cards.find((x) => x.id === cardId);
      if (c) {
        c.interval = interval;
        c.ease = ease;
        c.dueDay = dueDay;
      }
    });
  },
  async removeCard(cardId: string) {
    await mutate((doc) => {
      doc.cards = doc.cards.filter((x) => x.id !== cardId);
    });
  },

  // log
  async listLogs() {
    return (await read()).logs.sort((a, b) => b.day.localeCompare(a.day));
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
};

/** Minutes of finished work on a study day, across all sessions. */
export function minutesOn(sessions: Session[], day: string): number {
  return sessions
    .filter((s) => s.studyDay === day && s.endedAt)
    .reduce((sum, s) => sum + (+new Date(s.endedAt!) - +new Date(s.startedAt)) / 60_000, 0);
}
