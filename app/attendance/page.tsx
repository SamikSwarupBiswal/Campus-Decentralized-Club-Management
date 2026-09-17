import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Fingerprint,
  History,
  QrCode,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { AttendanceScanner } from "@/components/attendance-scanner";
import { EventAttendanceHistory } from "@/components/event-attendance-history";
import { PageHeader } from "@/components/page-header";
import { Badge, Card } from "@/components/ui";
import {
  getAttendanceCountsByEvent,
  getAttendanceForWallet,
} from "@/lib/server/attendance";
import { getAllEvents } from "@/lib/server/events";
import { getSession, isAdminWallet } from "@/lib/server/session";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const session = await getSession();
  const isAdmin = isAdminWallet(session?.address);
  const allEvents = await getAllEvents();
  const counts = await getAttendanceCountsByEvent();

  const eventsWithStats = allEvents.map((ev) => {
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
  });

  const currentEvent = allEvents.find((event) => event.attendanceStatus === "Open");

  // Query actual attendance records for the currently authenticated member wallet
  const userAttendanceRecords = await getAttendanceForWallet(session?.address);
  const attendedEventMap = new Map(
    userAttendanceRecords.map((rec) => [rec.eventId, rec]),
  );

  const myAttendedEvents = allEvents
    .filter((event) => attendedEventMap.has(event.id))
    .map((event) => ({
      event,
      checkedInAt: attendedEventMap.get(event.id)?.checkedInAt,
    }));

  const finalizedCount = allEvents.filter(
    (event) => event.attendanceStatus === "Finalized",
  ).length;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Proof of presence"
        title="Attendance"
        description="Short-lived wallet signatures prevent shared screenshots; deterministic hashes make finalized records tamper-evident."
      />

      <section className="attendance-overview">
        {currentEvent ? (
          <Card className="active-checkin-card">
            <div className="active-checkin-icon"><QrCode size={24} /></div>
            <div>
              <Badge tone="accent">Check-in open</Badge>
              <h2>{currentEvent.name}</h2>
              <p>{currentEvent.venue} · closes at {currentEvent.endTime}</p>
            </div>
            <Link href={`/events/${currentEvent.id}`} className="button button-primary button-md">
              Generate my QR <ArrowUpRight size={15} />
            </Link>
          </Card>
        ) : (
          <Card className="active-checkin-card">
            <div className="active-checkin-icon"><Clock3 size={24} /></div>
            <div>
              <Badge tone="neutral">No active check-in</Badge>
              <h2>No events currently in progress</h2>
              <p>Check-in opens during scheduled event windows. See upcoming club sessions.</p>
            </div>
            <Link href="/events" className="button button-secondary button-md">
              View events <ArrowUpRight size={15} />
            </Link>
          </Card>
        )}
        <Card className="attendance-stat">
          <Clock3 size={18} />
          <span>QR validity<strong>60 seconds</strong></span>
        </Card>
        <Card className="attendance-stat">
          <ShieldCheck size={18} />
          <span>Finalized proofs<strong>{finalizedCount} verified</strong></span>
        </Card>
      </section>

      {isAdmin && (
        <section className="content-grid attendance-grid">
          <Card className="content-card">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Admin check-in</span>
                <h2>Scan attendance pass</h2>
              </div>
              <ScanLine size={20} />
            </div>
            <p className="section-description">
              The server recovers the signer, checks event membership and expiry,
              consumes the nonce, and rejects duplicate attendance.
            </p>
            <AttendanceScanner initialEventId={currentEvent?.id || allEvents[0]?.id} />

          </Card>
          <Card className="side-card attendance-flow-card">
            <span className="section-kicker">Verification pipeline</span>
            <h2>Trust, step by step</h2>
            <div className="verification-flow">
              <div className="done"><i>1</i><span><strong>Wallet signature</strong><small>Signer recovered cryptographically</small></span></div>
              <div className="done"><i>2</i><span><strong>Event & expiry</strong><small>Event-specific, under 60 seconds</small></span></div>
              <div className="done"><i>3</i><span><strong>Nonce consumption</strong><small>One-time challenge, replay blocked</small></span></div>
              <div className="done"><i>4</i><span><strong>Final event hash</strong><small>Anchored on Ethereum Sepolia</small></span></div>
            </div>
          </Card>
        </section>
      )}

      <EventAttendanceHistory
        initialEvents={eventsWithStats}
        defaultSelectedEventId={currentEvent?.id || allEvents[0]?.id}
      />

      <Card className="content-card attendance-history">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Member record</span>
            <h2>My attendance history</h2>
          </div>
          <History size={20} />
        </div>

        {!session?.address ? (
          <div className="card empty-state" style={{ padding: "36px 16px", textAlign: "center" }}>
            <div className="empty-state-icon" style={{ margin: "0 auto 12px" }}>
              <History size={24} />
            </div>
            <h3>Wallet not connected</h3>
            <p>Connect your MetaMask wallet and sign in to view your verified attendance records.</p>
          </div>
        ) : myAttendedEvents.length === 0 ? (
          <div className="card empty-state" style={{ padding: "36px 16px", textAlign: "center" }}>
            <div className="empty-state-icon" style={{ margin: "0 auto 12px" }}>
              <History size={24} />
            </div>
            <h3>No check-ins recorded yet</h3>
            <p>You have not checked into any club events yet. Attend an active event to record attendance.</p>
            {currentEvent && (
              <div style={{ marginTop: "16px" }}>
                <Link href={`/events/${currentEvent.id}`} className="button button-primary button-sm">
                  Check in to {currentEvent.name} <ArrowUpRight size={14} />
                </Link>
              </div>
            )}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Event</th><th>Date</th><th>Status</th><th>Integrity</th><th>Proof</th></tr>
            </thead>
            <tbody>
              {myAttendedEvents.map(({ event, checkedInAt }) => (
                <tr key={event.id}>
                  <td className="primary-cell" data-label="Event">
                    <strong>{event.name}</strong>
                    <span>{event.venue}</span>
                  </td>
                  <td data-label="Date">{formatDate(checkedInAt || event.date)}</td>
                  <td data-label="Status">
                    <Badge tone="positive">
                      <CheckCircle2 size={11} /> Present
                    </Badge>
                  </td>
                  <td data-label="Integrity">
                    <span className="integrity-match">
                      <ShieldCheck size={13} /> {event.attendanceStatus === "Finalized" ? "Hash match" : "Recorded"}
                    </span>
                  </td>
                  <td data-label="Proof">
                    <Link href="/admin/integrity" className="table-link">
                      <Fingerprint size={13} /> Verify
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
