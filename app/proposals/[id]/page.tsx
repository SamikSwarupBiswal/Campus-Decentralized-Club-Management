import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Fingerprint,
  ShieldCheck,
  Users2,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Badge, Card } from "@/components/ui";
import { VotePanel } from "@/components/vote-panel";
import { proposals } from "@/lib/demo-data";
import {
  explorerUrl,
  formatDate,
  proposalParticipation,
  shortAddress,
  timeUntil,
} from "@/lib/utils";

export function generateStaticParams() {
  return proposals.map((proposal) => ({ id: proposal.id }));
}

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const proposal = proposals.find((item) => item.id === id);
  if (!proposal) notFound();

  const totalVotes =
    proposal.yesVotes + proposal.noVotes + proposal.abstainVotes;
  const yesPercent = Math.round((proposal.yesVotes / totalVotes) * 100);
  const noPercent = Math.round((proposal.noVotes / totalVotes) * 100);

  return (
    <div className="page">
      <PageHeader
        eyebrow={`Proposal #${proposal.onchainId}`}
        title={proposal.title}
        description={proposal.summary}
        action={
          <Link className="button button-secondary button-md" href="/proposals">
            <ArrowLeft size={16} /> All proposals
          </Link>
        }
      />

      <div className="proposal-detail-status">
        <Badge tone={proposal.state === "Active" ? "accent" : "positive"}>
          {proposal.state}
        </Badge>
        <span><Clock3 size={14} /> {timeUntil(proposal.endsAt)}</span>
        <span><Users2 size={14} /> {proposalParticipation(proposal)}% turnout</span>
        <span className="mono">proposed by {shortAddress(proposal.proposer)}</span>
      </div>

      <section className="content-grid proposal-detail-grid">
        <div className="side-stack">
          <Card className="content-card prose-card">
            <span className="section-kicker">Proposal brief</span>
            <h2>Why this decision matters</h2>
            <p>{proposal.description}</p>
            <h3>Requested outcome</h3>
            <p>
              Members are asked to approve the proposal as written. An outcome
              requires at least 30% participation and 60% YES approval among
              decisive votes. Neither an administrator nor the proposal author
              can change the result.
            </p>
            {proposal.amount && (
              <div className="treasury-request">
                <WalletCards size={20} />
                <div>
                  <span>Treasury request</span>
                  <strong>{proposal.amount}</strong>
                </div>
                <div>
                  <span>Recipient</span>
                  <strong className="mono">
                    {shortAddress(proposal.recipient)}
                  </strong>
                </div>
              </div>
            )}
          </Card>

          <Card className="content-card results-card">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Live on-chain tally</span>
                <h2>Voting results</h2>
              </div>
              <span className="live-label"><span className="live-dot" /> Synced</span>
            </div>
            <div className="results-total">
              <strong>{totalVotes}</strong>
              <span>total ballots</span>
            </div>
            <div className="vote-bar results">
              <span className="vote-yes" style={{ width: `${yesPercent}%` }} />
              <span className="vote-no" style={{ width: `${noPercent}%` }} />
              <span
                className="vote-abstain"
                style={{ width: `${100 - yesPercent - noPercent}%` }}
              />
            </div>
            <div className="result-breakdown">
              <div><i className="yes" /><span>YES</span><strong>{proposal.yesVotes}</strong><em>{yesPercent}%</em></div>
              <div><i className="no" /><span>NO</span><strong>{proposal.noVotes}</strong><em>{noPercent}%</em></div>
              <div><i className="abstain" /><span>ABSTAIN</span><strong>{proposal.abstainVotes}</strong><em>{100 - yesPercent - noPercent}%</em></div>
            </div>
            <div className="threshold-grid">
              <div>
                <span>Quorum</span>
                <strong><CheckCircle2 size={15} /> Reached</strong>
                <small>30% required · {proposalParticipation(proposal)}% current</small>
              </div>
              <div>
                <span>Approval threshold</span>
                <strong><CheckCircle2 size={15} /> On track</strong>
                <small>60% required · {yesPercent}% current</small>
              </div>
            </div>
          </Card>
        </div>

        <aside className="side-stack">
          {proposal.state === "Active" && (
            <VotePanel proposalId={proposal.onchainId} />
          )}
          <Card className="side-card">
            <span className="section-kicker">Integrity check</span>
            <h2>Metadata verified</h2>
            <div className="verified-panel proposal-verified">
              <strong><ShieldCheck size={16} /> Exact hash match</strong>
              <p>The off-chain proposal content matches its on-chain fingerprint.</p>
            </div>
            <span className="hash-label">SHA-256 metadata hash</span>
            <div className="hash-box">
              <Fingerprint size={16} />
              {proposal.metadataHash}
            </div>
          </Card>
          <Card className="side-card">
            <span className="section-kicker">Timeline</span>
            <h2>Governance record</h2>
            <div className="timeline">
              <div className="done"><i /><span><strong>Proposal created</strong><small>{formatDate(proposal.createdAt)}</small></span></div>
              <div className="current"><i /><span><strong>Voting in progress</strong><small>Ends {formatDate(proposal.endsAt)}</small></span></div>
              <div><i /><span><strong>Outcome finalized</strong><small>Automatic after voting</small></span></div>
              <div><i /><span><strong>Execution</strong><small>Only if approved</small></span></div>
            </div>
            <a className="button button-secondary button-md full-button" href={explorerUrl("address", proposal.proposer)} target="_blank" rel="noreferrer">
              View on PolygonScan <ExternalLink size={15} />
            </a>
          </Card>
        </aside>
      </section>
    </div>
  );
}
