import { ArrowUpRight, Clock3, MapPin, QrCode, Users2 } from "lucide-react";
import Link from "next/link";
import type { ClubEvent } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Badge, Card } from "./ui";

export function EventCard({ event }: { event: ClubEvent }) {
  const tone =
    event.attendanceStatus === "Open"
      ? "accent"
      : event.attendanceStatus === "Finalized"
        ? "positive"
        : "neutral";
  return (
    <Card className="event-card">
      <div className="event-card-top">
        <div className="event-calendar" style={{ color: "#000000", background: "#ffffff" }}>
          <span style={{ color: "#000000" }}>{formatDate(event.date, { month: "short" }).toUpperCase()}</span>
          <strong style={{ color: "#000000" }}>{new Date(`${event.date}T00:00:00`).getDate()}</strong>
        </div>
        <Badge tone={tone}>
          {event.attendanceStatus === "Open" ? "Check-in open" : event.attendanceStatus}
        </Badge>
      </div>
      <span className="event-organizer">{event.organizer}</span>
      <h3>{event.name}</h3>
      <p>{event.description}</p>
      <div className="event-card-meta">
        <span><Clock3 size={14} /> {event.startTime}–{event.endTime}</span>
        <span><MapPin size={14} /> {event.venue}</span>
        <span><Users2 size={14} /> {event.attendees}/{event.capacity} attending</span>
        <span><QrCode size={14} /> Signed QR</span>
      </div>
      <Link href={`/events/${event.id}`}>
        Open event <ArrowUpRight size={15} />
      </Link>
    </Card>
  );
}
