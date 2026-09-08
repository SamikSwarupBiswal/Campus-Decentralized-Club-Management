import React, { useState } from "react";
import { useWeb3, DEMO_PERSONAS } from "../context/Web3Context";
import { truncateAddress } from "../utils/cryptoUtils";
import { 
  ShieldCheck, 
  Vote, 
  Coins, 
  FileCheck2, 
  Users, 
  GraduationCap, 
  HelpCircle, 
  Wallet, 
  Droplet, 
  ChevronDown, 
  History, 
  CheckCircle2, 
  AlertTriangle,
  KeyRound,
  LogIn
} from "lucide-react";

export function Navbar({ activeTab, setActiveTab, setShowTxHistory, setShowRegisterModal }) {
  const { 
    account, 
    userRole, 
    isVerified, 
    currentPersonaKey, 
    switchPersona, 
    faucetBalance, 
    claimFaucet, 
    networkName,
    isMetaMaskAvailable,
    connectMetaMask,
    mode,
    session
  } = useWeb3();

  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Overview", icon: Users },
    { id: "login", label: "Role Login", icon: KeyRound },
    { id: "elections", label: "Elections", icon: Vote },
    { id: "proposals", label: "Governance", icon: ShieldCheck },
    { id: "treasury", label: "Treasury (₹)", icon: Coins },
    { id: "records", label: "Tamper Proofs", icon: FileCheck2 },
    { id: "admin", label: "Admin Panel", icon: GraduationCap },
    { id: "viva", label: "Viva & Demo Guide", icon: HelpCircle }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div 
            onClick={() => setActiveTab("dashboard")} 
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight gradient-text-indigo">Campus DAO</span>
                <span className="glass-pill text-[10px] uppercase font-mono tracking-widest text-cyan-400 border-cyan-500/30">
                  Hybrid dApp
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Decentralized College Club Management</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive 
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            
            {/* Faucet Claim Button */}
            <button
              onClick={claimFaucet}
              title="Claim free testnet ETH for gas simulation"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/40 text-xs font-medium transition-all hover:scale-[1.02]"
            >
              <Droplet className="w-3.5 h-3.5 text-cyan-400" />
              <span>{faucetBalance} ETH</span>
              <span className="text-[10px] px-1 bg-cyan-500/20 text-cyan-300 rounded font-mono">+Faucet</span>
            </button>

            {/* Persona Switcher Dropdown (For Professor Viva Demo) */}
            <div className="relative">
              <button
                onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 hover:border-slate-600 text-xs font-medium text-slate-200 transition-all"
              >
                <span className="text-sm">{DEMO_PERSONAS[currentPersonaKey]?.avatar}</span>
                <div className="text-left hidden sm:block leading-tight">
                  <div className="font-semibold text-slate-200 text-[11px] truncate max-w-[110px]">
                    {DEMO_PERSONAS[currentPersonaKey]?.name.split(" ")[0]}
                  </div>
                  <div className="text-[10px] text-indigo-400 font-mono">
                    {userRole}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showPersonaMenu && (
                <div 
                  className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900/95 border border-slate-800 shadow-2xl p-2 z-50 animate-fade-in backdrop-blur-2xl"
                  onClick={() => setShowPersonaMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Evaluator Persona
                  </div>
                  <div className="py-1 space-y-1">
                    {Object.entries(DEMO_PERSONAS).map(([key, p]) => (
                      <button
                        key={key}
                        onClick={() => switchPersona(key)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                          currentPersonaKey === key 
                            ? "bg-indigo-600/20 border border-indigo-500/30 text-indigo-200" 
                            : "hover:bg-slate-800 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{p.avatar}</span>
                          <div>
                            <div className="text-xs font-semibold leading-tight">{p.name}</div>
                            <div className="text-[10px] text-slate-400">{p.rollNo} • {p.email}</div>
                          </div>
                        </div>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          p.role === "Admin" ? "bg-amber-500/20 text-amber-300" :
                          p.role === "Officer" ? "bg-cyan-500/20 text-cyan-300" :
                          p.role === "Treasurer" ? "bg-emerald-500/20 text-emerald-300" :
                          p.role === "Member" ? "bg-indigo-500/20 text-indigo-300" : "bg-rose-500/20 text-rose-300"
                        }`}>
                          {p.role}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 mt-1 border-t border-slate-800">
                    <button
                      onClick={() => setActiveTab("login")}
                      className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-colors"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Open Role Login Portal</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wallet / Registration Badge */}
            <div className="flex items-center gap-1.5">
              {isVerified ? (
                <div 
                  title={`Authorized Wallet: ${account}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-xs font-mono text-emerald-300"
                >
                  <span className="badge-dot badge-dot-green"></span>
                  <span className="hidden sm:inline">{truncateAddress(account)}</span>
                  <span className="sm:hidden">{account.slice(0, 4)}..</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold transition-all animate-pulse"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Verify ID</span>
                </button>
              )}

              {/* Transaction Logs Trigger */}
              <button
                onClick={() => setShowTxHistory(true)}
                title="View on-chain transaction ledger"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all"
              >
                <History className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Mobile Tab Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-900 scrollbar-none">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive 
                    ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40" 
                    : "text-slate-400 hover:bg-slate-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
