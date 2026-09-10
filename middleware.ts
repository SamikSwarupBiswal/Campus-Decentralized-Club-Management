import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "campus_dao_session";
const PUBLIC_ROUTES = new Set(["/", "/login"]);

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), character => character.charCodeAt(0));
}

async function hasValidSession(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const configured = process.env.SESSION_SECRET;
  const secret = configured && configured.length >= 32
    ? configured
    : process.env.NODE_ENV === "production"
      ? null
      : "campus-dao-local-demo-secret-change-before-deploy";
  if (!token || !secret) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  try {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const signatureValid = await crypto.subtle.verify("HMAC", key, decodeBase64Url(parts[1]), new TextEncoder().encode(parts[0]));
    if (!signatureValid) return false;
    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[0]))) as { address?: string; expiresAt?: number };
    return /^0x[a-f0-9]{40}$/.test(payload.address || "") && typeof payload.expiresAt === "number" && payload.expiresAt > Date.now() / 1000;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const valid = await hasValidSession(request);
  const pathname = request.nextUrl.pathname;
  if (pathname === "/login" && valid) return NextResponse.redirect(new URL("/dashboard", request.url));
  if (!PUBLIC_ROUTES.has(pathname) && !valid) {
    const login = new URL("/login", request.url);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.svg|.*\\..*).*)"],
};
