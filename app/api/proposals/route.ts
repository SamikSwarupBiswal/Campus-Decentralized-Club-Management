import { NextResponse } from "next/server";
import { isVerifiedMember } from "@/lib/server/blockchain";
import { getDatabase } from "@/lib/server/mongodb";
import {
  createProposalRecord,
  getAllProposals,
} from "@/lib/server/proposals";
import { proposalSchema } from "@/lib/server/schemas";
import { getSession } from "@/lib/server/session";

export const runtime = "nodejs";

export async function GET() {
  const db = await getDatabase();
  const list = await getAllProposals();
  return NextResponse.json({
    proposals: list,
    mode: db ? "database" : "demo",
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  const rawBody = await request.json().catch(() => null);

  const parsed = proposalSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid proposal details" },
      { status: 400 },
    );
  }

  // Determine proposer address: session address has top precedence, then parsed.proposer
  const proposerAddress = session?.address || parsed.data.proposer;

  if (!proposerAddress) {
    return NextResponse.json(
      { error: "Connect your MetaMask wallet or sign in as a club member to submit a proposal" },
      { status: 401 },
    );
  }

  // Verify membership
  const verified = await isVerifiedMember(proposerAddress);
  if (!verified) {
    return NextResponse.json(
      {
        error:
          "Only verified club members can publish proposals. Please ask a club administrator to register your wallet in the member registry.",
      },
      { status: 403 },
    );
  }

  const proposal = await createProposalRecord({
    title: parsed.data.title,
    category: parsed.data.category,
    duration: parsed.data.duration,
    description: parsed.data.description,
    recipient: parsed.data.recipient || undefined,
    amount: parsed.data.amount || undefined,
    metadataHash: parsed.data.metadataHash,
    proposer: proposerAddress,
  });

  return NextResponse.json({
    ok: true,
    proposal,
    message: "Proposal created and recorded in governance database",
  });
}
