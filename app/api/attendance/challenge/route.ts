import { NextResponse } from "next/server";
import { issueNonce, replaceNonceMessage } from "@/lib/server/nonces";
import { attendanceChallengeSchema } from "@/lib/server/schemas";

export const runtime = "nodejs";

const QR_LIFETIME_SECONDS = 60;

export async function POST(request: Request) {
  const parsed = attendanceChallengeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid request" },
      { status: 400 },
    );
  }
  const timestamp = Date.now();
  const record = await issueNonce(
    {
      kind: "attendance",
      wallet: parsed.data.wallet,
      eventId: parsed.data.eventId,
      message: "pending",
    },
    QR_LIFETIME_SECONDS,
  );
  const message = [
    "Campus DAO Attendance",
    `Event: ${parsed.data.eventId}`,
    `Wallet: ${parsed.data.wallet}`,
    `Timestamp: ${timestamp}`,
    `Nonce: ${record.nonce}`,
    "",
    "Valid for 60 seconds. Signing does not initiate a transaction.",
  ].join("\n");
  await replaceNonceMessage(record.nonce, message);
  return NextResponse.json({
    message,
    nonce: record.nonce,
    timestamp,
    expiresAt: record.expiresAt.getTime(),
  });
}
