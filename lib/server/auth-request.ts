import { NextResponse } from "next/server";

export function getRequestOrigin(request: Request): string {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host");
  if (host) {
    const proto =
      forwardedProto ||
      (host.startsWith("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https");
    return `${proto}://${host}`;
  }
  return new URL(request.url).origin;
}

/** Bind browser authentication to the expected site origin. */
export function authOrigin(request: Request) {
  const reqOrigin = getRequestOrigin(request);
  const configured = process.env.NEXT_PUBLIC_APP_URL;

  if (configured) {
    try {
      const configuredOrigin = new URL(configured).origin;
      if (reqOrigin === configuredOrigin) {
        return configuredOrigin;
      }
    } catch {
      // ignore invalid URL
    }
  }

  return reqOrigin;
}

export function checkAuthRequest(request: Request) {
  const expected = authOrigin(request);
  const origin = request.headers.get("origin");

  if (origin) {
    const configured = process.env.NEXT_PUBLIC_APP_URL;
    let configuredOrigin: string | null = null;
    if (configured) {
      try {
        configuredOrigin = new URL(configured).origin;
      } catch {
        // ignore
      }
    }

    const isAllowed =
      origin === expected ||
      (configuredOrigin !== null && origin === configuredOrigin);

    if (!isAllowed) {
      return NextResponse.json(
        { error: "Request origin is not allowed" },
        { status: 403 },
      );
    }
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
