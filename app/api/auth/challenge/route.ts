import { NextResponse } from "next/server";
import { issueNonce, replaceNonceMessage } from "@/lib/server/nonces";
import { authChallengeSchema } from "@/lib/server/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const parsed = authChallengeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid request" },
      { status: 400 },
    );
  }
  const issuedAt = new Date();
  const record = await issueNonce(
    {
      kind: "auth",
      wallet: parsed.data.address,
      message: "pending",
    },
    5 * 60,
  );
  const message = [
    "Campus DAO Authentication",
    "",
    "Sign this message to prove wallet ownership.",
    `Wallet: ${parsed.data.address}`,
    `Nonce: ${record.nonce}`,
    `Issued At: ${issuedAt.toISOString()}`,
    "",
    "This request does not initiate a blockchain transaction.",
  ].join("\n");
  await replaceNonceMessage(record.nonce, message);
  return NextResponse.json({
    message,
    expiresAt: record.expiresAt.getTime(),
  });
}
