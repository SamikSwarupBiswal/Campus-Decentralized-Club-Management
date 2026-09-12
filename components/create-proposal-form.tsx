"use client";

import {
  ArrowRight,
  Fingerprint,
  LoaderCircle,
  ShieldCheck,
  UserCheck,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { keccak256, parseEther, stringToBytes, zeroAddress } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { contractAddresses, governorAbi } from "@/lib/contracts";
import type { Proposal } from "@/lib/types";
import { shortAddress } from "@/lib/utils";
import { Button, Card } from "./ui";

interface SessionInfo {
  address: string | null;
  isAdmin: boolean;
  isRegistered: boolean;
  name: string | null;
}

export function CreateProposalForm() {
  const { address, isConnected } = useAccount();
  const { data: transactionHash, writeContract, isPending } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash: transactionHash });

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hash, setHash] = useState<string>();
  const [createdProposal, setCreatedProposal] = useState<Proposal | null>(null);

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: SessionInfo) => setSession(data))
      .catch(() => setSession(null));
  }, [address]);

  const activeWallet = address || session?.address;
  const isMember = Boolean(session?.isRegistered || session?.isAdmin || activeWallet);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    const category = String(form.get("category") || "Treasury") as Proposal["category"];
    const duration = Number(form.get("duration") || 7);
    const description = String(form.get("description") || "").trim();
    const recipientInput = String(form.get("recipient") || "").trim();
    const amountInput = String(form.get("amount") || "").trim();

    const recipient = recipientInput && /^0x[a-fA-F0-9]{40}$/.test(recipientInput)
      ? (recipientInput as `0x${string}`)
      : zeroAddress;
    const amount = amountInput || "0";

    const canonical = JSON.stringify({
      title,
      category,
      description,
      recipient,
      amount,
    });
    const metadataHash = keccak256(stringToBytes(canonical));
    setHash(metadataHash);

    try {
      // 1. Persist proposal content to MongoDB and memory store
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          duration,
          description,
          recipient: recipient !== zeroAddress ? recipient : undefined,
          amount: amount !== "0" ? amount : undefined,
          metadataHash,
          proposer: activeWallet,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to publish proposal");
      }

      setCreatedProposal(result.proposal);

      // 2. Optionally broadcast on-chain if governor is configured and connected
      if (contractAddresses.governor && isConnected) {
        try {
          writeContract({
            address: contractAddresses.governor,
            abi: governorAbi,
            functionName: "createProposal",
            args: [
              metadataHash,
              recipient,
              parseEther(amount),
              BigInt(duration * 43_200),
            ],
          });
        } catch (onChainError) {
          console.warn("On-chain proposal write skipped or deferred:", onChainError);
        }
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred while saving the proposal.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (createdProposal) {
    return (
      <Card className="content-card create-success">
        <div className="success-icon">
          <ShieldCheck size={32} />
        </div>
        <span className="section-kicker">Proposal Published</span>
        <h2>Ready for collective review</h2>
        <p>
          Your proposal <strong>&quot;{createdProposal.title}&quot;</strong> has been
          successfully recorded in the governance database and indexed for collective voting.
        </p>
        <div className="hash-box">
          <Fingerprint size={16} />
          <span>Keccak-256: {createdProposal.metadataHash || hash}</span>
        </div>
        <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
          <Link
            href={`/proposals/${createdProposal.id}`}
            className="button button-primary button-md"
          >
            View proposal <ArrowRight size={16} />
          </Link>
          <Link href="/proposals" className="button button-secondary button-md">
            All proposals
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="content-card">
      <form onSubmit={submit}>
        <div className="form-grid">
          <div className="form-field full">
            <label htmlFor="title">Proposal title</label>
            <input
              id="title"
              name="title"
              required
              minLength={10}
              maxLength={120}
              placeholder="A clear, action-oriented title"
            />
            <span className="form-hint">
              10–120 characters. This becomes part of the immutable metadata hash.
            </span>
          </div>
          <div className="form-field">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" defaultValue="Treasury">
              <option value="Treasury">Treasury</option>
              <option value="Events">Events</option>
              <option value="Operations">Operations</option>
              <option value="Community">Community</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="duration">Voting period</label>
            <select id="duration" name="duration" defaultValue="7">
              <option value="3">3 days</option>
              <option value="7">7 days</option>
              <option value="9">9 days</option>
              <option value="14">14 days</option>
            </select>
          </div>
          <div className="form-field full">
            <label htmlFor="description">Proposal description</label>
            <textarea
              id="description"
              name="description"
              required
              minLength={40}
              placeholder="Explain the problem, requested decision, impact, and how success will be measured."
            />
          </div>
          <div className="form-field">
            <label htmlFor="recipient">Treasury recipient</label>
            <input
              id="recipient"
              name="recipient"
              pattern="^0x[a-fA-F0-9]{40}$"
              placeholder="0x… (optional)"
            />
          </div>
          <div className="form-field">
            <label htmlFor="amount">Requested Sepolia ETH</label>
            <input
              id="amount"
              name="amount"
              type="number"
              min="0"
              max="10"
              step="0.001"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="notice proposal-notice">
          <ShieldCheck size={17} />
          <div>
            <strong>Tamper-evident governance</strong>
            Publishing creates an immutable metadata fingerprint saved to MongoDB and Ethereum Sepolia testnet.
            Outcomes require 30% quorum and 60% YES approval.
          </div>
        </div>

        {activeWallet && (
          <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--color-fg-muted)" }}>
            <UserCheck size={15} style={{ color: "var(--color-accent, #6366f1)" }} />
            <span>
              Proposing as: <strong className="mono">{shortAddress(activeWallet)}</strong>
              {session?.isRegistered ? " (Verified Member)" : session?.isAdmin ? " (Admin)" : ""}
            </span>
          </div>
        )}

        <div className="form-actions">
          <Button
            type="submit"
            disabled={submitting || isPending || receipt.isLoading || !isMember}
          >
            {submitting || isPending ? (
              <LoaderCircle size={17} className="spin" />
            ) : (
              <Wallet size={17} />
            )}
            {submitting
              ? "Saving to database…"
              : isPending
                ? "Confirm in MetaMask…"
                : receipt.isLoading
                  ? "Waiting for confirmation…"
                  : !activeWallet
                    ? "Connect wallet to publish"
                    : "Publish proposal"}
          </Button>
        </div>

        {!activeWallet && (
          <p className="form-hint">Connect MetaMask or sign in to publish a proposal.</p>
        )}
        {errorMessage && (
          <p className="form-error" role="alert">
            {errorMessage}
          </p>
        )}
      </form>
    </Card>
  );
}
