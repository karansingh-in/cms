import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

type Body = { endpoint?: string; keys?: { p256dh?: string; auth?: string } };

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  if (!body.endpoint || !body.keys?.p256dh || !body.keys.auth) {
    return NextResponse.json({ error: "bad subscription" }, { status: 400 });
  }
  await store.addPush({ endpoint: body.endpoint, p256dh: body.keys.p256dh, auth: body.keys.auth });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const body = (await request.json()) as Body;
  if (body.endpoint) await store.removePush(body.endpoint);
  return NextResponse.json({ ok: true });
}
