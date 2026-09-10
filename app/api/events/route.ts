import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { events } from "@/lib/demo-data";
import { getDatabase } from "@/lib/server/mongodb";
import { eventSchema } from "@/lib/server/schemas";
import { requireAdmin } from "@/lib/server/session";

export const runtime = "nodejs";

export async function GET() {
  const db = await getDatabase();
  if (!db) return NextResponse.json({ events, mode: "demo" });
  const records = await db
    .collection("events")
    .find({}, { projection: { _id: 0 } })
    .sort({ date: 1 })
    .toArray();
  return NextResponse.json({ events: records, mode: "database" });
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
  const record = {
    id: `evt-${randomUUID()}`,
    ...parsed.data,
    attendanceStatus: "Upcoming",
    attendees: 0,
    createdAt: new Date(),
  };
  const db = await getDatabase();
  if (!db) {
    return NextResponse.json({ error: "Configure MongoDB before creating events" }, { status: 503 });
  }
  await db.collection("events").insertOne(record);
  return NextResponse.json({
    ok: true,
    event: record,
    message: "Event created",
  });
}
