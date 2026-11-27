"use client";

import { useEffect, useState } from "react";

function clock(ms: number): string {
  const t = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return h
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Wall clock, not a countdown: elapsed is derived from the persisted start time,
 * so backgrounding the tab, locking the phone or restarting the browser cannot drift it.
 */
export default function RunningClock({ startedAt, initialNow }: { startedAt: string; initialNow: number }) {
  const [now, setNow] = useState(initialNow);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  return (
    <p className="tabular font-display text-[56px] leading-none tracking-[-0.03em]" aria-live="off">
      {clock(now - Date.parse(startedAt))}
    </p>
  );
}
