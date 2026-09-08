import React, { useState } from "react";
import { Database, ShieldCheck, Cpu, ArrowRight, Lock, Eye, Key, CheckCircle, Server } from "lucide-react";

export function ArchitectureDiagram() {
  const [activeView, setActiveView] = useState("data_division"); // 'data_division' | 'tx_flow' | 'sybil'

  return (
    <div className="glass-panel p-6 border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-dot badge-dot-cyan"></span>
            <h3 className="text-lg font-bold text-white">System Architecture & Technical Foundations</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Selective hybrid design: Zero real INR funds on-chain; trust-sensitive decisions cryptographically anchored.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveView("data_division")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeView === "data_division" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            On-Chain vs Off-Chain
          </button>
          <button
            onClick={() => setActiveView("tx_flow")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeView === "tx_flow" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Transaction Lifecycle
          </button>
          <button
            onClick={() => setActiveView("sybil")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeView === "sybil" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sybil Mitigation
          </button>
        </div>
      </div>

      {/* VIEW 1: Data Division */}
      {activeView === "data_division" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* Off-Chain Box */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-slate-800 text-[10px] font-mono text-slate-400 rounded-bl-lg">
              FAST & PRIVATE • FREE
            </div>
            <div className="flex items-center gap-2.5 mb-4 text-cyan-400">
              <Database className="w-5 h-5" />
              <h4 className="font-bold text-sm text-slate-100">Off-Chain Layer (Supabase / Postgres)</h4>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Normal application operational data where independent decentralization is unnecessary and gas storage would be wasteful:
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Student Profile Data:</strong> Names, roll numbers, institutional emails, academic programs.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Club & Event Media:</strong> Photos, club banners, descriptions, meeting links, RSVPs.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Detailed Attendance Rows:</strong> Timestamped entries for individual students (kept private).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Institutional College Roster:</strong> College-vetted roll number whitelist for OTP identity checks.</span>
              </li>
            </ul>
          </div>

          {/* On-Chain Box */}
          <div className="rounded-xl bg-indigo-950/20 border border-indigo-500/30 p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-600/30 text-[10px] font-mono text-indigo-300 rounded-bl-lg">
              IMMUTABLE & AUDITABLE
            </div>
            <div className="flex items-center gap-2.5 mb-4 text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
              <h4 className="font-bold text-sm text-slate-100">On-Chain Layer (Solidity Contracts / Testnet)</h4>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Trust-sensitive decision points where single-party database tampering must be computationally impossible:
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>Authorized Wallets:</strong> Whitelist of addresses mapped to pseudonymous <code>studentIdHash</code>.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>Election Votes & Tallies:</strong> Strict one-vote-per-student rule enforced by contract bytecode.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>Governance Decisions:</strong> Content hash commitments and immutable proposal state transitions.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>Treasury Approvals:</strong> Verifiable voting proofs for ₹ INR requests (No real fiat custody).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>Record Verification Hashes:</strong> <code>keccak256</code> proofs of attendance batches for tamper detection.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* VIEW 2: Transaction Lifecycle */}
      {activeView === "tx_flow" && (
        <div className="animate-fade-in space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs mx-auto mb-2">1</div>
              <div className="font-semibold text-xs text-slate-200">User Action</div>
              <p className="text-[11px] text-slate-400 mt-1">Student clicks Vote or Propose in React UI</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs mx-auto mb-2">2</div>
              <div className="font-semibold text-xs text-slate-200">Ethers.js Bridge</div>
              <p className="text-[11px] text-slate-400 mt-1">Builds calldata & requests MetaMask signature</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs mx-auto mb-2">3</div>
              <div className="font-semibold text-xs text-slate-200">MetaMask Signing</div>
              <p className="text-[11px] text-slate-400 mt-1">Private key signs tx locally (never exposed)</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs mx-auto mb-2">4</div>
              <div className="font-semibold text-xs text-slate-200">Smart Contract</div>
              <p className="text-[11px] text-slate-400 mt-1">Enforces authorization & checks-effects</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs mx-auto mb-2">5</div>
              <div className="font-semibold text-xs text-slate-200">Receipt & Audit</div>
              <p className="text-[11px] text-slate-400 mt-1">Tx hash emitted & verified on Block Explorer</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-3">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Zero Private Key Exposure Guarantee:</strong> Private keys are cryptographically guarded by MetaMask and never pass into browser memory, server logs, or Supabase.</span>
          </div>
        </div>
      )}

      {/* VIEW 3: Sybil Mitigation */}
      {activeView === "sybil" && (
        <div className="animate-fade-in p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">How Campus DAO Prevents "One Student, 10 Wallets" (Sybil Defense)</h4>
              <p className="text-xs text-slate-400 mt-1">
                Blockchain cannot prevent someone from generating 100 MetaMask addresses. Instead, our smart contract prevents unauthorized wallets from casting votes:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="font-bold text-indigo-400 mb-1">Step 1: Institutional Verification</div>
              <p className="text-slate-400">Student proves enrollment via college roll number + institutional email OTP against the official college dataset.</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="font-bold text-indigo-400 mb-1">Step 2: 1-to-1 On-Chain Linking</div>
              <p className="text-slate-400">Smart contract maps <code>studentToActiveWallet[studentIdHash] = wallet</code>. Attempting to link a second wallet for the same student reverts.</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="font-bold text-indigo-400 mb-1">Step 3: Keyed by Student ID Hash</div>
              <p className="text-slate-400"><code>hasVoted[electionId][studentIdHash]</code> is keyed to the student, not the wallet. Even if a wallet is replaced due to loss, double voting is blocked.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
