import { NextResponse } from "next/server";
import { verifyMessage } from "viem";
import {
  attendanceExists,
  saveAttendance,
} from "@/lib/server/attendance";
import { isVerifiedMember } from "@/lib/server/blockchain";
import { consumeNonce } from "@/lib/server/nonces";
import { attendanceCheckInSchema } from "@/lib/server/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const parsed = attendanceCheckInSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Malformed QR payload" },
      { status: 400 },
    );
  }
  const data = parsed.data;
  if (Math.abs(Date.now() - data.timestamp) > 60_000) {
    return NextResponse.json({ error: "Attendance QR has expired" }, { status: 410 });
  }
  const validSignature = await verifyMessage({
    address: data.wallet,
    message: data.message,
    signature: data.signature as `0x${string}`,
  });
  if (!validSignature) {
    return NextResponse.json({ error: "Wallet signature is invalid" }, { status: 401 });
  }
  const nonce = await consumeNonce(data.nonce, "attendance");
  if (
    !nonce ||
    nonce.wallet.toLowerCase() !== data.wallet ||
    nonce.eventId !== data.eventId ||
    nonce.message !== data.message
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
