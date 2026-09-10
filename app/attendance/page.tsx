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
import { PageHeader } from "@/components/page-header";
import { Badge, Card } from "@/components/ui";
import { events } from "@/lib/demo-data";
import { formatDate } from "@/lib/utils";

export default function AttendancePage() {
  const currentEvent = events.find((event) => event.attendanceStatus === "Open")!;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Proof of presence"
        title="Attendance"
        description="Short-lived wallet signatures prevent shared screenshots; deterministic hashes make finalized records tamper-evident."
      />

      <section className="attendance-overview">
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
        <Card className="attendance-stat">
          <Clock3 size={18} />
          <span>QR validity<strong>60 seconds</strong></span>
        </Card>
        <Card className="attendance-stat">
          <ShieldCheck size={18} />
          <span>Finalized proofs<strong>24 verified</strong></span>
        </Card>
      </section>

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
          <AttendanceScanner />
        </Card>
        <Card className="side-card attendance-flow-card">
          <span className="section-kicker">Verification pipeline</span>
          <h2>Trust, step by step</h2>
          <div className="verification-flow">
            <div className="done"><i>1</i><span><strong>Wallet signature</strong><small>Signer recovered cryptographically</small></span></div>
            <div className="done"><i>2</i><span><strong>Event & expiry</strong><small>Event-specific, under 60 seconds</small></span></div>
            <div className="done"><i>3</i><span><strong>Nonce consumption</strong><small>One-time challenge, replay blocked</small></span></div>
            <div><i>4</i><span><strong>Final event hash</strong><small>Anchored on Polygon Amoy</small></span></div>
          </div>
        </Card>
      </section>

      <Card className="content-card attendance-history">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Member record</span>
            <h2>My attendance history</h2>
          </div>
          <History size={20} />
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Event</th><th>Date</th><th>Status</th><th>Integrity</th><th>Proof</th></tr>
          </thead>
          <tbody>
            {events.filter((event) => event.attendanceStatus === "Finalized").map((event) => (
              <tr key={event.id}>
                <td className="primary-cell" data-label="Event"><strong>{event.name}</strong><span>{event.venue}</span></td>
                <td data-label="Date">{formatDate(event.date)}</td>
                <td data-label="Status"><Badge tone="positive"><CheckCircle2 size={11} /> Present</Badge></td>
                <td data-label="Integrity"><span className="integrity-match"><ShieldCheck size={13} /> Hash match</span></td>
                <td data-label="Proof"><Link href="/admin/integrity" className="table-link"><Fingerprint size={13} /> Verify</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
