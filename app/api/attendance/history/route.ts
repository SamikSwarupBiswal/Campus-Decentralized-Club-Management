import { NextResponse } from "next/server";
import {
  canonicalAttendance,
  getAttendanceCountsByEvent,
  getAttendanceList,
} from "@/lib/server/attendance";
import { getAllEvents, getEventById } from "@/lib/server/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");

  // If a specific eventId is requested, return the attendee roster for that event
  if (eventId) {
    const event = await getEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const attendees = await getAttendanceList(eventId);
    const { hash } = await canonicalAttendance(eventId);

    return NextResponse.json({
      ok: true,
      event: {
        id: event.id,
        name: event.name,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        venue: event.venue,
        organizer: event.organizer,
        description: event.description,
        attendanceStatus: event.attendanceStatus,
        capacity: event.capacity,
        attendeesCount: attendees.length,
        canonicalHash: hash,
      },
      attendees,
      count: attendees.length,
    });
  }

  // Otherwise, return the list of all events with attendance counts
  const allEvents = await getAllEvents();
  const counts = await getAttendanceCountsByEvent();

  const eventsWithStats = await Promise.all(
    allEvents.map(async (ev) => {
      const realCount = counts[ev.id] || 0;
      const displayCount = Math.max(realCount, ev.attendees || 0);
      return {
        id: ev.id,
        name: ev.name,
        date: ev.date,
        startTime: ev.startTime,
        endTime: ev.endTime,
        venue: ev.venue,
        organizer: ev.organizer,
        description: ev.description,
        attendanceStatus: ev.attendanceStatus,
        capacity: ev.capacity,
        attendeesCount: displayCount,
        realRecordedCount: realCount,
      };
    }),
  );

  return NextResponse.json({
    ok: true,
    events: eventsWithStats,
  });
}
