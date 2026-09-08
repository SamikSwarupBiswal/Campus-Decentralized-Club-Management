import React, { useState } from "react";
import { useData } from "../context/DataContext";
import { useWeb3 } from "../context/Web3Context";
import { Coins, Plus, CheckCircle2, AlertCircle, AlertTriangle, ShieldCheck, Banknote, Sparkles } from "lucide-react";
import { formatINR, formatTimestamp, truncateTxHash } from "../utils/cryptoUtils";

export function Treasury({ setShowRegisterModal }) {
  const { treasuryProposals, voteTreasuryProposal, createTreasuryProposal, finalizeTreasuryProposal, releaseDemoFunds } = useData();
  const { userRole, account, isVerified } = useWeb3();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [txNotice, setTxNotice] = useState(null);

  // New budget request form state
  const [title, setTitle] = useState("");
  const [amountINR, setAmountINR] = useState("");
  const [description, setDescription] = useState("");
  const [clubName, setClubName] = useState("Coding Club");

  const handleVote = (proposalId, support) => {
    setTxNotice(null);
    try {
      const tx = voteTreasuryProposal(proposalId, support);
      setTxNotice({
        type: "success",
        message: `Voted ${support ? "YES" : "NO"} on Budget Request #${proposalId}!`,
        hash: tx.hash
      });
    } catch (err) {
      setTxNotice({ type: "error", message: err.message });
    }
  };

  const handleFinalize = (proposalId) => {
    setTxNotice(null);
    try {
      const tx = finalizeTreasuryProposal(proposalId);
      setTxNotice({
        type: "success",
        message: `Budget Request #${proposalId} Finalized! (SpendingApproved event emitted)`,
        hash: tx.hash
      });
    } catch (err) {
      setTxNotice({ type: "error", message: err.message });
    }
  };

  const handleReleaseDemo = (proposalId) => {
    setTxNotice(null);
    try {
      const tx = releaseDemoFunds(proposalId);
      setTxNotice({
        type: "success",
        message: `Simulation Demo Disbursal executed for Request #${proposalId}!`,
        hash: tx.hash
      });
    } catch (err) {
      setTxNotice({ type: "error", message: err.message });
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    try {
      createTreasuryProposal({
        title,
        amountINR,
        description,
        clubName,
        clubId: "club-coding"
      });
      setShowCreateModal(false);
      setTitle("");
      setAmountINR("");
      setDescription("");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-dot badge-dot-cyan"></span>
            <h2 className="text-2xl font-bold text-white">Treasury Governance & Budget Approvals</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Section 14: On-chain spending approval proofs for transparent Indian college club finances.
          </p>
        </div>

        {(userRole === "Treasurer" || userRole === "Officer" || userRole === "Admin") && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary text-xs self-start sm:self-auto py-2.5"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Budget Request (₹)</span>
          </button>
        )}
      </div>

      {/* CRITICAL PRD MANDATORY DISCLAIMER BOX */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <h4 className="font-extrabold text-sm text-amber-300 tracking-wide uppercase font-mono">
              Academic & Financial Architecture Clarification
            </h4>
            <div className="text-slate-200 font-semibold">
              REAL INR FUNDS ≠ BLOCKCHAIN DEMO TREASURY
            </div>
            <p className="leading-relaxed text-slate-400">
              Campus DAO does <strong>NOT</strong> custody, hold, or transfer real Indian Rupees through smart contracts. 
              The actual funds remain in the college's official bank account / UPI / accounts office system. 
              The smart contract provides an immutable, transparent <strong>governance approval certificate</strong> (<code>SpendingApproved</code> event) 
              that the college accounts department uses to execute the payment in the real world.
            </p>
          </div>
        </div>
      </div>

      {/* Tx Notice */}
      {txNotice && (
        <div className={`p-4 rounded-xl text-xs flex items-start gap-3 ${
          txNotice.type === "success" 
            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-200" 
            : "bg-rose-500/10 border border-rose-500/30 text-rose-200"
        }`}>
          {txNotice.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-bold">{txNotice.message}</div>
            {txNotice.hash && <div className="text-[11px] font-mono mt-1 text-slate-300">Tx: {txNotice.hash}</div>}
          </div>
        </div>
      )}

      {/* Spending Proposals List */}
      <div className="space-y-6">
        {treasuryProposals.map((item) => {
          const totalVotes = item.yesVotes + item.noVotes;
          const yesPct = totalVotes > 0 ? Math.round((item.yesVotes / totalVotes) * 100) : 0;
          const noPct = totalVotes > 0 ? Math.round((item.noVotes / totalVotes) * 100) : 0;

          return (
            <div key={item.id} className="glass-panel p-6 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-400 font-mono">
                      TREASURY REQUEST #{item.id} • {item.clubName}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-0.5">{item.title}</h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-2xl font-extrabold text-emerald-300 font-mono">
                      {formatINR(item.amountINR)}
                    </div>
                    <div className="text-[11px] text-slate-400">Requested Budget</div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">{item.description}</p>

                {/* Off-Chain Real World Finance Status vs On-Chain Governance Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-400" />
                      <span>On-Chain Governance Status:</span>
                    </div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className={`badge-dot ${
                        item.status === "Approved" ? "badge-dot-green" :
                        item.status === "Rejected" ? "badge-dot-rose" :
                        item.status === "Executed" ? "badge-dot-cyan" : "badge-dot-amber"
                      }`} />
                      <span>{item.status}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                      <Banknote className="w-4 h-4 text-emerald-400" />
                      <span>Off-Chain College Bank Payment:</span>
                    </div>
                    <div className="font-mono text-emerald-300 text-[11px] truncate">
                      {item.realPaymentStatus}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Ref: {item.realPaymentRef}
                    </div>
                  </div>
                </div>

                {/* Voting Bar */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span className="text-emerald-400 font-semibold">Yes Votes: {item.yesVotes} ({yesPct}%)</span>
                    <span className="text-rose-400 font-semibold">No Votes: {item.noVotes} ({noPct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full flex overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${yesPct}%` }} />
                    <div className="bg-rose-500 h-full transition-all duration-300" style={{ width: `${noPct}%` }} />
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400">
                  Proposer: <span className="text-slate-200 font-semibold">{item.proposer}</span>
                </div>

                {item.status === "Active" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVote(item.id, true)}
                      className="btn btn-emerald py-1.5 px-3 text-xs"
                    >
                      Vote Yes
                    </button>
                    <button
                      onClick={() => handleVote(item.id, false)}
                      className="btn btn-danger py-1.5 px-3 text-xs"
                    >
                      Vote No
                    </button>
                    <button
                      onClick={() => handleFinalize(item.id)}
                      className="btn btn-secondary py-1.5 px-3 text-xs"
                    >
                      Finalize Vote
                    </button>
                  </div>
                )}

                {item.status === "Approved" && !item.demoFundsReleased && (
                  <button
                    onClick={() => handleReleaseDemo(item.id)}
                    className="btn btn-cyan py-1.5 px-4 text-xs font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Demo Testnet Token Release (Simulation)</span>
                  </button>
                )}

                {item.status === "Executed" && (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Governance Approved & Real College Payment Logged
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New Budget Request */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="glass-panel w-full max-w-lg p-6 border border-slate-700 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">Submit Club Spending Proposal</h3>
            <p className="text-xs text-slate-400 mb-4">Gated to Treasurer or Officer in TreasuryContract</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Proposal Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Refreshments & Trophies for Annual Tech Fest"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Requested Amount in INR (₹)</label>
                <input
                  type="number"
                  value={amountINR}
                  onChange={(e) => setAmountINR(e.target.value)}
                  placeholder="e.g. 15000"
                  className="input-field font-mono"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Justification & Vendor Plan</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain line items, vendor details, and why club funds are needed..."
                  rows={4}
                  className="input-field resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs"
                >
                  Deploy Spending Proposal on Chain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
