import { NextResponse } from "next/server";
import { computeEventAttendanceStatus, isEventAttendanceOpen } from "@/lib/events";
import { attendanceExists } from "@/lib/server/attendance";
import { getEventById } from "@/lib/server/events";
import { issueNonce, replaceNonceMessage } from "@/lib/server/nonces";
import { attendanceChallengeSchema } from "@/lib/server/schemas";
import { getSession } from "@/lib/server/session";
import { isVerifiedMember } from "@/lib/server/blockchain";

export const runtime = "nodejs";

const QR_LIFETIME_SECONDS = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");
  const wallet = searchParams.get("wallet");

  if (!eventId || !wallet) {
    return NextResponse.json(
      { error: "Missing eventId or wallet parameter" },
      { status: 400 },
    );
  }

  const checkedIn = await attendanceExists(eventId, wallet);
  return NextResponse.json({
    ok: true,
    eventId,
    wallet: wallet.toLowerCase(),
    checkedIn,
  });
}

export async function POST(request: Request) {
  const parsed = attendanceChallengeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid request" },
      { status: 400 },
    );
  }
  const event = await getEventById(parsed.data.eventId);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  if (!isEventAttendanceOpen(event)) {
    const status = computeEventAttendanceStatus(event);
    if (status === "Upcoming") {
      return NextResponse.json(
        { error: `Attendance check-in is not open yet. Check-in opens on ${event.date} at ${event.startTime}.` },
        { status: 403 },
      );
    }
    if (status === "Finalized") {
      return NextResponse.json(
        { error: "Attendance check-in for this event is finalized and closed." },
        { status: 403 },
      );
    }
    return NextResponse.json(
      { error: `Attendance check-in for this event has closed (ended on ${event.date} at ${event.endTime}).` },
      { status: 403 },
    );
  }

  // Prevent generating duplicate QR codes if the user has already checked in / been scanned
  if (await attendanceExists(parsed.data.eventId, parsed.data.wallet)) {
    return NextResponse.json(
      {
        error: "Attendance has already been recorded for this event. Another check-in QR pass cannot be generated.",
        alreadyCheckedIn: true,
      },
      { status: 409 },
    );
  }

  const session = await getSession();
  if (session?.address && session.address.toLowerCase() !== parsed.data.wallet.toLowerCase()) {
    return NextResponse.json(
      { error: "Connected wallet does not match signed-in session. Please switch accounts." },
      { status: 403 },
    );
  }
  const verified = await isVerifiedMember(parsed.data.wallet);
  if (!verified) {
    return NextResponse.json(
      { error: "Active membership required. Please register your wallet in the Members directory." },
      { status: 403 },
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
