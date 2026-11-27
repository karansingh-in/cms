import { store, type Module, type Subject } from "./store";

export type { Module, Subject };

export async function listSubjects(): Promise<Subject[]> {
  return store.listSubjects();
}

export async function getSubject(code: string): Promise<Subject | undefined> {
  return (await store.listSubjects()).find((s) => s.code === code);
}

export async function getModule(code: string, no: number) {
  const subject = await getSubject(code);
  const module = subject?.modules.find((m) => m.no === no);
  return subject && module ? { subject, module } : undefined;
}

export async function nextExam(now = new Date()): Promise<Subject | undefined> {
  const today = now.toISOString().slice(0, 10);
  const subjects = await store.listSubjects();
  return subjects.find((s) => s.examDate >= today) ?? subjects[0];
}
