"use client";

import { useEffect, useState } from "react";

type State = "unknown" | "off" | "on" | "denied" | "unsupported";

const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function bytes(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export default function PushToggle({ configured }: { configured: boolean }) {
  const [state, setState] = useState<State>("unknown");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return setState("unsupported");
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub ? "on" : Notification.permission === "denied" ? "denied" : "off"))
      .catch(() => setState("off"));
  }, []);

  async function enable() {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return setState("denied");
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: bytes(key),
      });
      await fetch("/api/push", { method: "POST", body: JSON.stringify(sub) });
      setState("on");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push", { method: "DELETE", body: JSON.stringify({ endpoint: sub.endpoint }) });
        await sub.unsubscribe();
      }
      setState("off");
    } finally {
      setBusy(false);
    }
  }

  const label = !configured
    ? "Add VAPID keys"
    : state === "on"
      ? "On"
      : state === "denied"
        ? "Blocked in browser"
        : state === "unsupported"
          ? "Not supported"
          : "Off";

  return (
    <div className="flex items-center justify-between border-b border-rule py-3.5">
      <div>
        <p className="text-[14px]">Notifications</p>
        <p className="mt-0.5 text-[11px] text-ink-3">00:30 nudge, 01:00 wind down</p>
      </div>

      {state === "on" ? (
        <button
          onClick={disable}
          disabled={busy}
          className="press rounded-full border border-accent/60 bg-accent/15 px-3.5 py-1.5 text-[12px] text-accent"
        >
          On
        </button>
      ) : (
        <button
          onClick={enable}
          disabled={busy || !configured || state === "denied" || state === "unsupported"}
          className="press rounded-full border border-rule px-3.5 py-1.5 text-[12px] text-ink-2 disabled:opacity-50"
        >
          {label}
        </button>
      )}
    </div>
  );
}
