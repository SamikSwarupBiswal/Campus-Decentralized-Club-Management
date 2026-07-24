import { NextResponse } from "next/server";
import { z } from "zod";
import { canonicalAttendance } from "@/lib/server/attendance";
import { isDemoMode } from "@/lib/server/mongodb";
import { requireAdmin } from "@/lib/server/session";

export const runtime = "nodejs";

const schema = z.object({
  eventId: z.string().min(3).max(120).regex(/^[a-zA-Z0-9_-]+$/),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
  }
  if (!isDemoMode && !(await requireAdmin())) {
    return NextResponse.json(
      { error: "Admin wallet authentication required" },
      { status: 403 },
    );
  }
  const result = await canonicalAttendance(parsed.data.eventId);
  return NextResponse.json({
    ok: true,
    eventId: parsed.data.eventId,
    attendanceHash: result.hash,
    attendeeCount: result.wallets.length,
    canonical: result.canonical,
    nextAction:
      "Submit attendanceHash to AttendanceRegistry.finalizeAttendance from the admin wallet.",
  });
}
