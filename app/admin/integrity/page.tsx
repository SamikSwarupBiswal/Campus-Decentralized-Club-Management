import {
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  Fingerprint,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge, Card } from "@/components/ui";
import { events, proposals } from "@/lib/demo-data";
import { formatDate } from "@/lib/utils";

const proofs = [
  {
    id: "proof-24",
    kind: "Attendance",
    label: events[2].name,
    date: events[2].date,
    hash: "0xf7d3029ab28c20372fe3ed0a60b2c00311e90de83c20d1d6c183035bec6f7c20",
    records: "58 attendees",
  },
  {
    id: "proof-23",
    kind: "Proposal",
    label: proposals[2].title,
    date: proposals[2].createdAt,
    hash: proposals[2].metadataHash,
    records: "Proposal #102",
  },
  {
    id: "proof-22",
    kind: "Attendance",
    label: "Design Systems Roundtable",
    date: "2026-07-12",
    hash: "0x08d20d7bcbeaa6191b0b456ab212c005edc074803640822e9b546668a635fbea",
    records: "42 attendees",
  },
];

export default function IntegrityPage() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Tamper detection"
        title="Integrity proofs"
        description="Recompute off-chain records and compare them with immutable blockchain fingerprints."
        action={<button className="button button-secondary button-md"><RefreshCw size={16} /> Verify all</button>}
      />
      <section className="integrity-hero">
        <Card className="integrity-score-card">
          <div className="integrity-ring"><strong>100%</strong><span>verified</span></div>
          <div><span className="section-kicker">Current integrity posture</span><h2>All proofs match</h2><p>24 of 24 finalized records match their authoritative Ethereum Sepolia fingerprints.</p></div>
          <ShieldCheck size={30} />
        </Card>
        <Card className="integrity-metric"><FileCheck2 size={18} /><span>Proposal proofs<strong>14</strong></span></Card>
        <Card className="integrity-metric"><Fingerprint size={18} /><span>Attendance proofs<strong>10</strong></span></Card>
      </section>
      <Card className="content-card proof-table-card">
        <div className="section-heading">
          <div><span className="section-kicker">Verification ledger</span><h2>Finalized records</h2></div>
          <Badge tone="positive"><CheckCircle2 size={11} /> No mismatch</Badge>
        </div>
        <table className="data-table">
          <thead><tr><th>Record</th><th>Type</th><th>Finalized</th><th>Canonical hash</th><th>Integrity</th><th>Explorer</th></tr></thead>
          <tbody>
            {proofs.map((proof) => (
              <tr key={proof.id}>
                <td className="primary-cell" data-label="Record"><strong>{proof.label}</strong><span>{proof.records}</span></td>
                <td data-label="Type"><Badge tone="neutral">{proof.kind}</Badge></td>
                <td data-label="Finalized">{formatDate(proof.date)}</td>
                <td className="mono" data-label="Canonical hash">{proof.hash.slice(0, 10)}…{proof.hash.slice(-6)}</td>
                <td data-label="Integrity"><span className="integrity-match"><CheckCircle2 size={13} /> Exact match</span></td>
                <td data-label="Explorer"><a className="table-link" href="https://sepolia.etherscan.io" target="_blank" rel="noreferrer">View <ExternalLink size={12} /></a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
