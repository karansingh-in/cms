"use client";

import { useState } from "react";
import { saveSemesters } from "@/app/actions";
import { ceiling, formatGpa, standing, type Semester } from "@/lib/cgpa";
import { ROMAN } from "@/lib/day";

/**
 * The maths is instant: type an SGPA and the number you need for the rest of the
 * degree moves with it. Nothing is written until Save.
 */
export default function CgpaForm({
  semesters,
  target: savedTarget,
}: {
  semesters: Semester[];
  target: number | null;
}) {
  const [rows, setRows] = useState(semesters);
  const [target, setTarget] = useState(savedTarget === null ? "" : String(savedTarget));

  const targetNum = target.trim() === "" ? null : Number(target);
  const st = standing(rows, targetNum !== null && Number.isFinite(targetNum) ? targetNum : null);
  const best = ceiling(st);

  const pending = rows.filter((s) => s.sgpa === null);
  const first = pending[0]?.number;
  const last = pending[pending.length - 1]?.number;
  const range = first === undefined ? "" : first === last ? `Sem ${ROMAN[first]}` : `Sem ${ROMAN[first]}–${ROMAN[last]}`;

  const line = (() => {
    if (st.status === "none") return "Fill in a semester and the maths starts.";
    if (st.status === "no-target") return "Set a target and this tells you what the rest of the degree needs.";
    if (st.status === "complete") return `Final CGPA ${formatGpa(st.cgpa!)}.`;
    if (st.status === "secured") return `${formatGpa(targetNum!)} is already secured.`;
    if (st.status === "unreachable")
      return `${formatGpa(targetNum!)} is out of reach. The most you can finish on is ${formatGpa(best!)}.`;
    return `You need ${formatGpa(st.requiredSgpa!)} in each of ${range} to finish on ${formatGpa(targetNum!)}.`;
  })();

  return (
    <form action={saveSemesters} className="mt-4">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="cgpa-target" className="text-[12px] text-ink-2">
          Target CGPA
        </label>
        <input
          id="cgpa-target"
          name="target"
          type="number"
          min={0}
          max={10}
          step="0.01"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="—"
          className="tabular w-24 rounded-[9px] border border-rule bg-ash px-3 py-1.5 text-right text-[14px]"
        />
      </div>

      <div className="mt-4 grid grid-cols-[52px_1fr_1fr] gap-2 pb-1.5 text-[9px] uppercase tracking-[0.12em] text-ink-3">
        <span />
        <span>Credits</span>
        <span>SGPA</span>
      </div>

      {rows.map((s, i) => (
        <div key={s.id} className="grid grid-cols-[52px_1fr_1fr] items-center gap-2 border-t border-rule py-1.5">
          <span className="text-[13px] text-ink-2">Sem {ROMAN[s.number]}</span>
          <input
            name={`credits_${s.number}`}
            type="number"
            min={0}
            max={60}
            value={s.credits}
            aria-label={`Semester ${s.number} credits`}
            onChange={(e) => {
              const credits = Number(e.target.value);
              setRows((r) => r.map((x, j) => (j === i ? { ...x, credits: Number.isFinite(credits) ? credits : 0 } : x)));
            }}
            className="tabular w-full rounded-[9px] border border-rule bg-ash px-2.5 py-1.5 text-[14px]"
          />
          <input
            name={`sgpa_${s.number}`}
            type="number"
            min={0}
            max={10}
            step="0.01"
            value={s.sgpa ?? ""}
            placeholder="—"
            aria-label={`Semester ${s.number} SGPA`}
            onChange={(e) => {
              const raw = e.target.value;
              setRows((r) =>
                r.map((x, j) => (j === i ? { ...x, sgpa: raw.trim() === "" ? null : Math.min(10, Number(raw)) } : x)),
              );
            }}
            className="tabular w-full rounded-[9px] border border-rule bg-ash px-2.5 py-1.5 text-[14px]"
          />
        </div>
      ))}

      <p aria-live="polite" className="mt-3 text-[12px] leading-relaxed text-ink-3">
        {line}
      </p>

      <button className="press mt-3 w-full rounded-[10px] border border-ink py-2.5 text-[14px] font-medium">
        Save
      </button>
    </form>
  );
}
