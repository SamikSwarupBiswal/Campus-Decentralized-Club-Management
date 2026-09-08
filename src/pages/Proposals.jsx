import React, { useState } from "react";
import { useData } from "../context/DataContext";
import { useWeb3 } from "../context/Web3Context";
import { ShieldCheck, Plus, CheckCircle2, XCircle, Clock, AlertTriangle, Hash, Check } from "lucide-react";
import { formatTimestamp, truncateTxHash } from "../utils/cryptoUtils";

export function Proposals({ setShowRegisterModal }) {
  const { proposals, voteProposal, createProposal, finalizeProposal } = useData();
  const { isVerified, userRole, account } = useWeb3();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [txNotice, setTxNotice] = useState(null);

  // New proposal form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clubName, setClubName] = useState("Coding Club");
  const [category, setCategory] = useState("Events");

  const handleVote = (proposalId, support) => {
    setTxNotice(null);
    try {
      const tx = voteProposal(proposalId, support);
      setTxNotice({
        type: "success",
        message: `Successfully voted ${support ? "YES" : "NO"} on Proposal #${proposalId}!`,
        hash: tx.hash
      });
    } catch (err) {
      setTxNotice({
        type: "error",
        message: err.message
      });
    }
  };

  const handleFinalize = (proposalId) => {
    setTxNotice(null);
    try {
      const tx = finalizeProposal(proposalId);
      setTxNotice({
        type: "success",
        message: `Proposal #${proposalId} finalized on-chain!`,
        hash: tx.hash
      });
    } catch (err) {
      setTxNotice({
        type: "error",
        message: err.message
      });
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    try {
      createProposal({
        title,
        description,
        clubName,
        clubId: "club-coding",
        category,
        durationDays: 3
      });
      setShowCreateModal(false);
      setTitle("");
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
            <h2 className="text-2xl font-bold text-white">DAO Governance & Club Proposals</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Section 13: Propose club initiatives with on-chain content hash binding and member approval thresholds.
          </p>
        </div>

        {(userRole === "Officer" || userRole === "Admin") && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary text-xs self-start sm:self-auto py-2.5"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Governance Proposal</span>
          </button>
        )}
      </div>

      {/* Tx Status Notice */}
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

      {/* Proposals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {proposals.map((p) => {
          const totalVotes = p.yesVotes + p.noVotes;
          const yesPct = totalVotes > 0 ? Math.round((p.yesVotes / totalVotes) * 100) : 0;
          const noPct = totalVotes > 0 ? Math.round((p.noVotes / totalVotes) * 100) : 0;

          return (
            <div key={p.id} className="glass-panel p-6 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold text-indigo-400 font-mono">
                    PROPOSAL #{p.id} • {p.category}
                  </span>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
                    p.status === "Passed" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" :
                    p.status === "Rejected" ? "bg-rose-500/20 text-rose-300 border-rose-500/30" :
                    p.status === "Executed" ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" :
                    "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                  }`}>
                    {p.status}
                  </span>
                </div>

                <h3 className="font-bold text-base text-white mb-2">{p.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{p.description}</p>

                {/* Hash binding indicator */}
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 mb-4 text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Hash className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-semibold">On-Chain Content Hash Anchor:</span>
                  </div>
                  <div className="font-mono text-slate-300 truncate">
                    {p.contentHash}
                  </div>
                </div>

                {/* Voting Progress */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span className="text-emerald-400 font-semibold">Yes: {p.yesVotes} ({yesPct}%)</span>
                    <span className="text-rose-400 font-semibold">No: {p.noVotes} ({noPct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full flex overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${yesPct}%` }} />
                    <div className="bg-rose-500 h-full transition-all duration-300" style={{ width: `${noPct}%` }} />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Ends: {formatTimestamp(p.endTime)}</span>
                </div>

                {p.status === "Active" ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVote(p.id, true)}
                      className="btn btn-emerald py-1.5 px-3 text-xs"
                    >
                      Vote Yes
                    </button>
                    <button
                      onClick={() => handleVote(p.id, false)}
                      className="btn btn-danger py-1.5 px-3 text-xs"
                    >
                      Vote No
                    </button>
                    <button
                      onClick={() => handleFinalize(p.id)}
                      className="btn btn-secondary py-1.5 px-2.5 text-xs text-slate-300"
                      title="Finalize proposal state on-chain"
                    >
                      Finalize
                    </button>
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-slate-400">
                    Governance Voting Closed
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New Proposal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="glass-panel w-full max-w-lg p-6 border border-slate-700 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">Submit Governance Proposal</h3>
            <p className="text-xs text-slate-400 mb-4">Creates proposal and anchors keccak256 hash in GovernanceContract</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Proposal Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Conduct College Workshop on Cyber Forensics"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="Events">Events & Hackathons</option>
                  <option value="Equipment">Lab Equipment & Hardware</option>
                  <option value="Policy">Club Governance & Bylaws</option>
                  <option value="Partnership">Industry Partnerships</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide complete rationale, schedule, and expected outcomes..."
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
                  Submit Proposal to DAO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
