import { NextResponse } from "next/server";
import { isVerifiedMember } from "@/lib/server/blockchain";
import {
  castVoteRecord,
  getBallotRecord,
  getProposalById,
} from "@/lib/server/proposals";
import { getSession } from "@/lib/server/session";
import type { VoteChoice } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const proposal = await getProposalById(id);
  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const session = await getSession();
  const voter = (searchParams.get("voter") || session?.address) as
    | `0x${string}`
    | undefined;

  let hasVoted = false;
  let userChoice: VoteChoice | null = null;
  let txHash: string | null = null;

  if (voter) {
    const ballot = await getBallotRecord(proposal.id, voter);
    if (ballot) {
      hasVoted = true;
      userChoice = ballot.choice;
      txHash = ballot.txHash || null;
    }
  }

  return NextResponse.json({
    proposal,
    hasVoted,
    userChoice,
    txHash,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getSession();
  const body = await request.json().catch(() => ({}));
  const choice = body.choice as VoteChoice;
  const voter = (session?.address || body.voter) as `0x${string}` | undefined;
  const txHash = (body.txHash as string) || undefined;

  if (!voter) {
    return NextResponse.json(
      { error: "Connect your wallet or sign in to vote" },
      { status: 401 },
    );
  }

  const verified = await isVerifiedMember(voter);
  if (!verified) {
    return NextResponse.json(
      { error: "Only verified members are eligible to cast ballots" },
      { status: 403 },
    );
  }

  if (!["YES", "NO", "ABSTAIN"].includes(choice)) {
    return NextResponse.json({ error: "Invalid vote choice" }, { status: 400 });
  }

  const result = await castVoteRecord(id, voter, choice, txHash);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    proposal: result.proposal,
    message: "Ballot cast successfully",
  });
}
