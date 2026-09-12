"use client";

import {
  ArrowUpRight,
  CalendarCheck2,
  CalendarDays,
  Check,
  CheckCircle2,
  Coins,
  Copy,
  ExternalLink,
  Fingerprint,
  GraduationCap,
  History,
  LoaderCircle,
  Plus,
  QrCode,
  ShieldCheck,
  Vote,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { PageHeader } from "@/components/page-header";
import { Badge, Card } from "@/components/ui";
import { WalletButton } from "@/components/wallet-button";
import { explorerUrl, formatDate, shortAddress } from "@/lib/utils";

interface ProfileData {
  wallet: string;
  name: string;
  studentId: string | null;
  department: string;
  year: string;
  role: "Admin" | "Member";
  status: string;
  joinedAt: string | null;
  ethBalance: string;
  attendance: {
    attendedCount: number;
    totalEvents: number;
    pastEventsCount: number;
    rate: number;
    records: Array<{
      id: string;
      name: string;
      date: string;
      venue: string;
      attendanceStatus: string;
      checkedInAt?: string;
    }>;
  };
  proposals: {
    count: number;
    list: Array<{
      id: string;
      onchainId: number;
      title: string;
      category: string;
      state: string;
      yesVotes: number;
      noVotes: number;
      createdAt: string;
    }>;
  };
}

export default function ProfilePage() {
  const { address } = useAccount();
  const { data: balanceData, isLoading: balanceLoading } = useBalance({
    address,
  });

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const endpoint = address ? `/api/profile?wallet=${address}` : "/api/profile";

    fetch(endpoint, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (active && data.ok && data.profile) {
          setProfile(data.profile);
        } else if (active) {
          setProfile(null);
        }
      })
      .catch(() => {
        if (active) setProfile(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [address]);

  function copyWallet() {
    const target = address || profile?.wallet;
    if (!target) return;
    navigator.clipboard.writeText(target);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const activeWallet = address || profile?.wallet;
  const displayBalance = balanceData
    ? parseFloat(balanceData.formatted).toFixed(4)
    : profile?.ethBalance || "0.0000";

  const initials = (profile?.name || "M")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="page">
      <PageHeader
        eyebrow="Identity & Governance"
        title="Account Profile"
        description="Your verified club credentials, testnet treasury balance, and attendance record."
        action={
          profile?.role === "Admin" ? (
            <Link href="/admin" className="button button-secondary button-md">
              <ShieldCheck size={16} /> Admin Console
            </Link>
          ) : undefined
        }
      />

      {!activeWallet && !loading ? (
        <Card className="content-card empty-state" style={{ padding: "64px 20px", textAlign: "center" }}>
          <div className="empty-state-icon" style={{ margin: "0 auto 16px" }}>
            <Wallet size={32} />
          </div>
          <h2>Wallet not connected</h2>
          <p style={{ maxWidth: 440, margin: "8px auto 24px" }}>
            Connect your MetaMask wallet and sign in to access your personal profile, testnet ETH balance, and attendance history.
          </p>
          <div style={{ display: "inline-block" }}>
            <WalletButton />
          </div>
        </Card>
      ) : loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
          <LoaderCircle size={32} className="spin" />
        </div>
      ) : (
        <>
          {/* Hero Profile Card */}
          <Card className="content-card profile-hero-card" style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
              <div
                style={{
                  width: "68px",
                  height: "68px",
                  borderRadius: "50%",
                  background: "var(--surface-muted, #27272a)",
                  border: "2px solid var(--border, #3f3f46)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: "var(--foreground, #ffffff)",
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>

              <div style={{ flex: "1 1 280px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                  <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
                    {profile?.name}
                  </h1>
                  <Badge tone={profile?.role === "Admin" ? "accent" : "neutral"}>
                    {profile?.role}
                  </Badge>
                  <Badge tone="positive">Active</Badge>
                </div>

                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "0.875rem", color: "var(--color-fg-muted, #a1a1aa)", marginTop: "4px" }}>
                  {profile?.studentId && (
                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <GraduationCap size={15} />
                      {profile.studentId} · {profile.department}
                    </span>
                  )}
                  {profile?.joinedAt && (
                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <CalendarDays size={15} />
                      Joined {formatDate(profile.joinedAt)}
                    </span>
                  )}
                </div>

                {activeWallet && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
                    <span className="mono" style={{ fontSize: "0.825rem", background: "var(--surface-muted, #18181b)", padding: "4px 8px", borderRadius: "6px" }}>
                      {shortAddress(activeWallet, 10, 8)}
                    </span>
                    <button
                      onClick={copyWallet}
                      className="button button-ghost button-sm"
                      style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                      aria-label="Copy wallet address"
                    >
                      {copied ? <Check size={14} style={{ color: "#22c55e" }} /> : <Copy size={14} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <a
                      href={explorerUrl("address", activeWallet)}
                      target="_blank"
                      rel="noreferrer"
                      className="table-link"
                      style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem" }}
                    >
                      Sepolia Etherscan <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Stats Grid */}
          <section className="member-stats" style={{ marginBottom: "28px" }}>
            <Card>
              <Coins size={20} />
              <span>
                Sepolia Balance
                <strong>{balanceLoading ? "..." : `${displayBalance} ETH`}</strong>
              </span>
            </Card>

            <Card>
              <QrCode size={20} />
              <span>
                Sessions Attended
                <strong>{profile?.attendance.attendedCount || 0} Events</strong>
              </span>
            </Card>

            <Card>
              <ShieldCheck size={20} />
              <span>
                Club Role
                <strong>{profile?.role || "Member"}</strong>
              </span>
            </Card>

            <Card>
              <Vote size={20} />
              <span>
                Proposals Created
                <strong>{profile?.proposals.count || 0} Motion{profile?.proposals.count === 1 ? "" : "s"}</strong>
              </span>
            </Card>
          </section>

          {/* Detailed Content Columns */}
          <section className="content-grid">
            <div className="side-stack">
              {/* Personal Attendance History */}
              <Card className="content-card">
                <div className="section-heading">
                  <div>
                    <span className="section-kicker">Presence Log</span>
                    <h2>Verified Attendance</h2>
                  </div>
                  <History size={18} />
                </div>

                {!profile?.attendance.records || profile.attendance.records.length === 0 ? (
                  <div className="card empty-state" style={{ padding: "28px 16px", textAlign: "center" }}>
                    <div className="empty-state-icon" style={{ margin: "0 auto 10px" }}>
                      <CalendarCheck2 size={22} />
                    </div>
                    <h3>No check-ins yet</h3>
                    <p style={{ fontSize: "0.85rem", maxWidth: 360, margin: "0 auto 16px" }}>
                      You have not checked into any club events yet. Scan your wallet QR pass at the next event.
                    </p>
                    <Link href="/events" className="button button-primary button-sm">
                      Browse Upcoming Events <ArrowUpRight size={14} />
                    </Link>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Proof</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.attendance.records.map((rec) => (
                        <tr key={rec.id}>
                          <td className="primary-cell" data-label="Event">
                            <strong>{rec.name}</strong>
                            <span>{rec.venue}</span>
                          </td>
                          <td data-label="Date">{formatDate(rec.checkedInAt || rec.date)}</td>
                          <td data-label="Status">
                            <Badge tone="positive">
                              <CheckCircle2 size={11} /> Present
                            </Badge>
                          </td>
                          <td data-label="Proof">
                            <Link href="/admin/integrity" className="table-link">
                              <Fingerprint size={12} /> Verify
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>

              {/* Proposals Created by This Account */}
              <Card className="content-card">
                <div className="section-heading">
                  <div>
                    <span className="section-kicker">Governance Actions</span>
                    <h2>Proposals Created</h2>
                  </div>
                  <Vote size={18} />
                </div>

                {!profile?.proposals.list || profile.proposals.list.length === 0 ? (
                  <div className="card empty-state" style={{ padding: "28px 16px", textAlign: "center" }}>
                    <p style={{ fontSize: "0.85rem", maxWidth: 360, margin: "0 auto 16px" }}>
                      You haven&apos;t created any governance proposals yet. Club members can write proposals for funding, events, or policies.
                    </p>
                    <Link href="/proposals/new" className="button button-primary button-sm">
                      <Plus size={14} /> New Proposal
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {profile.proposals.list.map((prop) => (
                      <Link
                        key={prop.id}
                        href={`/proposals/${prop.id}`}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "12px 14px",
                          borderRadius: "8px",
                          border: "1px solid var(--border, #27272a)",
                          textDecoration: "none",
                          color: "inherit",
                        }}
                      >
                        <div>
                          <strong>{prop.title}</strong>
                          <div style={{ fontSize: "0.8rem", color: "var(--color-fg-muted, #a1a1aa)", marginTop: "2px" }}>
                            {prop.category} · {prop.yesVotes} YES votes
                          </div>
                        </div>
                        <Badge tone={prop.state === "Active" ? "accent" : "positive"}>
                          {prop.state}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Right Column: Governance Status & Quick Links */}
            <aside className="side-stack">
              <Card className="side-card">
                <span className="section-kicker">Account Constitution</span>
                <h2>Voting Rights</h2>
                <div className="info-row">
                  <span>Governance Power</span>
                  <strong>1 Member, 1 Vote</strong>
                </div>
                <div className="info-row">
                  <span>Network</span>
                  <strong>Ethereum Sepolia</strong>
                </div>
                <div className="info-row">
                  <span>Attendance Rate</span>
                  <strong>{profile?.attendance.rate || 0}%</strong>
                </div>
                <div className="info-row">
                  <span>Identity Proof</span>
                  <strong>Non-transferable</strong>
                </div>
              </Card>

              <Card className="side-card">
                <span className="section-kicker">Quick Navigation</span>
                <h2>Direct Links</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                  <Link href="/proposals" className="button button-secondary button-sm full-button">
                    <Vote size={14} /> View All Proposals
                  </Link>
                  <Link href="/events" className="button button-secondary button-sm full-button">
                    <CalendarDays size={14} /> Club Events
                  </Link>
                  <Link href="/attendance" className="button button-secondary button-sm full-button">
                    <QrCode size={14} /> QR Check-in
                  </Link>
                  <Link href="/settings" className="button button-ghost button-sm full-button">
                    Account Settings
                  </Link>
                </div>
              </Card>
            </aside>
          </section>
        </>
      )}
    </div>
  );
}
