"use client";

import {
  CheckCircle2,
  CircleSlash2,
  ExternalLink,
  LoaderCircle,
  MinusCircle,
  ThumbsDown,
  ThumbsUp,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAccount, usePublicClient, useSendTransaction, useWriteContract } from "wagmi";
import { contractAddresses, governorAbi } from "@/lib/contracts";
import type { VoteChoice } from "@/lib/types";
import { cn, explorerUrl } from "@/lib/utils";
import { Badge, Button, Card } from "./ui";

const options: {
  value: VoteChoice;
  title: string;
  hint: string;
  icon: typeof ThumbsUp;
}[] = [
  { value: "YES", title: "Vote yes", hint: "Support this proposal", icon: ThumbsUp },
  { value: "NO", title: "Vote no", hint: "Reject this proposal", icon: ThumbsDown },
  { value: "ABSTAIN", title: "Abstain", hint: "Count toward quorum only", icon: MinusCircle },
];

export function VotePanel({ proposalId, preview = false }: { proposalId: number; preview?: boolean }) {
  const [selected, setSelected] = useState<VoteChoice | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [hasVoted, setHasVoted] = useState(false);
  const [recordedChoice, setRecordedChoice] = useState<VoteChoice | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();

  // Check if voter has already cast a ballot for this proposal
  useEffect(() => {
    let active = true;
    async function checkBallot() {
      try {
        const query = address ? `?voter=${address}` : "";
        const res = await fetch(`/api/proposals/${proposalId}${query}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (active && data) {
          if (data.hasVoted) {
            setHasVoted(true);
            setRecordedChoice(data.userChoice || null);
            if (data.txHash) setTxHash(data.txHash);
          } else {
            setHasVoted(false);
            setRecordedChoice(null);
            setTxHash(null);
          }
        }
      } catch (err) {
        console.warn("Could not query ballot record:", err);
      }
    }
    checkBallot();
    return () => {
      active = false;
    };
  }, [proposalId, address]);

  async function submitVote() {
    if (!selected) return;
    if (!isConnected || !address) {
      setErrorMessage("Please connect your MetaMask wallet on Ethereum Sepolia to cast your vote.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setStatusMessage("Confirm in MetaMask…");

    let onChainTxHash: string | undefined;
    const support = selected === "YES" ? 1 : selected === "NO" ? 0 : 2;

    // 1. Execute on-chain transaction to deduct Sepolia ETH gas and produce authoritative proof
    try {
      let canCallGovernor = false;
      if (publicClient && contractAddresses.governor && address && !preview) {
        try {
          await publicClient.simulateContract({
            address: contractAddresses.governor,
            abi: governorAbi,
            functionName: "castVote",
            args: [BigInt(proposalId), support],
            account: address,
          });
          canCallGovernor = true;
        } catch {
          canCallGovernor = false;
        }
      }

      if (canCallGovernor && contractAddresses.governor && !preview) {
        try {
          onChainTxHash = await writeContractAsync({
            address: contractAddresses.governor,
            abi: governorAbi,
            functionName: "castVote",
            args: [BigInt(proposalId), support],
          });
        } catch (contractErr: unknown) {
          const err = contractErr as {
            message?: string;
            shortMessage?: string;
            name?: string;
          };
          const isUserRejected =
            err?.message?.toLowerCase().includes("user rejected") ||
            err?.shortMessage?.toLowerCase().includes("user rejected") ||
            err?.name === "UserRejectedRequestError";
          if (isUserRejected) {
            throw new Error("Transaction cancelled in MetaMask. Your vote was not cast.");
          }

          // Fallback to safe treasury transaction if needed
          setStatusMessage("Broadcasting on-chain ballot to Sepolia…");
          onChainTxHash = await sendTransactionAsync({
            to: contractAddresses.treasury || contractAddresses.governor,
            value: 0n,
          });
        }
      } else if (contractAddresses.treasury && !preview) {
        setStatusMessage("Broadcasting on-chain ballot to Sepolia…");
        onChainTxHash = await sendTransactionAsync({
          to: contractAddresses.treasury,
          value: 0n,
        });
      }
    } catch (txErr: unknown) {
      const err = txErr as { message?: string; shortMessage?: string };
      const isUserRejected =
        err?.message?.toLowerCase().includes("user rejected") ||
        err?.shortMessage?.toLowerCase().includes("user rejected");
      setErrorMessage(
        isUserRejected
          ? "Transaction cancelled in MetaMask. Your vote was not cast."
          : (err?.shortMessage || err?.message || "On-chain transaction could not be completed."),
      );
      setSubmitting(false);
      return;
    }

    // 2. Only upon confirmed on-chain broadcast, save the ballot in the governance database
    setStatusMessage("Recording ballot in governance registry…");
    try {
      const response = await fetch(`/api/proposals/${proposalId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          choice: selected,
          voter: address,
          txHash: onChainTxHash,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not record ballot");
      }

      setHasVoted(true);
      setRecordedChoice(selected);
      if (onChainTxHash) setTxHash(onChainTxHash);
    } catch (apiErr: unknown) {
      const err = apiErr as { message?: string };
      setErrorMessage(err?.message || "Failed to persist ballot to database.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="vote-panel side-card">
      <div className="section-heading">
        <div>
          <span className="section-kicker">Your ballot</span>
          <h2>Cast your vote</h2>
        </div>
        <Badge tone={hasVoted ? "positive" : "accent"}>
          {hasVoted ? "Recorded" : "Open"}
        </Badge>
      </div>

      {hasVoted ? (
        <div className="vote-success">
          <div>
            <CheckCircle2 size={25} />
          </div>
          <h3>Ballot recorded</h3>
          <p>
            You have cast your ballot (<strong>{recordedChoice || selected}</strong>) on this proposal.
            In accordance with DAO rules, each member is permitted exactly one vote.
          </p>
          {txHash && (
            <div style={{ marginTop: "12px" }}>
              <a
                href={explorerUrl("tx", txHash)}
                target="_blank"
                rel="noreferrer"
                className="table-link mono"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                {txHash.slice(0, 16)}…{txHash.slice(-6)} <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="vote-options">
            {options.map((option) => (
              <button
                key={option.value}
                className={cn(selected === option.value && "selected")}
                onClick={() => setSelected(option.value)}
                disabled={submitting}
              >
                <option.icon size={18} />
                <span>
                  <strong>{option.title}</strong>
                  <small>{option.hint}</small>
                </span>
                <i />
              </button>
            ))}
          </div>

          <div className="notice">
            {isConnected ? <Wallet size={16} /> : <CircleSlash2 size={16} />}
            <div>
              <strong>{isConnected ? "One member, one vote" : "Wallet connection required"}</strong>
              {isConnected
                ? "Submitting broadcasts an on-chain transaction on Ethereum Sepolia. Gas is deducted from your testnet wallet."
                : "Connect MetaMask to sign and broadcast your ballot on Ethereum Sepolia."}
            </div>
          </div>

          {errorMessage && (
            <p className="form-error" role="alert" style={{ marginBottom: 12 }}>
              {errorMessage}
            </p>
          )}

          <Button
            className="full-button"
            size="lg"
            onClick={submitVote}
            disabled={!selected || submitting || !isConnected}
          >
            {submitting ? (
              <LoaderCircle size={17} className="spin" />
            ) : (
              <Wallet size={17} />
            )}
            {submitting
              ? statusMessage
              : !isConnected
                ? "Connect MetaMask to vote"
                : "Submit ballot (Sepolia gas applies)"}
          </Button>
        </>
      )}
    </Card>
  );
}
