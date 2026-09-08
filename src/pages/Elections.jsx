import React, { useState } from "react";
import { useData } from "../context/DataContext";
import { useWeb3 } from "../context/Web3Context";
import { Vote, Plus, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Trophy, Sparkles, Trash2, UserCheck, Users } from "lucide-react";
import { formatTimestamp } from "../utils/cryptoUtils";

export function Elections({ setShowRegisterModal }) {
  const { elections, castVote, createElection, roster } = useData();
  const { isVerified, userRole, account, rollNo } = useWeb3();

  const [selectedElectionId, setSelectedElectionId] = useState(() => elections[0]?.id || 1);
  const selectedElection = elections.find(e => e.id === selectedElectionId) || elections[0];
  const [votingCandidateId, setVotingCandidateId] = useState(null);
  const [txStatus, setTxStatus] = useState(null); // { type: 'success' | 'error', message, hash }
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New election form state
  const [newTitle, setNewTitle] = useState("");
  const [newClubName, setNewClubName] = useState("Coding Club");
  const [newDescription, setNewDescription] = useState("");
  const [candidateSlots, setCandidateSlots] = useState([
    { rollNo: "", manifesto: "" },
    { rollNo: "", manifesto: "" }
  ]);

  const handleVote = (electionId, candidateId) => {
    setTxStatus(null);
    setVotingCandidateId(candidateId);

    try {
      const tx = castVote(electionId, candidateId);
      setTxStatus({
        type: "success",
        message: `Vote successfully cast and confirmed on-chain!`,
        hash: tx.hash
      });
    } catch (err) {
      setTxStatus({
        type: "error",
        message: err.message || "Failed to submit vote to smart contract."
      });
    } finally {
      setVotingCandidateId(null);
    }
  };

  const handleCreateElection = (e) => {
    e.preventDefault();
    const valid = candidateSlots.filter(c => c.rollNo.trim().length > 0);
    if (valid.length < 2) {
      alert("Please select at least 2 candidates from the available students roster.");
      return;
    }

    const rolls = valid.map(c => c.rollNo);
    if (new Set(rolls).size !== rolls.length) {
      alert("A student cannot be added more than once as a candidate.");
      return;
    }

    const candidateObjects = valid.map(c => {
      const student = roster.find(r => r.rollNo === c.rollNo);
      return {
        rollNo: c.rollNo,
        name: student ? student.name : c.rollNo,
        program: student ? student.program : "",
        manifesto: c.manifesto.trim() || `Dedicated to advancing the goals of ${newClubName}`,
        avatar: student ? (student.name.includes("Aditi") || student.name.includes("Priya") || student.name.includes("Sneha") ? "👩‍🎓" : "👨‍💻") : "👤"
      };
    });

    try {
      const { tx, election } = createElection({
        title: newTitle,
        clubName: newClubName,
        clubId: "club-coding",
        description: newDescription,
        candidates: candidateObjects,
        durationDays: 5
      });
      setShowCreateModal(false);
      setSelectedElectionId(election.id);
      setNewTitle("");
      setNewDescription("");
      setCandidateSlots([
        { rollNo: "", manifesto: "" },
        { rollNo: "", manifesto: "" }
      ]);
      setTxStatus({
        type: "success",
        message: `New Election #${election.id} created and stored permanently on-chain!`,
        hash: tx.hash
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const totalVotesInSelected = selectedElection 
    ? selectedElection.candidates.reduce((sum, c) => sum + c.votes, 0)
    : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-dot badge-dot-cyan"></span>
            <h2 className="text-2xl font-bold text-white">Club Elections & Transparent Voting</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Section 12: Smart-contract enforced one-vote rule; results computed deterministically on-chain.
          </p>
        </div>

        {(userRole === "Officer" || userRole === "Admin") && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary text-xs self-start sm:self-auto py-2.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Election</span>
          </button>
        )}
      </div>

      {/* Status Notice for Non-Verified Students */}
      {!isVerified && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Your connected wallet (<strong>{account.slice(0, 8)}...</strong>) is not yet verified against the college roster. Voting will be blocked by the smart contract.
            </span>
          </div>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="btn btn-secondary text-xs py-1.5 px-3 self-start sm:self-auto border-amber-500/40 text-amber-300"
          >
            Verify Roster ID
          </button>
        </div>
      )}

      {/* Tx Status Alert */}
      {txStatus && (
        <div className={`p-4 rounded-xl text-xs flex items-start gap-3 ${
          txStatus.type === "success" 
            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-200" 
            : "bg-rose-500/10 border border-rose-500/30 text-rose-200"
        }`}>
          {txStatus.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="font-bold">{txStatus.message}</div>
            {txStatus.hash && (
              <div className="text-[11px] font-mono mt-1 text-slate-300">
                Tx Hash: <span>{txStatus.hash}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Grid: Election Selector & Active Ballot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Election List */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Available Elections</h3>
          <div className="space-y-3">
            {elections.map((election) => {
              const isSelected = selectedElection?.id === election.id;
              const voteCount = election.candidates.reduce((sum, c) => sum + c.votes, 0);

              return (
                <div
                  key={election.id}
                  onClick={() => {
                    setSelectedElection(election);
                    setTxStatus(null);
                  }}
                  className={`p-5 rounded-xl cursor-pointer transition-all ${
                    isSelected 
                      ? "glass-panel border-indigo-500/50 bg-indigo-950/20 glow-indigo" 
                      : "glass-panel hover:border-slate-700 bg-slate-900/50"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="font-semibold text-indigo-400">{election.clubName}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                      {election.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white mb-2">{election.title}</h4>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTimestamp(election.endTime)}
                    </span>
                    <span className="font-bold text-slate-200">{voteCount} Votes</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Ballot & Live Results */}
        {selectedElection && (
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 border border-slate-800">
              <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                    {selectedElection.clubName} • Election #{selectedElection.id}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">{selectedElection.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {selectedElection.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-extrabold text-white font-mono">{totalVotesInSelected}</div>
                  <div className="text-[11px] text-slate-400">Total Valid Ballots</div>
                </div>
              </div>

              {/* Candidate Cards */}
              <div className="space-y-4 mt-6">
                {selectedElection.candidates.map((candidate) => {
                  const percentage = totalVotesInSelected > 0 
                    ? Math.round((candidate.votes / totalVotesInSelected) * 100) 
                    : 0;

                  return (
                    <div
                      key={candidate.id}
                      className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl shrink-0 border border-slate-700">
                          {candidate.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white">{candidate.name}</h4>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              Candidate #{candidate.id}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            "{candidate.manifesto}"
                          </p>

                          {/* Progress bar */}
                          <div className="w-full sm:w-64 mt-3">
                            <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                              <span>{candidate.votes} votes</span>
                              <span>{percentage}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Vote Cast Button */}
                      <button
                        onClick={() => handleVote(selectedElection.id, candidate.id)}
                        disabled={votingCandidateId === candidate.id}
                        className="btn btn-primary sm:self-center py-2 px-5 text-xs font-semibold whitespace-nowrap shadow-md"
                      >
                        <Vote className="w-3.5 h-3.5" />
                        <span>{votingCandidateId === candidate.id ? "Signing Tx..." : "Vote"}</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* On-Chain Invariant Box */}
              <div className="mt-6 p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-slate-300 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>
                  <strong>On-Chain Invariant:</strong> VotingContract checks <code>hasVoted[electionId][studentIdHash]</code>. Any attempt to vote again from this or any other wallet will trigger a Solidity <code>revert("AlreadyVoted")</code>.
                </span>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Modal: Create Election */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="glass-panel w-full max-w-lg p-6 border border-slate-700 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">Create New Club Election</h3>
            <p className="text-xs text-slate-400 mb-4">Gated by Officer/Admin role in MembershipContract</p>

            <form onSubmit={handleCreateElection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Election Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Robotics Club Secretary Election 2026"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Club Organization</label>
                <select
                  value={newClubName}
                  onChange={(e) => setNewClubName(e.target.value)}
                  className="input-field"
                >
                  <option value="Coding Club">Coding Club</option>
                  <option value="Robotics & IoT Society">Robotics & IoT Society</option>
                  <option value="Campus Cultural Forum">Campus Cultural Forum</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe the executive role and election rules..."
                  rows={3}
                  className="input-field resize-none"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Election Candidates (Choose from College Roster)
                  </label>
                  <span className="text-[11px] text-cyan-400 font-mono">
                    {candidateSlots.filter(s => s.rollNo).length}/{candidateSlots.length} Selected
                  </span>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {candidateSlots.map((slot, idx) => {
                    const selectedStudent = roster.find(r => r.rollNo === slot.rollNo);
                    return (
                      <div key={idx} className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-indigo-400" />
                            Candidate #{idx + 1}
                          </span>
                          {candidateSlots.length > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = candidateSlots.filter((_, i) => i !== idx);
                                setCandidateSlots(updated);
                              }}
                              className="text-slate-500 hover:text-rose-400 text-xs p-1"
                              title="Remove candidate slot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Dropdown for available students */}
                        <select
                          value={slot.rollNo}
                          onChange={(e) => {
                            const updated = [...candidateSlots];
                            updated[idx] = { ...updated[idx], rollNo: e.target.value };
                            setCandidateSlots(updated);
                          }}
                          className="input-field text-xs py-2"
                          required
                        >
                          <option value="">-- Select Student from Roster --</option>
                          {roster.map(student => (
                            <option key={student.rollNo} value={student.rollNo}>
                              {student.name} ({student.rollNo} • {student.program})
                            </option>
                          ))}
                        </select>

                        {/* Selected Student Preview */}
                        {selectedStudent && (
                          <div className="flex items-center justify-between text-[11px] px-2 py-1.5 rounded bg-slate-950/60 border border-slate-800/80">
                            <span className="text-slate-300">Department: <strong className="text-white">{selectedStudent.program} (Yr {selectedStudent.year})</strong></span>
                            <span className="text-cyan-400 font-mono">{selectedStudent.email}</span>
                          </div>
                        )}

                        {/* Candidate Manifesto */}
                        <input
                          type="text"
                          value={slot.manifesto}
                          onChange={(e) => {
                            const updated = [...candidateSlots];
                            updated[idx] = { ...updated[idx], manifesto: e.target.value };
                            setCandidateSlots(updated);
                          }}
                          placeholder={`Candidate #${idx + 1} Campaign Manifesto / Platform vision`}
                          className="input-field text-xs py-1.5"
                        />
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setCandidateSlots([...candidateSlots, { rollNo: "", manifesto: "" }])}
                  className="mt-2 flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Another Candidate Slot</span>
                </button>
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
                  Deploy Election on Testnet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
