import { NextResponse } from "next/server";
import { verifyMessage } from "viem";
import { consumeNonce } from "@/lib/server/nonces";
import { authVerifySchema } from "@/lib/server/schemas";
import { setSessionCookie } from "@/lib/server/session";
import { authOrigin, checkAuthRequest } from "@/lib/server/auth-request";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const blocked = checkAuthRequest(request);
  if (blocked) return blocked;
  const parsed = authVerifySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid request" },
      { status: 400 },
    );
  }
  if (!parsed.data.message.includes(`\nSite: ${authOrigin(request)}\n`)) {
    return NextResponse.json({ error: "Challenge belongs to a different site" }, { status: 401 });
  }
  const match = parsed.data.message.match(/Nonce: ([a-f0-9]{48})/);
  if (!match) {
    return NextResponse.json({ error: "Challenge nonce missing" }, { status: 400 });
  }
  const valid = await verifyMessage({
    address: parsed.data.address,
    message: parsed.data.message,
    signature: parsed.data.signature as `0x${string}`,
  }).catch(() => false);
  if (!valid) {
    return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
  }
  const nonce = await consumeNonce(match[1], "auth");
  if (
    !nonce ||
    nonce.wallet.toLowerCase() !== parsed.data.address ||
    nonce.message !== parsed.data.message
  ) {
    return NextResponse.json(
      { error: "Challenge is invalid, expired, or already used" },
      { status: 401 },
    );
  }
  await setSessionCookie(parsed.data.address);
  return NextResponse.json({ ok: true, address: parsed.data.address });
}
