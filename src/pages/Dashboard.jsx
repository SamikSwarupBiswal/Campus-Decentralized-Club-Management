import React from "react";
import { useData } from "../context/DataContext";
import { useWeb3 } from "../context/Web3Context";
import { ArchitectureDiagram } from "../components/ArchitectureDiagram";
import { 
  Vote, 
  ShieldCheck, 
  Coins, 
  FileCheck2, 
  Users, 
  ArrowRight, 
  Sparkles, 
  GraduationCap, 
  Layers, 
  ExternalLink 
} from "lucide-react";
import { formatINR } from "../utils/cryptoUtils";

export function Dashboard({ setActiveTab, setShowRegisterModal }) {
  const { clubs, elections, proposals, treasuryProposals, attendanceBatches, roster } = useData();
  const { isVerified, userRole, currentPersona } = useWeb3();

  const activeElections = elections.filter(e => e.status === "Active");
  const activeProposals = proposals.filter(p => p.status === "Active");
  const totalApprovedINR = treasuryProposals
    .filter(t => t.status === "Approved" || t.status === "Executed")
    .reduce((acc, curr) => acc + curr.amountINR, 0);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8 sm:p-10 border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Next-Gen College Club Governance</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Decentralized Governance for <br className="hidden sm:inline" />
            <span className="gradient-text-indigo">Transparent College Clubs</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Campus DAO replaces unverified WhatsApp polls and single-administrator spreadsheets with 
            smart-contract-enforced elections, transparent ₹ INR treasury approvals, and tamper-evident record verification.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {!isVerified && (
              <button
                onClick={() => setShowRegisterModal(true)}
                className="btn btn-primary py-3 px-6 text-sm shadow-lg shadow-indigo-500/25"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Verify Student ID & Link Wallet</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("elections")}
              className="btn btn-cyan py-3 px-6 text-sm"
            >
              <Vote className="w-4 h-4" />
              <span>Participate in Elections</span>
            </button>

            <button
              onClick={() => setActiveTab("viva")}
              className="btn btn-secondary py-3 px-6 text-sm"
            >
              <span>Viva & Professor Q&A Portal →</span>
            </button>
          </div>
        </div>

        {/* Decorative corner glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Key Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Elections */}
        <div 
          onClick={() => setActiveTab("elections")}
          className="glass-panel glass-panel-interactive p-5 cursor-pointer border border-slate-800/80"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Elections</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <Vote className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{activeElections.length}</div>
          <div className="text-xs text-indigo-400 flex items-center gap-1 mt-2">
            <span>One-vote-per-student on-chain</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Metric 2: Proposals */}
        <div 
          onClick={() => setActiveTab("proposals")}
          className="glass-panel glass-panel-interactive p-5 cursor-pointer border border-slate-800/80"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Open Proposals</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{activeProposals.length}</div>
          <div className="text-xs text-cyan-400 flex items-center gap-1 mt-2">
            <span>Enforced quorum & threshold</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Metric 3: Treasury Approved */}
        <div 
          onClick={() => setActiveTab("treasury")}
          className="glass-panel glass-panel-interactive p-5 cursor-pointer border border-slate-800/80"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Approved Budget</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300">{formatINR(totalApprovedINR)}</div>
          <div className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
            <span>Governance proof recorded</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Metric 4: Verified Records */}
        <div 
          onClick={() => setActiveTab("records")}
          className="glass-panel glass-panel-interactive p-5 cursor-pointer border border-slate-800/80"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Anchored Records</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{attendanceBatches.length}</div>
          <div className="text-xs text-amber-400 flex items-center gap-1 mt-2">
            <span>keccak256 tamper-evident</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

      </div>

      {/* Architecture Visualizer (§9) */}
      <ArchitectureDiagram />

      {/* Clubs & Societies Showcase */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-white">Registered College Clubs</h3>
            <p className="text-xs text-slate-400 mt-0.5">Off-chain rich profiles managed in Supabase with on-chain governance links</p>
          </div>
          <span className="text-xs text-indigo-400 font-semibold">{clubs.length} Clubs Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {clubs.map(club => (
            <div 
              key={club.id}
              className="glass-panel overflow-hidden border border-slate-800/80 flex flex-col group hover:border-slate-700"
            >
              <div className="h-36 relative overflow-hidden">
                <img 
                  src={club.banner} 
                  alt={club.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <span className="absolute top-3 right-3 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-200">
                  {club.category}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors">
                    {club.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {club.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Lead: <strong className="text-slate-200">{club.lead}</strong></span>
                  <span className="font-mono">{club.memberCount} members</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
