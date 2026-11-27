import { NextResponse, type NextRequest } from "next/server";
import { sessionToken } from "./lib/auth";

export async function middleware(req: NextRequest) {
  const passcode = process.env.APP_PASSCODE;
  // No passcode configured means local development: the gate is off on purpose.
  if (!passcode || req.nextUrl.pathname === "/unlock") return NextResponse.next();

  const cookie = req.cookies.get("cms")?.value;
  if (cookie && cookie === (await sessionToken(passcode))) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/unlock";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest).*)"],
};
