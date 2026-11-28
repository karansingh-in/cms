"use client";

import { BookOpen, GraduationCap, Library, Plus, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { addLog, addTask } from "@/app/actions";
import { addDays, dayLabel, studyDay } from "@/lib/day";

const tabs = [
  { href: "/", label: "Today", icon: Sun },
  { href: "/study", label: "Study", icon: BookOpen },
  { href: "/grades", label: "Grades", icon: GraduationCap },
  { href: "/library", label: "Library", icon: Library },
];

/** Tell the phone something landed, if the user allowed it. */
async function notify(title: string, body: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) await reg.showNotification(title, { body, icon: "/icon.svg", badge: "/icon.svg" });
    else new Notification(title, { body });
  } catch {
    /* notifications are a bonus, never a blocker */
  }
}

export default function TabBar({ courses }: { courses: { id: string; name: string }[] }) {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const date = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"task" | "log">("task");
  const [due, setDue] = useState(studyDay());
  const [pending, start] = useTransition();

  useEffect(() => {
    navigator.serviceWorker?.register("/sw.js").catch(() => {});
  }, []);

  if (pathname === "/unlock") return null;

  const today = studyDay();
  const tomorrow = addDays(today, 1);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <nav
        aria-label="Sections"
        className="fixed bottom-0 left-1/2 z-50 w-full max-w-[520px] -translate-x-1/2 border-t border-rule bg-paper pb-[env(safe-area-inset-bottom)]"
      >
        <div className="mx-auto grid h-[58px] w-full max-w-[520px] grid-cols-5 items-center px-2">
          {tabs.slice(0, 2).map((tab) => (
            <Tab key={tab.href} {...tab} active={isActive(tab.href)} />
          ))}

          <div className="flex justify-center">
            <button
              onClick={() => dialog.current?.showModal()}
              aria-label="Quick capture"
              className="press -translate-y-4 grid size-[52px] place-items-center rounded-[17px] bg-accent text-paper shadow-[0_10px_24px_-8px_rgba(0,0,0,0.55)] ring-4 ring-paper"
            >
              <Plus size={25} strokeWidth={2.1} aria-hidden />
            </button>
          </div>

          {tabs.slice(2).map((tab) => (
            <Tab key={tab.href} {...tab} active={isActive(tab.href)} />
          ))}
        </div>
      </nav>

      <dialog
        ref={dialog}
        className="sheet"
        aria-label="Quick capture"
        onClick={(event) => {
          const sheet = dialog.current;
          if (!sheet || event.target !== sheet) return;
          const box = sheet.getBoundingClientRect();
          if (event.clientY < box.top || event.clientX < box.left || event.clientX > box.right) sheet.close();
        }}
      >
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-[9px] border border-rule p-1">
          {(["task", "log"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`press rounded-[7px] py-2 text-[13px] font-medium ${
                mode === m ? "bg-accent text-paper" : "text-ink-2"
              }`}
            >
              {m === "task" ? "Due item" : "Log"}
            </button>
          ))}
        </div>

        {mode === "task" ? (
          <form
            ref={form}
            action={(data) =>
              start(async () => {
                await addTask(data);
                const title = String(data.get("title") ?? "");
                const day = String(data.get("dueDay") ?? "");
                notify("Added to due", day ? `${title} · ${dayLabel(day)}` : title);
                form.current?.reset();
                setDue(studyDay());
                if (date.current) date.current.value = studyDay();
                dialog.current?.close();
              })
            }
            className="space-y-3"
          >
            <input
              name="title"
              required
              autoFocus
              placeholder="What needs doing?"
              aria-label="Title"
              className="w-full rounded-[10px] border border-rule bg-ash px-3.5 py-3 text-[16px]"
            />

            <div className="flex gap-2">
              {[
                { label: "Today", value: today },
                { label: "Tomorrow", value: tomorrow },
              ].map((chip) => (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => {
                    setDue(chip.value);
                    if (date.current) date.current.value = chip.value;
                  }}
                  aria-pressed={due === chip.value}
                  className={`press rounded-[8px] border px-3 py-1.5 text-[13px] ${
                    due === chip.value ? "border-accent bg-accent text-paper" : "border-rule text-ink-2"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
              <input
                ref={date}
                type="date"
                name="dueDay"
                aria-label="Due date"
                defaultValue={today}
                onChange={(e) => setDue(e.target.value)}
                className="tabular min-w-0 flex-1 rounded-[8px] border border-rule bg-ash px-3 py-1.5 text-[13px]"
              />
            </div>

            <div className="flex gap-2">
              <select
                name="course"
                aria-label="Course"
                className="min-w-0 flex-1 rounded-[10px] border border-rule bg-ash px-3 py-3 text-[14px]"
              >
                <option value="">Personal</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                disabled={pending}
                className="press rounded-[10px] bg-accent px-5 py-3 text-[14px] font-medium text-paper disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </form>
        ) : (
          <form
            action={(data) =>
              start(async () => {
                await addLog(data);
                notify("Logged", String(data.get("text") ?? ""));
                form.current?.reset();
                dialog.current?.close();
              })
            }
            className="space-y-3"
          >
            <textarea
              name="text"
              required
              autoFocus
              rows={2}
              placeholder="What did you do?"
              aria-label="Entry"
              className="w-full resize-none rounded-[10px] border border-rule bg-ash px-3.5 py-3 text-[16px]"
            />
            <div className="flex gap-2">
              <input
                name="category"
                placeholder="Category"
                aria-label="Category"
                list="capture-categories"
                className="min-w-0 flex-1 rounded-[10px] border border-rule bg-ash px-3 py-2.5 text-[14px]"
              />
              <input
                name="day"
                type="date"
                defaultValue={today}
                aria-label="Day"
                className="tabular rounded-[10px] border border-rule bg-ash px-3 py-2.5 text-[14px]"
              />
            </div>
            <input
              name="link"
              type="url"
              placeholder="Link (optional)"
              aria-label="Link"
              className="w-full rounded-[10px] border border-rule bg-ash px-3 py-2.5 text-[14px]"
            />
            <datalist id="capture-categories">
              {["Course", "Self-study", "Project", "Reading", "Practice", "Talk"].map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <button
              disabled={pending}
              className="press w-full rounded-[10px] bg-accent py-3 text-[14px] font-medium text-paper disabled:opacity-50"
            >
              Log it
            </button>
          </form>
        )}
      </dialog>
    </>
  );
}

function Tab({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof Sun;
  active: boolean;
}) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className="flex justify-center">
      <span
        className={`press flex h-[50px] w-[64px] flex-col items-center justify-center gap-1 ${
          active ? "text-accent" : "text-ink-3"
        }`}
      >
        <Icon size={19} strokeWidth={active ? 2 : 1.6} aria-hidden />
        <span className="text-[10px] leading-none">{label}</span>
      </span>
    </Link>
  );
}
