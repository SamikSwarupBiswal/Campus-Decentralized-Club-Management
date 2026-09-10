import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { events } from "@/lib/demo-data";
import { getDatabase } from "@/lib/server/mongodb";
import { eventSchema } from "@/lib/server/schemas";
import { customEvents, requireAdmin } from "@/lib/server/session";
import type { ClubEvent } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const db = await getDatabase();
  let records: ClubEvent[] = [];
  if (db) {
    try {
      records = (await db
        .collection("events")
        .find({}, { projection: { _id: 0 } })
        .sort({ date: 1 })
        .toArray()) as unknown as ClubEvent[];
    } catch (e) {
      console.error("Failed to query events from MongoDB:", e);
    }
  }

  const memoryList = Array.from(customEvents.values());
  const seenIds = new Set<string>();
  const combined: ClubEvent[] = [];

  for (const ev of [...records, ...memoryList]) {
    if (ev.id && !seenIds.has(ev.id)) {
      seenIds.add(ev.id);
      combined.push(ev);
    }
  }

  for (const ev of events) {
    if (ev.id && !seenIds.has(ev.id)) {
      seenIds.add(ev.id);
      combined.push(ev);
    }
  }

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
  const record: ClubEvent = {
    id: `evt-${randomUUID().slice(0, 8)}`,
    ...parsed.data,
    attendanceStatus: "Upcoming",
    attendees: 0,
    capacity: 50,
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
