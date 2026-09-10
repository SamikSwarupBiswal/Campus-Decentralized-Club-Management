import { NextResponse } from "next/server";

/** Bind browser authentication to the configured site, not a caller's Origin. */
export function authOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.NODE_ENV === "production" && !configured) {
    throw new Error("Authentication is not configured");
  }
  return new URL(configured || request.url).origin;
}

export function checkAuthRequest(request: Request) {
  if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_APP_URL) {
    return NextResponse.json({ error: "Sign-in is unavailable until the site URL is configured" }, { status: 503 });
  }
  const expected = authOrigin(request);
  const origin = request.headers.get("origin");
  if (origin && origin !== expected) {
    return NextResponse.json({ error: "Request origin is not allowed" }, { status: 403 });
  }
  if (process.env.NODE_ENV === "production" && (!process.env.MONGODB_URI || !process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)) {
    return NextResponse.json({ error: "Sign-in is unavailable until the server is configured" }, { status: 503 });
  }
  return null;
}
