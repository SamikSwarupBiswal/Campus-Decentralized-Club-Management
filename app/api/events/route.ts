import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { computeEventAttendanceStatus } from "@/lib/events";
import { getAllEvents } from "@/lib/server/events";
import { getDatabase } from "@/lib/server/mongodb";
import { eventSchema } from "@/lib/server/schemas";
import { customEvents, requireAdmin } from "@/lib/server/session";
import type { ClubEvent } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const db = await getDatabase();
  const combined = await getAllEvents();
  return NextResponse.json({ events: combined, mode: db ? "database" : "demo" });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin wallet authentication required" }, { status: 401 });
  const parsed = eventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid event" },
      { status: 400 },
    );
  }
  const baseRecord: ClubEvent = {
    id: `evt-${randomUUID().slice(0, 8)}`,
    ...parsed.data,
    attendanceStatus: "Upcoming",
    attendees: 0,
    capacity: 50,
  };
  const record: ClubEvent = {
    ...baseRecord,
    attendanceStatus: computeEventAttendanceStatus(baseRecord),
  };

  const db = await getDatabase();
  if (db) {
    try {
      await db.collection("events").insertOne({ ...record, createdAt: new Date() });
    } catch (e) {
      console.error("Failed to insert event in MongoDB:", e);
    }
  }

  customEvents.set(record.id, record);

  return NextResponse.json({
    ok: true,
    event: record,
    message: "Event created successfully",
  });
}
