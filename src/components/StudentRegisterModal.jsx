import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { useData } from "../context/DataContext";
import { ShieldCheck, Mail, Key, CheckCircle2, AlertCircle, X, Sparkles } from "lucide-react";

export function StudentRegisterModal({ isOpen, onClose }) {
  const { account, setIsVerified, setRollNo, setUserRole } = useWeb3();
  const { verifyStudent, authorizeWallet } = useData();

  const [step, setStep] = useState(1); // 1: Info, 2: OTP, 3: Success
  const [rollInput, setRollInput] = useState("2023BCSE042");
  const [emailInput, setEmailInput] = useState("aditi.sharma@college.edu.in");
  const [otpInput, setOtpInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifiedStudent, setVerifiedStudent] = useState(null);

  if (!isOpen) return null;

  const handleRequestOTP = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!rollInput.trim() || !emailInput.trim()) {
      setErrorMsg("Please provide both College Roll Number and Institutional Email.");
      return;
    }

    if (!emailInput.endsWith("@college.edu.in")) {
      setErrorMsg("Security Policy: Only official institutional '@college.edu.in' emails are permitted.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      setOtpInput("123456"); // Pre-fill demo OTP for convenience
    }, 600);
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const res = verifyStudent(rollInput, emailInput, otpInput);

      if (!res.success) {
        setErrorMsg(res.message);
        return;
      }

      try {
        // Authorize wallet on-chain
        authorizeWallet(account, rollInput, "Member");
        setVerifiedStudent(res.student);
        setIsVerified(true);
        setRollNo(res.student.rollNo);
        setUserRole(res.student.role || "Member");
        setStep(3);
      } catch (err) {
        setErrorMsg(err.message || "Failed to authorize wallet on-chain.");
      }
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-md p-6 border border-slate-700/80 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step 1: Roll No & Email */}
        {step === 1 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Student Identity Verification</h3>
                <p className="text-xs text-slate-400">Section 10: Roster Matching & Institutional Auth</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              To prevent duplicate voting and fake wallets, Campus DAO requires verification against the official college student database before linking your MetaMask address.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">College Roll Number</label>
                <input
                  type="text"
                  value={rollInput}
                  onChange={(e) => setRollInput(e.target.value)}
                  placeholder="e.g. 2023BCSE042"
                  className="input-field font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Institutional Email ID</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. aditi.sharma@college.edu.in"
                  className="input-field"
                  required
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
                <div className="font-semibold text-slate-300 mb-1">Target Wallet to be Authorized:</div>
                <div className="font-mono text-indigo-300 truncate">{account}</div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-2.5 text-sm font-semibold"
              >
                {loading ? "Verifying Roster..." : "Send Verification OTP →"}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Enter Email OTP</h3>
                <p className="text-xs text-slate-400">Sent to: <span className="text-cyan-300 font-mono">{emailInput}</span></p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              A 6-digit one-time passcode has been generated for institutional validation. (Demo OTP is <strong>123456</strong>).
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="123456"
                  className="input-field text-center font-mono tracking-widest text-lg"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-secondary py-2.5 flex-1 text-xs"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-cyan py-2.5 flex-1 text-xs font-semibold"
                >
                  {loading ? "Linking Wallet..." : "Authorize On-Chain ✓"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Success Confirmation */}
        {step === 3 && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Identity & Wallet Authorized!</h3>
            <p className="text-xs text-slate-300 mb-4">
              Welcome, <span className="font-semibold text-white">{verifiedStudent?.name}</span> ({verifiedStudent?.rollNo}).
            </p>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-left text-xs space-y-2 mb-5">
              <div className="flex justify-between">
                <span className="text-slate-400">Student Roll:</span>
                <span className="font-mono text-slate-200">{verifiedStudent?.rollNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Program:</span>
                <span className="text-slate-200">{verifiedStudent?.program}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Governance Wallet:</span>
                <span className="font-mono text-emerald-300">{account.slice(0, 8)}...{account.slice(-6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Contract Role:</span>
                <span className="font-semibold text-indigo-400">{verifiedStudent?.role || "Member"}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full btn btn-emerald py-2.5 text-sm font-semibold"
            >
              Start Participating in Campus DAO
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
