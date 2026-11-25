"use client";

import { BookOpen, GraduationCap, NotebookPen, Plus, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { addTask } from "@/app/actions";
import { addDays, studyDay } from "@/lib/day";

const tabs = [
  { href: "/", label: "Today", icon: Sun },
  { href: "/study", label: "Study", icon: BookOpen },
  { href: "/grades", label: "Grades", icon: GraduationCap },
  { href: "/log", label: "Log", icon: NotebookPen },
];

export default function TabBar({ courses }: { courses: { id: string; name: string }[] }) {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const date = useRef<HTMLInputElement>(null);
  const [due, setDue] = useState(studyDay());
  const [pending, start] = useTransition();

  if (pathname === "/unlock") return null;

  const today = studyDay();
  const tomorrow = addDays(today, 1);

  return (
    <>
      <nav
        aria-label="Sections"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-rule bg-paper/85 backdrop-blur-xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex h-14 w-full max-w-[520px] items-stretch">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`press flex flex-1 flex-col items-center justify-center gap-1 ${
                  active ? "text-ink" : "text-ink-3"
                }`}
              >
                <Icon size={20} strokeWidth={1.5} aria-hidden />
                <span className="text-[10px]">{label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => dialog.current?.showModal()}
            aria-label="Quick capture"
            className="press flex flex-1 items-center justify-center"
          >
            <span className="grid size-9 place-items-center rounded-full bg-ink text-paper">
              <Plus size={18} strokeWidth={2} aria-hidden />
            </span>
          </button>
        </div>
      </nav>

      <dialog
        ref={dialog}
        className="sheet"
        aria-label="Quick capture"
        onClick={(event) => {
          const sheet = dialog.current;
          if (!sheet || event.target !== sheet) return;
          // Only the area outside the sheet dismisses it; the padding is still the sheet.
          const box = sheet.getBoundingClientRect();
          const outside =
            event.clientY < box.top ||
            event.clientX < box.left ||
            event.clientX > box.right ||
            event.clientY > box.bottom;
          if (outside) sheet.close();
        }}
      >
        <form
          ref={form}
          action={(data) =>
            start(async () => {
              await addTask(data);
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
            className="w-full rounded-[10px] border border-rule bg-paper px-3 py-3 text-[16px]"
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
                className={`press rounded-full border px-3.5 py-1.5 text-[13px] ${
                  due === chip.value ? "border-ink bg-ink text-paper" : "border-rule text-ink-2"
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
              className="tabular min-w-0 flex-1 rounded-full border border-rule bg-paper px-3 py-1.5 text-[13px]"
            />
          </div>

          <div className="flex gap-2">
            <select
              name="course"
              aria-label="Course"
              className="min-w-0 flex-1 rounded-[10px] border border-rule bg-paper px-3 py-2.5 text-[14px]"
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
              className="press rounded-[10px] bg-ink px-5 py-2.5 text-[14px] font-medium text-paper disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
