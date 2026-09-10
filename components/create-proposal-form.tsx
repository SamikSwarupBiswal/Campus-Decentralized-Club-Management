"use client";

import { Fingerprint, LoaderCircle, ShieldCheck, Wallet } from "lucide-react";
import { FormEvent, useState } from "react";
import { parseEther, sha256, stringToBytes, zeroAddress } from "viem";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Button, Card } from "./ui";
import { governorAbi, contractAddresses } from "@/lib/contracts";

export function CreateProposalForm() {
  const { isConnected } = useAccount();
  const { data: transactionHash, writeContract, isPending, error } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash: transactionHash });
  const [hash, setHash] = useState<string>();
  const created = receipt.isSuccess;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const canonical = JSON.stringify({
      title: form.get("title"),
      category: form.get("category"),
      description: form.get("description"),
      recipient: form.get("recipient") || zeroAddress,
      amount: form.get("amount") || "0",
    });
    const metadataHash = sha256(stringToBytes(canonical));
    setHash(metadataHash);

    if (!contractAddresses.governor || !isConnected) {
      return;
    }
    const recipient = String(form.get("recipient") || zeroAddress) as `0x${string}`;
    writeContract({
      address: contractAddresses.governor,
      abi: governorAbi,
      functionName: "createProposal",
      args: [
        metadataHash,
        recipient,
        parseEther(String(form.get("amount") || "0")),
        BigInt(Number(form.get("duration") || 7) * 43_200),
      ],
    });
  }

  if (created) {
    return (
      <Card className="content-card create-success">
        <div className="success-icon"><ShieldCheck size={28} /></div>
        <span className="section-kicker">Transaction confirmed</span>
        <h2>Ready for collective review</h2>
        <p>
          The proposal hash was recorded on Amoy. Metadata storage and live proposal indexing are not yet connected; keep your proposal content separately.
        </p>
        {hash && <div className="hash-box"><Fingerprint size={16} />{hash}</div>}
      </Card>
    );
  }

  return (
    <Card className="content-card">
      <form onSubmit={submit}>
        <p className="notice">Testnet developer flow: this records a hash only. Proposal content is not yet saved to MongoDB or added to the preview list.</p>
        <div className="form-grid">
          <div className="form-field full">
            <label htmlFor="title">Proposal title</label>
            <input id="title" name="title" required minLength={10} maxLength={120} placeholder="A clear, action-oriented title" />
            <span className="form-hint">10–120 characters. This becomes part of the immutable metadata hash.</span>
          </div>
          <div className="form-field">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" defaultValue="Treasury">
              <option>Treasury</option>
              <option>Events</option>
              <option>Operations</option>
              <option>Community</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="duration">Voting period</label>
            <select id="duration" name="duration" defaultValue="7">
              <option value="3">3 days</option>
              <option value="7">7 days</option>
              <option value="9">9 days</option>
            </select>
          </div>
          <div className="form-field full">
            <label htmlFor="description">Proposal description</label>
            <textarea id="description" name="description" required minLength={40} placeholder="Explain the problem, requested decision, impact, and how success will be measured." />
          </div>
          <div className="form-field">
            <label htmlFor="recipient">Treasury recipient</label>
            <input id="recipient" name="recipient" pattern="^0x[a-fA-F0-9]{40}$" placeholder="0x… (optional)" />
          </div>
          <div className="form-field">
            <label htmlFor="amount">Requested Test POL</label>
            <input id="amount" name="amount" type="number" min="0" max="10" step="0.001" placeholder="0.00" />
          </div>
        </div>
        <div className="notice proposal-notice">
          <ShieldCheck size={17} />
          <div>
            <strong>Governance rules are enforced on-chain</strong>
            Publishing creates an immutable metadata fingerprint. Results require 30% quorum and 60% YES approval.
          </div>
        </div>
        <div className="form-actions">
          <Button type="submit" disabled={isPending || receipt.isLoading || !isConnected || !contractAddresses.governor}>
            {isPending ? <LoaderCircle size={17} className="spin" /> : <Wallet size={17} />}
            {isPending ? "Confirm in MetaMask" : receipt.isLoading ? "Waiting for confirmation…" : contractAddresses.governor ? "Publish proposal" : "Contract configuration required"}
          </Button>
        </div>
        {!isConnected && <p className="form-hint">Connect MetaMask to publish a proposal.</p>}
        {error && <p className="form-error" role="alert">{error.message.split("\n")[0]}</p>}
        {receipt.isError && <p className="form-error" role="alert">The transaction was not confirmed. Check your wallet before retrying.</p>}
      </form>
    </Card>
  );
}
