import { NextResponse } from "next/server";

function getOriginHostname(originStr?: string | null): string | null {
  if (!originStr) return null;
  try {
    return new URL(originStr).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function getRequestHostname(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = (forwardedHost || request.headers.get("host") || new URL(request.url).host)
    .split(",")[0]
    .trim()
    .split(":")[0]
    .toLowerCase();
  return host;
}

function isLocal(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export function isAllowedOrigin(originStr: string | null, request: Request): boolean {
  if (!originStr) return true;
  const originHost = getOriginHostname(originStr);
  if (!originHost) return false;

  const reqHost = getRequestHostname(request);
  if (originHost === reqHost) return true;

  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) {
    const configuredHost = getOriginHostname(configured);
    if (configuredHost && originHost === configuredHost) return true;
  }

  if (isLocal(originHost) && isLocal(reqHost)) return true;

  // Allow any Vercel deployment of this project
  if (
    originHost.endsWith(".vercel.app") &&
    (originHost.includes("campus") || reqHost.endsWith(".vercel.app"))
  ) {
    return true;
  }

  return false;
}

/** Bind browser authentication to the expected site origin. */
export function authOrigin(request: Request): string {
  const origin = request.headers.get("origin");
  if (origin && isAllowedOrigin(origin, request)) {
    try {
      return new URL(origin).origin;
    } catch {
      // ignore
    }
  }

  const reqHost = getRequestHostname(request);
  const proto = isLocal(reqHost) ? "http" : "https";

  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) {
    try {
      const configuredUrl = new URL(configured);
      if (configuredUrl.hostname.toLowerCase() === reqHost) {
        return configuredUrl.origin;
      }
    } catch {
      // ignore
    }
  }

  const fullHost = (
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    new URL(request.url).host
  )
    .split(",")[0]
    .trim();

  return `${proto}://${fullHost}`;
}

export function checkAuthRequest(request: Request) {
  const origin = request.headers.get("origin");

  if (origin && !isAllowedOrigin(origin, request)) {
    return NextResponse.json(
      { error: "Request origin is not allowed" },
      { status: 403 },
    );
  }

  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.MONGODB_URI ||
      !process.env.SESSION_SECRET ||
      process.env.SESSION_SECRET.length < 32)
  ) {
    return NextResponse.json(
      { error: "Sign-in is unavailable until the server is configured" },
      { status: 503 },
    );
  }

  return null;
}
