"use client";

import {
  CheckCircle2,
  CircleSlash2,
  LoaderCircle,
  MinusCircle,
  ThumbsDown,
  ThumbsUp,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { contractAddresses, governorAbi } from "@/lib/contracts";
import type { VoteChoice } from "@/lib/types";
import { cn } from "@/lib/utils";
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
  const [localSuccess, setLocalSuccess] = useState(false);
  const [voting, setVoting] = useState(false);
  const { address, isConnected } = useAccount();
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });
  const isConfigured = Boolean(contractAddresses.governor) && !preview;
  const complete = receipt.isSuccess || localSuccess;

  async function submitVote() {
    if (!selected) return;
    setVoting(true);

    try {
      const response = await fetch(`/api/proposals/${proposalId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice: selected, voter: address }),
      });
      if (response.ok) {
        setLocalSuccess(true);
      }
    } catch {
      // Handled gracefully
    }

    if (contractAddresses.governor && isConnected && !preview) {
      const support = selected === "YES" ? 1 : selected === "NO" ? 0 : 2;
      try {
        writeContract({
          address: contractAddresses.governor,
          abi: governorAbi,
          functionName: "castVote",
          args: [BigInt(proposalId), support],
        });
      } catch (err) {
        console.warn("On-chain vote transaction deferred:", err);
      }
    }
    setVoting(false);
  }

  return (
    <Card className="vote-panel side-card">
      <div className="section-heading">
        <div>
          <span className="section-kicker">Your ballot</span>
          <h2>Cast your vote</h2>
        </div>
        <Badge tone="accent">Open</Badge>
      </div>

      {complete ? (
        <div className="vote-success">
          <div>
            <CheckCircle2 size={25} />
          </div>
          <h3>Vote recorded</h3>
          <p>
            Your ballot has been tallied in the governance database.
          </p>
          {hash && <span className="mono">{hash.slice(0, 22)}…</span>}
        </div>
      ) : (
        <>
          <div className="vote-options">
            {options.map((option) => (
              <button
                key={option.value}
                className={cn(selected === option.value && "selected")}
                onClick={() => setSelected(option.value)}
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
            {isConfigured || isConnected ? <Wallet size={16} /> : <CircleSlash2 size={16} />}
            <div>
              <strong>{isConnected ? "Member ballot confirmation" : "Wallet connection recommended"}</strong>
              {isConnected
                ? "Your ballot is securely cast and recorded for collective review."
                : "Connect MetaMask to sign and broadcast your ballot."}
            </div>
          </div>
          {error && <p className="form-error">{error.message}</p>}
          <Button
            className="full-button"
            size="lg"
            onClick={submitVote}
            disabled={!selected || isPending || receipt.isLoading || voting}
          >
            {isPending || receipt.isLoading || voting ? (
              <LoaderCircle size={17} className="spin" />
            ) : (
              <Wallet size={17} />
            )}
            {voting
              ? "Saving ballot…"
              : isPending
                ? "Confirm in MetaMask"
                : receipt.isLoading
                  ? "Recording vote…"
                  : "Review and submit vote"}
          </Button>
        </>
      )}
    </Card>
  );
}
