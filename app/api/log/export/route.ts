import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const [logs, selfCourses] = await Promise.all([store.listLogs(), store.listSelfCourses()]);

  const months = new Map<string, typeof logs>();
  for (const entry of logs) {
    const key = entry.day.slice(0, 7);
    months.set(key, [...(months.get(key) ?? []), entry]);
  }

  const study = selfCourses.length
    ? `\n## Self-study\n\n${selfCourses
        .map((c) => `- ${c.title} (${c.code}) — ${c.done}/${c.units} · ${c.source}${c.link ? ` — ${c.link}` : ""}`)
        .join("\n")}\n`
    : "";

  const body = [...months.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, entries]) => {
      const title = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(
        new Date(`${key}-15T12:00:00Z`),
      );
      const lines = entries.map((e) => {
        const link = e.link ? ` — [link](${e.link})` : "";
        return `- ${e.day} · ${e.category} — ${e.text}${link}`;
      });
      return `## ${title}\n\n${lines.join("\n")}`;
    })
    .join("\n\n");

  return new Response(`# Learning log\n\n${body || "Nothing logged yet."}\n${study}`, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": 'attachment; filename="learning-log.md"',
    },
  });
}
