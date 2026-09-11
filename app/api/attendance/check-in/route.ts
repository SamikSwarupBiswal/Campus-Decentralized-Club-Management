import { NextResponse } from "next/server";
import { verifyMessage } from "viem";
import { isEventAttendanceOpen } from "@/lib/events";
import {
  attendanceExists,
  saveAttendance,
} from "@/lib/server/attendance";
import { isVerifiedMember } from "@/lib/server/blockchain";
import { getEventById } from "@/lib/server/events";
import { consumeNonce } from "@/lib/server/nonces";
import { attendanceCheckInSchema } from "@/lib/server/schemas";
import { requireAdmin } from "@/lib/server/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin wallet authentication required" }, { status: 401 });
  const parsed = attendanceCheckInSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Malformed QR payload" },
      { status: 400 },
    );
  }
  const data = parsed.data;
  const event = await getEventById(data.eventId);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  if (!isEventAttendanceOpen(event)) {
    return NextResponse.json(
      { error: "Attendance check-in window has closed for this event" },
      { status: 403 },
    );
  }
  if (Math.abs(Date.now() - data.timestamp) > 60_000) {
    return NextResponse.json({ error: "Attendance QR has expired" }, { status: 410 });
  }
  const expectedMessage = data.message || [
    "Campus DAO Attendance",
    `Event: ${data.eventId}`,
    `Wallet: ${data.wallet}`,
    `Timestamp: ${data.timestamp}`,
    `Nonce: ${data.nonce}`,
    "",
    "Valid for 60 seconds. Signing does not initiate a transaction.",
  ].join("\n");
  const validSignature = await verifyMessage({
    address: data.wallet,
    message: expectedMessage,
    signature: data.signature as `0x${string}`,
  }).catch(() => false);
  if (!validSignature) {
    return NextResponse.json({ error: "Wallet signature is invalid" }, { status: 401 });
  }
  const nonce = await consumeNonce(data.nonce, "attendance");
  if (
    !nonce ||
    nonce.wallet.toLowerCase() !== data.wallet ||
    nonce.eventId !== data.eventId ||
    (nonce.message !== expectedMessage && nonce.message !== data.message)
  ) {
    return NextResponse.json(
      { error: "Nonce is expired, invalid, or already consumed" },
      { status: 409 },
    );
  }
  if (!(await isVerifiedMember(data.wallet))) {
    return NextResponse.json(
      { error: "Wallet is not an active club member" },
      { status: 403 },
    );
  }
  if (await attendanceExists(data.eventId, data.wallet)) {
    return NextResponse.json(
      { error: "Attendance is already recorded for this event" },
      { status: 409 },
    );
  }
  try {
    await saveAttendance({
      eventId: data.eventId,
      wallet: data.wallet,
      checkedInAt: new Date().toISOString(),
      nonce: data.nonce,
    });
  } catch {
    return NextResponse.json(
      { error: "Attendance is already recorded for this event" },
      { status: 409 },
    );
  }
  return NextResponse.json({
    ok: true,
    wallet: data.wallet,
    eventId: data.eventId,
    checkedInAt: new Date().toISOString(),
  });
}
