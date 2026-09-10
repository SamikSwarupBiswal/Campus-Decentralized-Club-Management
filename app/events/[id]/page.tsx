import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  FileCheck2,
  MapPin,
  ShieldCheck,
  Users2,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AttendanceQr } from "@/components/attendance-qr";
import { PageHeader } from "@/components/page-header";
import { Badge, Card } from "@/components/ui";
import { events } from "@/lib/demo-data";
import { formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return events.map((event) => ({ id: event.id }));
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = events.find((item) => item.id === id);
  if (!event) notFound();

  return (
    <div className="page">
      <PageHeader
        eyebrow={event.organizer}
        title={event.name}
        description={event.description}
        action={
          <Link href="/events" className="button button-secondary button-md">
            <ArrowLeft size={16} /> All events
          </Link>
        }
      />
      <section className="content-grid">
        <div className="side-stack">
          <Card className="content-card event-detail-card">
            <div className="event-detail-date">
              <span>{formatDate(event.date, { month: "short" }).toUpperCase()}</span>
              <strong>{new Date(`${event.date}T00:00:00`).getDate()}</strong>
            </div>
            <div className="event-facts">
              <div><CalendarDays size={17} /><span><small>Date</small><strong>{formatDate(event.date, { weekday: "long" })}</strong></span></div>
              <div><Clock3 size={17} /><span><small>Time</small><strong>{event.startTime}–{event.endTime}</strong></span></div>
              <div><MapPin size={17} /><span><small>Venue</small><strong>{event.venue}</strong></span></div>
              <div><Users2 size={17} /><span><small>Capacity</small><strong>{event.attendees} of {event.capacity}</strong></span></div>
            </div>
            <div className="event-description">
              <span className="section-kicker">About this event</span>
              <h2>Build, share, and contribute</h2>
              <p>{event.description} Bring your laptop, GitHub account, and one project or issue you would like to explore. First-time contributors are welcome.</p>
            </div>
            <div className="notice">
              <ShieldCheck size={17} />
              <div><strong>Privacy-preserving proof</strong>Your name and raw attendance remain off-chain. Only a deterministic final event hash is anchored on Polygon Amoy.</div>
            </div>
          </Card>
          {event.proposalId && (
            <Card className="content-card linked-proposal">
              <FileCheck2 size={20} />
              <div>
                <span className="section-kicker">Linked governance</span>
                <h3>Created under approved proposal #{event.proposalId.replace("prop-", "")}</h3>
              </div>
              <Badge tone="positive">Verified</Badge>
            </Card>
          )}
        </div>
        <aside className="side-stack">
          {event.attendanceStatus !== "Finalized" ? (
            <AttendanceQr eventId={event.id} />
          ) : (
            <Card className="side-card">
              <span className="section-kicker">Attendance closed</span>
              <h2>Final proof recorded</h2>
              <div className="verified-panel proposal-verified">
                <strong><ShieldCheck size={16} /> Attendance verified</strong>
                <p>The canonical attendance hash matches the proof stored on Polygon Amoy.</p>
              </div>
            </Card>
          )}
          <Card className="side-card">
            <span className="section-kicker">Attendance status</span>
            <h2>{event.attendanceStatus}</h2>
            <div className="info-row"><span>Checked in</span><strong>{event.attendees}</strong></div>
            <div className="info-row"><span>QR lifetime</span><strong>60 seconds</strong></div>
            <div className="info-row"><span>Duplicate scans</span><strong>Blocked</strong></div>
          </Card>
        </aside>
      </section>
    </div>
  );
}
