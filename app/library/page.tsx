import Link from "next/link";
import { ArrowUpRight, Plus, Trash2 } from "lucide-react";
import { addLink, addProject, removeLink, removeProject, setProjectStatus } from "@/app/actions";
import { store, type Project } from "@/lib/store";

export const dynamic = "force-dynamic";

const NEXT: Record<Project["status"], { to: Project["status"]; label: string }> = {
  idea: { to: "building", label: "Start" },
  building: { to: "shipped", label: "Ship" },
  shipped: { to: "building", label: "Reopen" },
};

const STATUS: Record<Project["status"], string> = { idea: "Idea", building: "Building", shipped: "Shipped" };

export default async function Library() {
  const [projects, links, logs] = await Promise.all([store.listProjects(), store.listLinks(), store.listLogs()]);

  return (
    <main className="pt-7">
      <h1 className="font-display text-[34px] leading-[1.05] tracking-[-0.02em]">Library</h1>

      <Link href="/log" className="press mt-6 flex items-center gap-4 border-y border-rule py-3.5">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.16em] text-ink-3">Log</p>
          <p className="mt-1 text-[15px]">
            {logs.length} {logs.length === 1 ? "entry" : "entries"}
          </p>
        </div>
        <ArrowUpRight size={17} strokeWidth={1.5} className="shrink-0 text-ink-3" aria-hidden />
      </Link>

      <section className="mt-9" aria-labelledby="projects">
        <h2 id="projects" className="text-[10px] uppercase tracking-[0.16em] text-ink-3">
          Projects
        </h2>

        {projects.length === 0 ? null : (
          <ul className="mt-1">
            {projects.map((p) => {
              const next = NEXT[p.status];
              return (
                <li key={p.id} className="flex items-start gap-3 border-b border-rule py-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px]">{p.name}</p>
                    <p className="mt-0.5 text-[11px] text-ink-3">
                      {STATUS[p.status]}
                      {p.note && ` · ${p.note}`}
                      {p.link && (
                        <>
                          {" · "}
                          <a href={p.link} className="underline underline-offset-2" rel="noreferrer noopener">
                            link
                          </a>
                        </>
                      )}
                    </p>
                  </div>

                  {next && (
                    <form action={setProjectStatus}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="status" value={next.to} />
                      <button className="press rounded-full border border-rule px-3 py-1.5 text-[12px] text-ink-2">
                        {next.label}
                      </button>
                    </form>
                  )}

                  <form action={removeProject}>
                    <input type="hidden" name="id" value={p.id} />
                    <button aria-label={`Delete ${p.name}`} className="press grid size-9 place-items-center text-ink-3">
                      <Trash2 size={14} strokeWidth={1.5} aria-hidden />
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}

        <details className="tile mt-3">
          <summary className="press flex cursor-pointer list-none items-center gap-2 px-4 py-3.5 text-[14px] font-medium">
            <Plus size={16} strokeWidth={1.8} aria-hidden />
            Add project
          </summary>
          <form action={addProject} className="space-y-2 px-4 pb-4">
            <input
              name="name"
              required
              placeholder="Project name"
              aria-label="Project name"
              className="w-full rounded-[10px] border border-rule bg-paper px-3 py-2.5 text-[14px]"
            />
            <div className="grid grid-cols-[1fr_120px] gap-2">
              <input
                name="note"
                placeholder="One line"
                aria-label="Note"
                className="w-full rounded-[10px] border border-rule bg-paper px-3 py-2.5 text-[14px]"
              />
              <select
                name="status"
                aria-label="Status"
                className="w-full rounded-[10px] border border-rule bg-paper px-3 py-2.5 text-[14px]"
              >
                <option value="idea">Idea</option>
                <option value="building">Building</option>
                <option value="shipped">Shipped</option>
              </select>
            </div>
            <input
              name="link"
              type="url"
              placeholder="Link (optional)"
              aria-label="Link"
              className="w-full rounded-[10px] border border-rule bg-paper px-3 py-2.5 text-[14px]"
            />
            <button className="press w-full rounded-[10px] bg-ink py-3 text-[14px] font-medium text-paper">Add</button>
          </form>
        </details>
      </section>

      <section className="mt-10" aria-labelledby="links">
        <h2 id="links" className="text-[10px] uppercase tracking-[0.16em] text-ink-3">
          Links
        </h2>

        {links.length === 0 ? null : (
          <ul className="mt-1">
            {links.map((l) => (
              <li key={l.id} className="flex items-center gap-3 border-b border-rule py-3.5">
                <a href={l.url} className="press min-w-0 flex-1" rel="noreferrer noopener">
                  <span className="block truncate text-[15px]">{l.title}</span>
                  <span className="mt-0.5 block truncate text-[11px] text-ink-3">
                    {l.tag ? `${l.tag} · ` : ""}
                    {l.url.replace(/^https?:\/\//, "")}
                  </span>
                </a>
                <form action={removeLink}>
                  <input type="hidden" name="id" value={l.id} />
                  <button aria-label={`Delete ${l.title}`} className="press grid size-9 place-items-center text-ink-3">
                    <Trash2 size={14} strokeWidth={1.5} aria-hidden />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <details className="tile mt-3">
          <summary className="press flex cursor-pointer list-none items-center gap-2 px-4 py-3.5 text-[14px] font-medium">
            <Plus size={16} strokeWidth={1.8} aria-hidden />
            Add link
          </summary>
          <form action={addLink} className="space-y-2 px-4 pb-4">
            <input
              name="title"
              required
              placeholder="Title"
              aria-label="Title"
              className="w-full rounded-[10px] border border-rule bg-paper px-3 py-2.5 text-[14px]"
            />
            <div className="grid grid-cols-[1fr_110px] gap-2">
              <input
                name="url"
                type="url"
                required
                placeholder="https://"
                aria-label="URL"
                className="w-full rounded-[10px] border border-rule bg-paper px-3 py-2.5 text-[14px]"
              />
              <input
                name="tag"
                placeholder="Tag"
                aria-label="Tag"
                className="w-full rounded-[10px] border border-rule bg-paper px-3 py-2.5 text-[14px]"
              />
            </div>
            <button className="press w-full rounded-[10px] bg-ink py-3 text-[14px] font-medium text-paper">Add</button>
          </form>
        </details>
      </section>
    </main>
  );
}
