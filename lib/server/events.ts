import { events as demoEvents } from "@/lib/demo-data";
import { computeEventAttendanceStatus } from "@/lib/events";
import { getDatabase } from "@/lib/server/mongodb";
import { customEvents } from "@/lib/server/session";
import type { ClubEvent } from "@/lib/types";

export async function getEventById(id: string): Promise<ClubEvent | null> {
  if (customEvents.has(id)) {
    const ev = customEvents.get(id)!;
    return {
      ...ev,
      attendanceStatus: computeEventAttendanceStatus(ev),
    };
  }

  const db = await getDatabase();
  if (db) {
    try {
      const doc = await db
        .collection("events")
        .findOne({ id }, { projection: { _id: 0 } });
      if (doc) {
        const ev = doc as unknown as ClubEvent;
        return {
          ...ev,
          attendanceStatus: computeEventAttendanceStatus(ev),
        };
      }
    } catch (e) {
      console.error("Failed to query event from MongoDB:", e);
    }
  }

  const demo = demoEvents.find((item) => item.id === id);
  if (demo) {
    return {
      ...demo,
      attendanceStatus: computeEventAttendanceStatus(demo),
    };
  }

  return null;
}

export async function getAllEvents(): Promise<ClubEvent[]> {
  let dbEvents: ClubEvent[] = [];
  const db = await getDatabase();
  if (db) {
    try {
      dbEvents = (await db
        .collection("events")
        .find({}, { projection: { _id: 0 } })
        .sort({ date: 1 })
        .toArray()) as unknown as ClubEvent[];
    } catch (e) {
      console.error("Failed to load events from MongoDB:", e);
    }
  }

  const seen = new Set<string>();
  const list: ClubEvent[] = [];

  for (const ev of [...dbEvents, ...Array.from(customEvents.values())]) {
    if (ev.id && !seen.has(ev.id)) {
      seen.add(ev.id);
      list.push({
        ...ev,
        attendanceStatus: computeEventAttendanceStatus(ev),
      });
    }
  }

  for (const ev of demoEvents) {
    if (ev.id && !seen.has(ev.id)) {
      seen.add(ev.id);
      list.push({
        ...ev,
        attendanceStatus: computeEventAttendanceStatus(ev),
      });
    }
  }

  return list;
}
