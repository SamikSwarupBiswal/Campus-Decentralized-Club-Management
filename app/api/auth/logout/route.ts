import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/server/session";
import { authOrigin } from "@/lib/server/auth-request";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== authOrigin(request)) return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
