"use client";

import { ExternalLink, Search, ShieldCheck, UserPlus, Users2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Badge, Card } from "@/components/ui";
import { members as fallbackMembers } from "@/lib/demo-data";
import { explorerUrl, formatDate, shortAddress } from "@/lib/utils";
import type { Member } from "@/lib/types";

export default function MembersPage() {
  const [query, setQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [memberList, setMemberList] = useState<Member[]>(fallbackMembers);

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((s) => setIsAdmin(!!s.isAdmin))
      .catch(() => {});

    fetch("/api/members", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.members && Array.isArray(data.members)) {
          setMemberList(data.members);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(
    () =>
      memberList.filter((member) =>
        `${member.name} ${member.studentId} ${member.wallet} ${member.department || ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [memberList, query],
  );
  return (
    <div className="page">
      <PageHeader
        eyebrow="Governance identity"
        title="Members"
        description="One verified student, one non-transferable governance identity."
        action={
          isAdmin ? (
            <a href="/admin?tab=members" className="button button-primary button-md">
              <UserPlus size={17} /> Register member
            </a>
          ) : undefined
        }
      />
      <section className="member-stats">
        <Card><Users2 size={19} /><span>Verified members<strong>{memberList.length}</strong></span></Card>
        <Card><ShieldCheck size={19} /><span>Eligible voters<strong>{memberList.filter((m) => m.status === "Active" || !m.status).length}</strong></span></Card>
        <Card><UserPlus size={19} /><span>Joined this month<strong>{memberList.length}</strong></span></Card>
      </section>
      <Card className="content-card member-table-card">
        <div className="toolbar">
          <div>
            <span className="section-kicker">Member registry</span>
            <h2>Verified identities</h2>
          </div>
          <label className="filter-search">
            <Search size={15} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search members" />
          </label>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Member</th><th>Wallet</th><th>Role</th><th>Participation</th><th>Joined</th><th>Chain</th></tr>
          </thead>
          <tbody>
            {filtered.map((member) => (
              <tr key={member.id}>
                <td className="primary-cell" data-label="Member"><strong>{member.name}</strong><span>{member.studentId} · {member.department}</span></td>
                <td className="mono" data-label="Wallet">{shortAddress(member.wallet)}</td>
                <td data-label="Role"><Badge tone={member.role === "Admin" ? "accent" : "neutral"}>{member.role}</Badge></td>
                <td data-label="Participation">
                  <div className="member-participation"><span><i style={{ width: `${member.participation}%` }} /></span><strong>{member.participation}%</strong></div>
                </td>
                <td data-label="Joined">{formatDate(member.joinedAt)}</td>
                <td data-label="Chain"><a className="table-link" href={explorerUrl("address", member.wallet)} target="_blank" rel="noreferrer">View <ExternalLink size={12} /></a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
