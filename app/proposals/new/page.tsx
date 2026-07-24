import { ArrowLeft, CircleHelp, Scale, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { CreateProposalForm } from "@/components/create-proposal-form";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui";

export default function NewProposalPage() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Member governance"
        title="Create a proposal"
        description="Write a clear decision for the collective. The content fingerprint and voting rules become independently verifiable."
        action={
          <Link href="/proposals" className="button button-secondary button-md">
            <ArrowLeft size={16} /> Cancel
          </Link>
        }
      />
      <section className="content-grid">
        <CreateProposalForm />
        <aside className="side-stack">
          <Card className="side-card">
            <span className="section-kicker">Before publishing</span>
            <h2>A strong proposal</h2>
            <div className="guidance-list">
              <div><CircleHelp size={17} /><span><strong>States one decision</strong><small>Avoid combining unrelated requests.</small></span></div>
              <div><Scale size={17} /><span><strong>Explains trade-offs</strong><small>Give members enough context to decide.</small></span></div>
              <div><ShieldCheck size={17} /><span><strong>Names an outcome</strong><small>Describe what passing the vote authorizes.</small></span></div>
            </div>
          </Card>
          <Card className="side-card governance-rules">
            <span className="section-kicker">Current constitution</span>
            <h2>Voting rules</h2>
            <div className="info-row"><span>Eligible voters</span><strong>Verified members</strong></div>
            <div className="info-row"><span>Quorum</span><strong>30%</strong></div>
            <div className="info-row"><span>YES threshold</span><strong>60%</strong></div>
            <div className="info-row"><span>Duplicate ballots</span><strong>Rejected</strong></div>
          </Card>
        </aside>
      </section>
    </div>
  );
}
