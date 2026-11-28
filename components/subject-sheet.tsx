"use client";

import { Plus } from "lucide-react";
import { useRef } from "react";
import { addSubject } from "@/app/actions";

export default function SubjectSheet() {
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);

  return (
    <>
      <button
        onClick={() => dialog.current?.showModal()}
        aria-label="Add subject"
        className="press -mr-2 grid size-10 shrink-0 place-items-center rounded-full text-ink-3 hover:text-ink"
      >
        <Plus size={18} strokeWidth={1.9} aria-hidden />
      </button>

      <dialog
        ref={dialog}
        className="sheet"
        aria-label="Add subject"
        onClick={(event) => {
          const sheet = dialog.current;
          if (!sheet || event.target !== sheet) return;
          const box = sheet.getBoundingClientRect();
          if (event.clientY < box.top || event.clientX < box.left || event.clientX > box.right) sheet.close();
        }}
      >
        <form
          ref={form}
          action={async (data) => {
            await addSubject(data);
            form.current?.reset();
            dialog.current?.close();
          }}
          className="space-y-3"
        >
          <p className="text-[10px] uppercase tracking-[0.16em] text-ink-3">New subject</p>

          <div className="grid grid-cols-[1fr_110px] gap-2">
            <input
              name="name"
              required
              placeholder="Subject name"
              aria-label="Subject name"
              className="w-full rounded-[12px] border border-rule bg-ash px-3 py-3 text-[15px]"
            />
            <input
              name="code"
              required
              placeholder="Code"
              aria-label="Code"
              className="w-full rounded-[12px] border border-rule bg-ash px-3 py-3 text-[15px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.12em] text-ink-3">
              Exam
              <input
                name="examDate"
                type="date"
                required
                className="tabular rounded-[12px] border border-rule bg-ash px-3 py-2.5 text-[14px]"
              />
            </label>
            <label className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.12em] text-ink-3">
              Credits
              <input
                name="credits"
                type="number"
                min={0}
                max={12}
                placeholder="4"
                className="tabular rounded-[12px] border border-rule bg-ash px-3 py-2.5 text-[14px]"
              />
            </label>
          </div>

          <textarea
            name="topics"
            rows={5}
            placeholder="Topics, one per line"
            aria-label="Topics"
            className="w-full resize-none rounded-[12px] border border-rule bg-ash px-3 py-2.5 text-[14px]"
          />

          <button className="press w-full rounded-[12px] bg-ink py-3 text-[14px] font-medium text-paper">Add subject</button>
        </form>
      </dialog>
    </>
  );
}
