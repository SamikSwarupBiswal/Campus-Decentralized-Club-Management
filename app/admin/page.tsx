"use client";

import {
  CalendarPlus2,
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
  ShieldCheck,
  UserMinus,
  UserPlus,
  Users2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { PageHeader } from "@/components/page-header";
import { Badge, Button, Card } from "@/components/ui";
import { contractAddresses, membershipAbi } from "@/lib/contracts";
import { events as fallbackEvents, members as fallbackMembers } from "@/lib/demo-data";
import { cn, formatDate, shortAddress } from "@/lib/utils";
import type { ClubEvent, Member } from "@/lib/types";

type Tab = "members" | "events";

export default function AdminPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("members");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string>();
  const [adminMembers, setAdminMembers] = useState<Member[]>(fallbackMembers);
  const [adminEvents, setAdminEvents] = useState<ClubEvent[]>(fallbackEvents);

  const refreshData = () => {
    fetch("/api/members", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.members && Array.isArray(data.members)) {
          setAdminMembers(data.members);
        }
      })
      .catch(() => {});

    fetch("/api/events", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.events && Array.isArray(data.events)) {
          setAdminEvents(data.events);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!data.isAdmin) {
          router.replace("/dashboard");
        } else {
          setIsAdmin(true);
          refreshData();
        }
      })
      .catch(() => {
        router.replace("/dashboard");
      });
  }, [router]);

  if (isAdmin === null) {
    return (
      <div className="page">
        <PageHeader
          eyebrow="Authorized operations"
          title="Admin console"
          description="Verifying administrator authorization..."
        />
        <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
          <LoaderCircle size={28} className="spin" />
        </div>
      </div>
    );
  }

  async function demoSubmit(event: FormEvent<HTMLFormElement>, kind: string) {
    event.preventDefault();
    setSaving(true);
    setNotice(undefined);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch(kind === "member" ? "/api/members" : "/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(body.error || "Request failed");

      if (kind === "member" && contractAddresses.membership && isConnected && data.wallet) {
        try {
          await writeContractAsync({
            address: contractAddresses.membership,
            abi: membershipAbi,
            functionName: "registerMember",
            args: [String(data.wallet) as `0x${string}`],
          });
        } catch (onChainErr) {
          console.warn("On-chain membership registration deferred:", onChainErr);
        }
      }

      setNotice(body.message || `${kind} saved`);
      event.currentTarget.reset();
      refreshData();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Authorized operations"
        title="Admin console"
        description="Manage membership and events. Governance outcomes remain outside administrator control."
      />

      <div className="admin-boundary">
        <ShieldCheck size={20} />
        <div>
          <strong>Administration is not governance</strong>
          <span>You can verify members and manage events, but cannot edit votes, override outcomes, or withdraw treasury funds.</span>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={cn(tab === "members" && "active")} onClick={() => setTab("members")}><Users2 size={16} /> Member registry</button>
        <button className={cn(tab === "events" && "active")} onClick={() => setTab("events")}><CalendarPlus2 size={16} /> Event management</button>
      </div>

      {notice && (
        <div className="admin-message"><CheckCircle2 size={16} /> {notice}</div>
      )}

      {tab === "members" ? (
        <section className="content-grid">
          <Card className="content-card">
            <div className="section-heading">
              <div><span className="section-kicker">On-chain action</span><h2>Register verified member</h2></div>
              <UserPlus size={20} />
            </div>
            <p className="section-description">Verify student identity off-chain before registering exactly one wallet for governance.</p>
            <form onSubmit={(event) => demoSubmit(event, "member")}>
              <div className="form-grid">
                <div className="form-field"><label htmlFor="member-name">Full name</label><input id="member-name" name="name" required placeholder="Student name" /></div>
                <div className="form-field"><label htmlFor="student-id">Student ID</label><input id="student-id" name="studentId" required placeholder="CS23-000" /></div>
                <div className="form-field full"><label htmlFor="member-wallet">Verified wallet</label><input id="member-wallet" name="wallet" required pattern="^0x[a-fA-F0-9]{40}$" placeholder="0x…" /></div>
                <div className="form-field"><label htmlFor="department">Department</label><input id="department" name="department" required placeholder="Computer Science" /></div>
                <div className="form-field"><label htmlFor="year">Academic year</label><select id="year" name="year"><option>1st year</option><option>2nd year</option><option>3rd year</option><option>4th year</option></select></div>
              </div>
              <div className="notice proposal-notice"><CircleAlert size={17} /><div><strong>Confirm the wallet with the student</strong>Membership is non-transferable. Registration writes eligibility to Ethereum Sepolia.</div></div>
              <div className="form-actions"><Button type="submit" disabled={saving}>{saving ? <LoaderCircle size={16} className="spin" /> : <UserPlus size={16} />} Register member</Button></div>
            </form>
          </Card>
          <Card className="side-card">
            <span className="section-kicker">Recent members</span>
            <h2>Registry activity</h2>
            <div className="admin-member-list">
              {adminMembers.slice(0, 6).map((member) => (
                <div key={member.id || member.wallet}>
                  <span className="member-avatar">{(member.name || "M").split(" ").map((part) => part[0]).join("")}</span>
                  <span><strong>{member.name}</strong><small className="mono">{shortAddress(member.wallet)}</small></span>
                  <button aria-label={`Revoke ${member.name}`}><UserMinus size={14} /></button>
                </div>
              ))}
            </div>
          </Card>
        </section>
      ) : (
        <section className="content-grid">
          <Card className="content-card">
            <div className="section-heading">
              <div><span className="section-kicker">Off-chain operations</span><h2>Create club event</h2></div>
              <CalendarPlus2 size={20} />
            </div>
            <p className="section-description">Event details stay in MongoDB; finalized attendance receives an on-chain integrity proof.</p>
            <form onSubmit={(event) => demoSubmit(event, "event")}>
              <div className="form-grid">
                <div className="form-field full"><label htmlFor="event-name">Event name</label><input id="event-name" name="name" required placeholder="Event title" /></div>
                <div className="form-field full"><label htmlFor="event-description">Description</label><textarea id="event-description" name="description" required placeholder="Purpose and participant information" /></div>
                <div className="form-field"><label htmlFor="event-date">Date</label><input id="event-date" name="date" required type="date" /></div>
                <div className="form-field"><label htmlFor="venue">Venue</label><input id="venue" name="venue" required placeholder="Room or campus location" /></div>
                <div className="form-field"><label htmlFor="start-time">Start time</label><input id="start-time" name="startTime" required type="time" /></div>
                <div className="form-field"><label htmlFor="end-time">End time</label><input id="end-time" name="endTime" required type="time" /></div>
                <div className="form-field"><label htmlFor="organizer">Organizer</label><input id="organizer" name="organizer" required placeholder="Club or team" /></div>
                <div className="form-field"><label htmlFor="proposal-id">Related proposal</label><input id="proposal-id" name="proposalId" placeholder="Optional proposal ID" /></div>
              </div>
              <div className="form-actions"><Button type="submit" disabled={saving}>{saving ? <LoaderCircle size={16} className="spin" /> : <CalendarPlus2 size={16} />} Create event</Button></div>
            </form>
          </Card>
          <Card className="side-card">
            <span className="section-kicker">Event operations</span>
            <h2>Recent programme</h2>
            <div className="admin-event-list">
              {adminEvents.map((event) => (
                <div key={event.id}>
                  <span><strong>{event.name}</strong><small>{formatDate(event.date)} · {event.venue}</small></span>
                  <Badge tone={event.attendanceStatus === "Open" ? "accent" : event.attendanceStatus === "Finalized" ? "positive" : "neutral"}>{event.attendanceStatus}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
