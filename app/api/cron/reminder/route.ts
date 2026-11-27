import { NextResponse } from "next/server";
import { studyDay } from "@/lib/day";
import { sendPush } from "@/lib/push";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

function allowed(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

/** 00:30 local: only speaks when the day has no entry at all. */
export async function GET(request: Request) {
  if (!allowed(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const logs = await store.logsOn(studyDay());
  if (logs.length > 0) return NextResponse.json({ sent: 0, quiet: true });

  const sent = await sendPush({
    title: "Nothing logged today",
    body: "One line about what you did keeps the streak alive. It still counts until 01:30.",
    url: "/log",
  });
  return NextResponse.json({ sent });
}
