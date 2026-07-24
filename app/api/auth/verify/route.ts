import { NextResponse } from "next/server";
import { verifyMessage } from "viem";
import { consumeNonce } from "@/lib/server/nonces";
import { authVerifySchema } from "@/lib/server/schemas";
import { setSessionCookie } from "@/lib/server/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const parsed = authVerifySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid request" },
      { status: 400 },
    );
  }
  const match = parsed.data.message.match(/Nonce: ([a-f0-9]{48})/);
  if (!match) {
    return NextResponse.json({ error: "Challenge nonce missing" }, { status: 400 });
  }
  const valid = await verifyMessage({
    address: parsed.data.address,
    message: parsed.data.message,
    signature: parsed.data.signature as `0x${string}`,
  });
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
