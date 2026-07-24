import { ArrowUpRight, Clock3, Users2 } from "lucide-react";
import Link from "next/link";
import type { Proposal } from "@/lib/types";
import {
  proposalParticipation,
  shortAddress,
  timeUntil,
} from "@/lib/utils";
import { Badge, Card } from "./ui";

function proposalTone(state: Proposal["state"]) {
  if (state === "Passed" || state === "Executed") return "positive";
  if (state === "Defeated") return "negative";
  if (state === "Active") return "accent";
  return "neutral";
}

export function ProposalCard({ proposal }: { proposal: Proposal }) {
  const voteTotal =
    proposal.yesVotes + proposal.noVotes + proposal.abstainVotes;
  const yesPercent = Math.round(
    (proposal.yesVotes / Math.max(voteTotal, 1)) * 100,
  );
  const noPercent = Math.round(
    (proposal.noVotes / Math.max(voteTotal, 1)) * 100,
  );

  return (
    <Card className="proposal-card">
      <div className="proposal-card-header">
        <div className="proposal-id">#{proposal.onchainId}</div>
        <Badge tone={proposalTone(proposal.state)}>{proposal.state}</Badge>
      </div>
      <div className="proposal-category">{proposal.category}</div>
      <h3>{proposal.title}</h3>
      <p>{proposal.summary}</p>
      <div className="proposal-meta">
        <span>
          <Clock3 size={14} />
          {proposal.state === "Active"
            ? timeUntil(proposal.endsAt)
            : `Closed · ${proposal.state}`}
        </span>
        <span>
          <Users2 size={14} />
          {proposalParticipation(proposal)}% turnout
        </span>
      </div>
      <div className="vote-bar" aria-label={`${yesPercent}% yes, ${noPercent}% no`}>
        <span className="vote-yes" style={{ width: `${yesPercent}%` }} />
        <span className="vote-no" style={{ width: `${noPercent}%` }} />
        <span
          className="vote-abstain"
          style={{ width: `${100 - yesPercent - noPercent}%` }}
        />
      </div>
      <div className="vote-legend">
        <span>
          <i className="yes" /> Yes <strong>{proposal.yesVotes}</strong>
        </span>
        <span>
          <i className="no" /> No <strong>{proposal.noVotes}</strong>
        </span>
        <span>
          <i className="abstain" /> Abstain{" "}
          <strong>{proposal.abstainVotes}</strong>
        </span>
      </div>
      <div className="proposal-footer">
        <span className="mono">by {shortAddress(proposal.proposer)}</span>
        <Link href={`/proposals/${proposal.id}`}>
          View proposal <ArrowUpRight size={15} />
        </Link>
      </div>
    </Card>
  );
}
