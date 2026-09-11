import type { ClubEvent, EventAttendanceStatus } from "./types";

export function parseEventDateTime(dateStr: string, timeStr: string): Date {
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const [hourStr, minuteStr] = timeStr.split(":");

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  const hour = parseInt(hourStr || "0", 10);
  const minute = parseInt(minuteStr || "0", 10);

  return new Date(year, month, day, hour, minute, 0, 0);
}

export function getEventTimeWindow(
  event: Pick<ClubEvent, "date" | "startTime" | "endTime">,
): { start: Date; end: Date } {
  const start = parseEventDateTime(event.date, event.startTime);
  const end = parseEventDateTime(event.date, event.endTime);
  return { start, end };
}

export function computeEventAttendanceStatus(
  event: Pick<ClubEvent, "date" | "startTime" | "endTime" | "attendanceStatus">,
  now: Date = new Date(),
): EventAttendanceStatus {
  if (event.attendanceStatus === "Finalized") {
    return "Finalized";
  }

  const { start, end } = getEventTimeWindow(event);
  const nowMs = now.getTime();

  if (nowMs < start.getTime()) {
    return "Upcoming";
  }
  if (nowMs > end.getTime()) {
    return "Closed";
  }
  return "Open";
}

export function isEventAttendanceOpen(
  event: Pick<ClubEvent, "date" | "startTime" | "endTime" | "attendanceStatus">,
  now: Date = new Date(),
): boolean {
  return computeEventAttendanceStatus(event, now) === "Open";
}
