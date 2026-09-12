import { keccak256, stringToBytes, zeroAddress } from "viem";
import { proposals as demoProposals } from "../demo-data";
import { getDatabase } from "./mongodb";
import type { Proposal, VoteChoice } from "@/lib/types";

declare global {
  // eslint-disable-next-line no-var
  var __campusDaoCustomProposals: Map<string, Proposal> | undefined;
}

export const customProposals =
  global.__campusDaoCustomProposals ||
  (global.__campusDaoCustomProposals = new Map<string, Proposal>());

export async function getAllProposals(): Promise<Proposal[]> {
  let dbProposals: Proposal[] = [];
  const db = await getDatabase();
  if (db) {
    try {
      dbProposals = (await db
        .collection("proposals")
        .find({}, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .toArray()) as unknown as Proposal[];
    } catch (e) {
      console.error("Failed to load proposals from MongoDB:", e);
    }
  }

  const seenIds = new Set<string>();
  const combined: Proposal[] = [];

  // Database and in-memory proposals come first
  for (const item of [...dbProposals, ...Array.from(customProposals.values())]) {
    if (item.id && !seenIds.has(item.id)) {
      seenIds.add(item.id);
      combined.push(item);
    }
  }

  // Fallback demo proposals
  for (const item of demoProposals) {
    if (item.id && !seenIds.has(item.id)) {
      seenIds.add(item.id);
      combined.push(item);
    }
  }

  return combined;
}

export async function getProposalById(id: string): Promise<Proposal | null> {
  // Check memory
  if (customProposals.has(id)) {
    return customProposals.get(id)!;
  }

  // Check MongoDB
  const db = await getDatabase();
  if (db) {
    try {
      const doc = await db.collection("proposals").findOne(
        {
          $or: [
            { id },
            { onchainId: Number.isInteger(Number(id)) ? Number(id) : -1 },
          ],
        },
        { projection: { _id: 0 } },
      );
      if (doc) {
        return doc as unknown as Proposal;
      }
    } catch (e) {
      console.error("Failed to query proposal from MongoDB:", e);
    }
  }

  // Fallback demo data
  const demo = demoProposals.find(
    (item) => item.id === id || String(item.onchainId) === id,
  );
  if (demo) {
    return demo;
  }

  return null;
}

export interface CreateProposalInput {
  title: string;
  category: "Treasury" | "Events" | "Operations" | "Community";
  duration?: number;
  description: string;
  recipient?: string;
  amount?: string;
  metadataHash?: string;
  proposer: `0x${string}`;
}

export async function createProposalRecord(
  input: CreateProposalInput,
): Promise<Proposal> {
  const recipientAddr = (input.recipient && /^0x[a-fA-F0-9]{40}$/.test(input.recipient)
    ? input.recipient.toLowerCase()
    : zeroAddress) as `0x${string}`;
  const amountNormalized = input.amount?.trim() ? input.amount.trim() : "0";

  // Compute canonical metadata hash if not supplied
  const canonical = JSON.stringify({
    title: input.title,
    category: input.category,
    description: input.description,
    recipient: recipientAddr,
    amount: amountNormalized,
  });
  const computedHash = keccak256(stringToBytes(canonical)) as `0x${string}`;
  const metadataHash = (input.metadataHash || computedHash) as `0x${string}`;

  // Find next proposal ID
  const allCurrent = await getAllProposals();
  const maxOnchainId = allCurrent.reduce(
    (max, p) => Math.max(max, p.onchainId || 0),
    100,
  );
  const nextOnchainId = maxOnchainId + 1;
  const proposalId = `prop-${nextOnchainId}`;

  const durationDays = input.duration || 7;
  const now = new Date();
  const endsAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  // Generate concise summary from description
  const firstSentence = input.description.split(/(?<=[.?!])\s+/)[0] || input.description;
  const summary = firstSentence.length > 150 ? `${firstSentence.slice(0, 147)}...` : firstSentence;

  const proposalRecord: Proposal = {
    id: proposalId,
    onchainId: nextOnchainId,
    title: input.title,
    summary,
    description: input.description,
    category: input.category,
    proposer: input.proposer.toLowerCase() as `0x${string}`,
    recipient: recipientAddr !== zeroAddress ? recipientAddr : undefined,
    amount: amountNormalized !== "0" ? `${amountNormalized} ETH` : undefined,
    state: "Active",
    yesVotes: 1, // Proposer votes YES automatically
    noVotes: 0,
    abstainVotes: 0,
    memberSnapshot: 170,
    endsAt: endsAt.toISOString(),
    createdAt: now.toISOString(),
    metadataHash,
  };

  // Save to MongoDB if available
  const db = await getDatabase();
  if (db) {
    try {
      await db.collection("proposals").insertOne({
        ...proposalRecord,
        createdAtDate: now,
      });
    } catch (e) {
      console.error("Failed to insert proposal into MongoDB:", e);
    }
  }

  // Save in-memory
  customProposals.set(proposalRecord.id, proposalRecord);

  return proposalRecord;
}

export async function castVoteRecord(
  proposalId: string,
  voter: string,
  choice: VoteChoice,
): Promise<{ ok: boolean; proposal?: Proposal; error?: string }> {
  const proposal = await getProposalById(proposalId);
  if (!proposal) {
    return { ok: false, error: "Proposal not found" };
  }

  if (proposal.state !== "Active") {
    return { ok: false, error: "Voting is closed for this proposal" };
  }

  const updated: Proposal = {
    ...proposal,
    yesVotes: proposal.yesVotes + (choice === "YES" ? 1 : 0),
    noVotes: proposal.noVotes + (choice === "NO" ? 1 : 0),
    abstainVotes: proposal.abstainVotes + (choice === "ABSTAIN" ? 1 : 0),
  };

  const db = await getDatabase();
  if (db) {
    try {
      await db.collection("proposals").updateOne(
        { id: proposal.id },
        {
          $inc: {
            yesVotes: choice === "YES" ? 1 : 0,
            noVotes: choice === "NO" ? 1 : 0,
            abstainVotes: choice === "ABSTAIN" ? 1 : 0,
          },
        },
      );
      // Also record ballot to prevent duplicate votes
      await db.collection("ballots").insertOne({
        proposalId: proposal.id,
        voter: voter.toLowerCase(),
        choice,
        timestamp: new Date(),
      });
    } catch (e) {
      console.error("Failed to update proposal vote in MongoDB:", e);
    }
  }

  customProposals.set(updated.id, updated);
  return { ok: true, proposal: updated };
}
