import React, { useState } from "react";
import { useData } from "../context/DataContext";
import { FileCheck2, ShieldCheck, AlertTriangle, CheckCircle2, RotateCcw, Bug, Eye, Hash } from "lucide-react";
import { formatTimestamp, truncateAddress } from "../utils/cryptoUtils";

export function AttendanceRecords() {
  const { attendanceBatches, verifyAttendanceTamper, simulateDatabaseTampering, resetTamperedDatabase } = useData();

  const [selectedBatchId, setSelectedBatchId] = useState(attendanceBatches[0]?.recordSetId);
  const [verificationResult, setVerificationResult] = useState(null);

  const currentBatch = attendanceBatches.find(b => b.recordSetId === selectedBatchId) || attendanceBatches[0];

  const handleVerify = () => {
    if (!currentBatch) return;
    const result = verifyAttendanceTamper(currentBatch.recordSetId);
    setVerificationResult(result);
  };

  const handleTamper = () => {
    if (!currentBatch) return;
    simulateDatabaseTampering(currentBatch.recordSetId);
    setVerificationResult(null); // Clear previous result to prompt fresh verify
  };

  const handleReset = () => {
    if (!currentBatch) return;
    resetTamperedDatabase(currentBatch.recordSetId);
    setVerificationResult(null);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-dot badge-dot-cyan"></span>
            <h2 className="text-2xl font-bold text-white">Attendance & Record Tamper Verification</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Section 15: On-chain cryptographic hash anchors with interactive tamper-detection sandbox.
          </p>
        </div>
      </div>

      {/* Honest Limitation Statement */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Academic Integrity Note (PRD §15): </span>
          Blockchain does <strong>not</strong> prove that the original attendance entered was truthful in the real world. 
          It mathematically proves whether an accepted record set has been <em>silently modified or forged</em> since its cryptographic hash was committed on-chain.
        </div>
      </div>

      {/* Main Container */}
      <div className="glass-panel p-6 border border-slate-800 space-y-6">
        
        {/* Batch Metadata Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-400 font-mono">
                RECORD SET #{currentBatch.recordSetId.slice(0, 10)}...
              </span>
              {currentBatch.isTamperedLocally && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold animate-pulse">
                  ⚠ Database Altered
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white mt-1">{currentBatch.eventName}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Issued By: {currentBatch.issuer} • Event Date: {currentBatch.eventDate}
            </p>
          </div>

          {/* Interactive Sandbox Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleVerify}
              className="btn btn-primary py-2 px-4 text-xs font-semibold"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Verify Integrity Against Blockchain</span>
            </button>

            {!currentBatch.isTamperedLocally ? (
              <button
                onClick={handleTamper}
                className="btn btn-danger py-2 px-3 text-xs"
                title="Simulate someone secretly editing a student record in the database"
              >
                <Bug className="w-3.5 h-3.5" />
                <span>Simulate DB Tampering</span>
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="btn btn-secondary py-2 px-3 text-xs text-emerald-300 border-emerald-500/30"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Original Data</span>
              </button>
            )}
          </div>
        </div>

        {/* Verification Result Banner */}
        {verificationResult && (
          <div className={`p-5 rounded-2xl border transition-all animate-fade-in ${
            verificationResult.isMatch 
              ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-200" 
              : "bg-rose-950/30 border-rose-500/50 text-rose-200"
          }`}>
            <div className="flex items-start gap-3">
              {verificationResult.isMatch ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 animate-bounce" />
              )}
              <div className="space-y-2 flex-1">
                <div className="font-extrabold text-sm">
                  {verificationResult.isMatch 
                    ? "✓ Record Verified Authentic: Zero Unauthorized Modifications Detected" 
                    : "⚠ Tampering Detected! Current Database Does Not Match On-Chain Proof"}
                </div>
                <p className="text-xs leading-relaxed text-slate-300">
                  {verificationResult.isMatch
                    ? "The canonical keccak256 hash of the current database rows strictly matches the on-chain anchor recorded in VerificationContract. All records are intact."
                    : "The cryptographic hash of the current rows differs from the immutable proof committed on-chain. Someone has altered rows or timestamps!"}
                </p>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono space-y-1.5 text-slate-300 mt-2">
                  <div className="flex flex-col sm:flex-row justify-between gap-1">
                    <span className="text-slate-400">On-Chain Anchor Hash:</span>
                    <span className="text-indigo-300 truncate">{verificationResult.onChainHash}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between gap-1">
                    <span className="text-slate-400">Current Recalculated Hash:</span>
                    <span className={`truncate ${verificationResult.isMatch ? "text-emerald-300" : "text-rose-400 font-bold"}`}>
                      {verificationResult.currentHash}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Attendance Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Roll Number</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Recorded Status</th>
                <th className="p-3.5">Log Timestamp</th>
                <th className="p-3.5 text-right">Integrity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {currentBatch.records.map((row, idx) => {
                const isForgedRow = row.timestamp.includes("FORGED");
                return (
                  <tr key={idx} className={`hover:bg-slate-900/40 transition-colors ${isForgedRow ? "bg-rose-500/10" : ""}`}>
                    <td className="p-3.5 font-mono text-slate-300">{row.rollNo}</td>
                    <td className="p-3.5 text-white font-semibold">{row.name}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        row.status === "Present" ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-400"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">{row.timestamp}</td>
                    <td className="p-3.5 text-right">
                      {isForgedRow ? (
                        <span className="text-[10px] font-bold text-rose-400 uppercase font-mono">
                          Modified in DB
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">
                          Original
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
