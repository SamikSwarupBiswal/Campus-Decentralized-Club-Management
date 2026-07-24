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
import { governorAbi, contractAddresses } from "@/lib/contracts";
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

export function VotePanel({ proposalId }: { proposalId: number }) {
  const [selected, setSelected] = useState<VoteChoice | null>(null);
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const { isConnected } = useAccount();
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });
  const isConfigured = Boolean(contractAddresses.governor);
  const complete = demoSubmitted || receipt.isSuccess;

  function submitVote() {
    if (!selected) return;
    if (!isConfigured) {
      setDemoSubmitted(true);
      return;
    }
    if (!isConnected || !contractAddresses.governor) return;
    const support = selected === "YES" ? 1 : selected === "NO" ? 0 : 2;
    writeContract({
      address: contractAddresses.governor,
      abi: governorAbi,
      functionName: "castVote",
      args: [BigInt(proposalId), support],
    });
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
            {isConfigured
              ? "Your signed ballot is now verifiable on Polygon Amoy."
              : "Demo vote recorded locally. Configure a governor address to submit on-chain."}
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
            {isConfigured ? <Wallet size={16} /> : <CircleSlash2 size={16} />}
            <div>
              <strong>{isConfigured ? "Wallet signature required" : "Demo mode active"}</strong>
              {isConfigured
                ? "MetaMask will ask you to confirm one testnet transaction."
                : "No contract address is configured, so this interaction will be simulated."}
            </div>
          </div>
          {error && <p className="form-error">{error.message}</p>}
          <Button
            className="full-button"
            size="lg"
            onClick={submitVote}
            disabled={!selected || isPending || receipt.isLoading}
          >
            {isPending || receipt.isLoading ? (
              <LoaderCircle size={17} className="spin" />
            ) : (
              <Wallet size={17} />
            )}
            {isPending
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
