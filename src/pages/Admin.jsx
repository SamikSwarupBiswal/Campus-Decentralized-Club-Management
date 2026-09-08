import React, { useState } from "react";
import { useData } from "../context/DataContext";
import { useWeb3 } from "../context/Web3Context";
import { GraduationCap, ShieldAlert, Key, UserCheck, UserX, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { truncateAddress } from "../utils/cryptoUtils";

export function Admin() {
  const { roster, authorizeWallet, revokeWallet, replaceWallet } = useData();
  const { userRole, account } = useWeb3();

  const [adminNotice, setAdminNotice] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [targetWallet, setTargetWallet] = useState("");
  const [targetRole, setTargetRole] = useState("Member");

  // Wallet replacement state
  const [replaceOldWallet, setReplaceOldWallet] = useState("");
  const [replaceNewWallet, setReplaceNewWallet] = useState("");
  const [replaceRollNo, setReplaceRollNo] = useState("");
  const [showReplaceModal, setShowReplaceModal] = useState(false);

  const handleAuthorize = (rollNo) => {
    setAdminNotice(null);
    if (!targetWallet || !targetWallet.startsWith("0x") || targetWallet.length !== 42) {
      alert("Please enter a valid 42-character Ethereum address (0x...)");
      return;
    }

    try {
      const tx = authorizeWallet(targetWallet, rollNo, targetRole);
      setAdminNotice({
        type: "success",
        message: `Authorized wallet for student ${rollNo} as ${targetRole}! (Tx: ${tx.hash.slice(0, 10)}...)`
      });
      setSelectedStudent(null);
      setTargetWallet("");
    } catch (err) {
      setAdminNotice({ type: "error", message: err.message });
    }
  };

  const handleRevoke = (walletAddress) => {
    setAdminNotice(null);
    if (!window.confirm("Are you sure you want to revoke this student wallet? They will lose all voting privileges.")) return;

    try {
      const tx = revokeWallet(walletAddress);
      setAdminNotice({
        type: "success",
        message: `Revoked authorization for wallet ${truncateAddress(walletAddress)}! (Tx: ${tx.hash.slice(0, 10)}...)`
      });
    } catch (err) {
      setAdminNotice({ type: "error", message: err.message });
    }
  };

  const handleExecuteReplace = (e) => {
    e.preventDefault();
    setAdminNotice(null);
    try {
      const tx = replaceWallet(replaceRollNo, replaceOldWallet, replaceNewWallet);
      setAdminNotice({
        type: "success",
        message: `Replaced wallet for ${replaceRollNo} on-chain! Voting history preserved.`
      });
      setShowReplaceModal(false);
      setReplaceRollNo("");
      setReplaceOldWallet("");
      setReplaceNewWallet("");
    } catch (err) {
      setAdminNotice({ type: "error", message: err.message });
    }
  };

  const isAdmin = userRole === "Admin";

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-dot badge-dot-cyan"></span>
            <h2 className="text-2xl font-bold text-white">Admin Management & Access Control</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Section 21: Gatekeeping roster, wallet authorization, role provisioning, and key replacement.
          </p>
        </div>

        <button
          onClick={() => setShowReplaceModal(true)}
          className="btn btn-secondary text-xs self-start sm:self-auto py-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Wallet Replacement Flow (§11)</span>
        </button>
      </div>

      {/* Admin Scope Notice */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Architectural Scoping of Admin Powers (PRD §21): </span>
          The Admin role is powerful for <em>provisioning</em> (who can participate), but by design 
          <strong> has NO function in Solidity to alter a recorded vote, override proposal outcomes, or take custody of real funds</strong>. 
          Smart-contract rules are deterministic and immutable.
        </div>
      </div>

      {/* Notice */}
      {adminNotice && (
        <div className={`p-4 rounded-xl text-xs flex items-start gap-3 ${
          adminNotice.type === "success" 
            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-200" 
            : "bg-rose-500/10 border border-rose-500/30 text-rose-200"
        }`}>
          {adminNotice.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="font-bold">{adminNotice.message}</div>
        </div>
      )}

      {/* Roster Table */}
      <div className="glass-panel p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">College Institutional Student Roster</h3>
          <span className="text-xs text-slate-400 font-mono">{roster.length} Enrolled Students</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Roll Number</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Institutional Email</th>
                <th className="p-3.5">Linked Wallet Address</th>
                <th className="p-3.5">Assigned Role</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {roster.map((student) => (
                <tr key={student.rollNo} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3.5 font-mono text-slate-200 font-semibold">{student.rollNo}</td>
                  <td className="p-3.5 text-white">{student.name}</td>
                  <td className="p-3.5 text-slate-400">{student.email}</td>
                  <td className="p-3.5 font-mono text-[11px]">
                    {student.wallet ? (
                      <span className={student.isAuthorized ? "text-emerald-400" : "text-rose-400 line-through"}>
                        {truncateAddress(student.wallet)}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">No wallet linked</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      student.role === "Admin" ? "bg-amber-500/20 text-amber-300" :
                      student.role === "Officer" ? "bg-cyan-500/20 text-cyan-300" :
                      student.role === "Treasurer" ? "bg-emerald-500/20 text-emerald-300" :
                      student.role === "Member" ? "bg-indigo-500/20 text-indigo-300" : "bg-slate-800 text-slate-400"
                    }`}>
                      {student.role}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    {student.wallet && student.isAuthorized ? (
                      <button
                        onClick={() => handleRevoke(student.wallet)}
                        className="btn btn-danger py-1 px-2.5 text-[11px]"
                      >
                        Revoke
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setTargetWallet(account); // Pre-fill with active persona address for convenience
                        }}
                        className="btn btn-primary py-1 px-2.5 text-[11px]"
                      >
                        Authorize
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Authorize Wallet */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="glass-panel w-full max-w-md p-6 border border-slate-700 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">Authorize Student Wallet</h3>
            <p className="text-xs text-slate-400 mb-4">
              Link Ethereum address to <strong>{selectedStudent.name}</strong> ({selectedStudent.rollNo})
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Wallet Address</label>
                <input
                  type="text"
                  value={targetWallet}
                  onChange={(e) => setTargetWallet(e.target.value)}
                  placeholder="0x..."
                  className="input-field font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assign Smart Contract Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="input-field"
                >
                  <option value="Member">Member (Voting only)</option>
                  <option value="Officer">Officer (Create Elections & Proposals)</option>
                  <option value="Treasurer">Treasurer (Create Budget Requests)</option>
                  <option value="Admin">Admin (Full Gatekeeping)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="btn btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAuthorize(selectedStudent.rollNo)}
                  className="btn btn-primary text-xs"
                >
                  Commit Authorization On-Chain
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Replace Wallet Flow (§11) */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="glass-panel w-full max-w-md p-6 border border-slate-700 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">Wallet Replacement (Lost/Compromised)</h3>
            <p className="text-xs text-slate-400 mb-4">
              Revokes old wallet and authorizes new one. Crucially, past votes in in-progress elections stay recorded under studentIdHash.
            </p>

            <form onSubmit={handleExecuteReplace} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Student Roll Number</label>
                <input
                  type="text"
                  value={replaceRollNo}
                  onChange={(e) => setReplaceRollNo(e.target.value)}
                  placeholder="e.g. 2023BCSE042"
                  className="input-field font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Old Compromised Wallet</label>
                <input
                  type="text"
                  value={replaceOldWallet}
                  onChange={(e) => setReplaceOldWallet(e.target.value)}
                  placeholder="0x..."
                  className="input-field font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Clean Wallet</label>
                <input
                  type="text"
                  value={replaceNewWallet}
                  onChange={(e) => setReplaceNewWallet(e.target.value)}
                  placeholder="0x..."
                  className="input-field font-mono text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowReplaceModal(false)}
                  className="btn btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs"
                >
                  Execute Replacement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
