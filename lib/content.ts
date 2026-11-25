import data from "@/content/subjects.json";

export type Module = { no: number; title: string; sections: import("./triage").Section[] };
export type Subject = {
  code: string;
  name: string;
  year: string;
  sem: number;
  credits: number;
  examDate: string;
  modules: Module[];
};

const subjects = (data.subjects as Subject[]).sort((a, b) => a.examDate.localeCompare(b.examDate));

export function listSubjects(): Subject[] {
  return subjects;
}

export function getSubject(code: string): Subject | undefined {
  return subjects.find((s) => s.code === code);
}

export function getModule(code: string, no: number) {
  const subject = getSubject(code);
  const module = subject?.modules.find((m) => m.no === no);
  return subject && module ? { subject, module } : undefined;
}

export function nextExam(now = new Date()): Subject | undefined {
  const today = now.toISOString().slice(0, 10);
  return subjects.find((s) => s.examDate >= today) ?? subjects[0];
}
