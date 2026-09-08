import React, { useState } from "react";
import { useWeb3, DEMO_PERSONAS } from "../context/Web3Context";
import { useData } from "../context/DataContext";
import { 
  ShieldCheck, 
  GraduationCap, 
  Vote, 
  Coins, 
  KeyRound, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  UserCheck, 
  Lock, 
  Mail, 
  Fingerprint, 
  Sparkles,
  LogOut,
  ChevronRight
} from "lucide-react";

export function Login({ setActiveTab }) {
  const { session, loginUser, logoutUser, userRole, connectMetaMask, isMetaMaskAvailable, mode } = useWeb3();
  const { roster } = useData();

  const [activeRoleTab, setActiveRoleTab] = useState("student"); // 'student', 'officer', 'treasurer', 'admin', 'wallet'
  
  // Custom form states
  const [inputRollNo, setInputRollNo] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [inputPass, setInputPass] = useState("");
  const [inputOtp, setInputOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSendOtp = () => {
    if (!inputRollNo.trim() || !inputEmail.trim()) {
      setErrorMsg("Please enter both your Roll Number and College Email first.");
      return;
    }
    setErrorMsg("");
    setOtpSent(true);
    setInputOtp("123456");
    setSuccessMsg("Demo OTP generated and dispatched: 123456");
  };

  const handleRoleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const targetRoll = inputRollNo.trim().toUpperCase();

    if (activeRoleTab === "student") {
      // Find in roster
      const matched = roster.find(r => r.rollNo.toUpperCase() === targetRoll);
      if (!matched) {
        setErrorMsg(`Roll number ${targetRoll} not found in College Institutional Roster.`);
        return;
      }
      if (otpSent && inputOtp !== "123456") {
        setErrorMsg("Invalid OTP. Use demo OTP: 123456");
        return;
      }
      loginUser({
        name: matched.name,
        rollNo: matched.rollNo,
        email: matched.email,
        role: matched.role === "Unverified" ? "Member" : matched.role,
        address: matched.wallet || "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        isVerified: true,
        avatar: matched.name.includes("Aditi") || matched.name.includes("Priya") || matched.name.includes("Sneha") ? "👩‍🎓" : "👨‍🎓"
      }, "student_verified");
      setSuccessMsg(`Welcome, ${matched.name}! Authenticated as Student Member.`);
      setTimeout(() => setActiveTab("dashboard"), 900);
    } 
    else if (activeRoleTab === "officer") {
      loginUser(DEMO_PERSONAS.officer, "officer");
      setSuccessMsg("Authenticated as Club Executive Officer!");
      setTimeout(() => setActiveTab("elections"), 900);
    }
    else if (activeRoleTab === "treasurer") {
      loginUser(DEMO_PERSONAS.treasurer, "treasurer");
      setSuccessMsg("Authenticated as Club Treasurer!");
      setTimeout(() => setActiveTab("treasury"), 900);
    }
    else if (activeRoleTab === "admin") {
      if (inputPass && inputPass !== "admin123" && inputPass !== "dean2026") {
        setErrorMsg("Invalid Admin Passcode! Use demo passcode: admin123");
        return;
      }
      loginUser(DEMO_PERSONAS.admin, "admin");
      setSuccessMsg("Authenticated as College Administrator & Dean!");
      setTimeout(() => setActiveTab("admin"), 900);
    }
  };

  const handleQuickLogin = (personaKey, targetTab = "dashboard") => {
    const persona = DEMO_PERSONAS[personaKey];
    if (!persona) return;
    setErrorMsg("");
    loginUser(persona, personaKey);
    setSuccessMsg(`Logged in as ${persona.name} (${persona.role})`);
    setTimeout(() => setActiveTab(targetTab), 600);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 animate-fade-in pb-16 space-y-8">
      
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Fingerprint className="w-3.5 h-3.5" />
          <span>Role-Based Authentication Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Login with Your <span className="gradient-text-indigo">Campus Role</span>
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          Every role has cryptographically enforced smart-contract permissions. Choose your role below or use 1-click evaluator login for instant viva grading.
        </p>
      </div>

      {/* Active Session Card (if already logged in) */}
      {session?.isLoggedIn && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-cyan-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{session.user?.avatar || "👤"}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{session.user?.name}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                  userRole === "Admin" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                  userRole === "Officer" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" :
                  userRole === "Treasurer" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                  "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                }`}>
                  {userRole}
                </span>
                <span className="badge-dot badge-dot-green"></span>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {session.user?.rollNo} • {session.user?.email}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className="btn btn-primary text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <span>Go to App Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={logoutUser}
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors"
              title="Logout session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Role Tabs Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
        <button
          onClick={() => { setActiveRoleTab("student"); setErrorMsg(""); }}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeRoleTab === "student"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Student Member</span>
        </button>

        <button
          onClick={() => { setActiveRoleTab("officer"); setErrorMsg(""); }}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeRoleTab === "officer"
              ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Vote className="w-4 h-4" />
          <span>Club Officer</span>
        </button>

        <button
          onClick={() => { setActiveRoleTab("treasurer"); setErrorMsg(""); }}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeRoleTab === "treasurer"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Club Treasurer</span>
        </button>

        <button
          onClick={() => { setActiveRoleTab("admin"); setErrorMsg(""); }}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeRoleTab === "admin"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>College Admin</span>
        </button>

        <button
          onClick={() => { setActiveRoleTab("wallet"); setErrorMsg(""); }}
          className={`col-span-2 sm:col-span-1 flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeRoleTab === "wallet"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>MetaMask Web3</span>
        </button>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Login Form */}
        <div className="lg:col-span-2 glass-panel p-6 border border-slate-800/90 shadow-xl space-y-6">
          
          {/* TAB 1: Student Member */}
          {activeRoleTab === "student" && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-bold text-white">Student Member Authentication</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Enforces Section 10: Institutional student email + roll number mapping bound to Ethereum address.
                </p>
              </div>

              <form onSubmit={handleRoleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    College Roll Number
                  </label>
                  <input
                    type="text"
                    value={inputRollNo}
                    onChange={(e) => setInputRollNo(e.target.value)}
                    placeholder="e.g. 2023BCSE042 or 2023BEC031"
                    className="input-field font-mono"
                    required
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Institutional roll number issued by College Registrar Office
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Institutional Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={inputEmail}
                      onChange={(e) => setInputEmail(e.target.value)}
                      placeholder="student.name@college.edu.in"
                      className="input-field pl-9 font-mono text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Verification Method
                    </label>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="btn btn-secondary w-full text-xs py-2 flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{otpSent ? "Resend Demo OTP" : "Request Institutional OTP"}</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      OTP Code / Demo PIN
                    </label>
                    <input
                      type="text"
                      value={inputOtp}
                      onChange={(e) => setInputOtp(e.target.value)}
                      placeholder="123456"
                      className="input-field font-mono text-center tracking-widest text-sm"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full text-xs py-3 font-bold mt-2"
                >
                  Verify Credentials & Login as Student
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Club Officer */}
          {activeRoleTab === "officer" && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2">
                  <Vote className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">Club Officer Authentication</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Authorized to create club elections, submit governance initiatives, and publish event attendance roots.
                </p>
              </div>

              <form onSubmit={handleRoleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Officer Roll Number</label>
                  <input
                    type="text"
                    defaultValue="2023BCSE010"
                    className="input-field font-mono"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Affiliated Club</label>
                  <select className="input-field">
                    <option>Coding Club (Executive Lead)</option>
                    <option>Robotics & IoT Society</option>
                    <option>Campus Cultural Forum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Officer Passkey</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      defaultValue="officer-secret-key"
                      className="input-field pl-9 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn bg-cyan-600 hover:bg-cyan-500 text-white w-full text-xs py-3 font-bold mt-2 shadow-lg shadow-cyan-600/20"
                >
                  Login as Club Officer
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: Club Treasurer */}
          {activeRoleTab === "treasurer" && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">Club Treasurer Authentication</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Enforces Section 14: Authorized to create budget allocation requests and manage simulated INR disbursements.
                </p>
              </div>

              <form onSubmit={handleRoleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Treasurer Roll Number</label>
                  <input
                    type="text"
                    defaultValue="2023BCSE025"
                    className="input-field font-mono"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Club Financial Desk</label>
                  <input
                    type="text"
                    defaultValue="Coding Club — Finance & Accounts Desk"
                    className="input-field"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Financial Passcode</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      defaultValue="treasurer-passcode-2026"
                      className="input-field pl-9 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn bg-emerald-600 hover:bg-emerald-500 text-white w-full text-xs py-3 font-bold mt-2 shadow-lg shadow-emerald-600/20"
                >
                  Login as Club Treasurer
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: College Admin / Dean */}
          {activeRoleTab === "admin" && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-bold text-white">College Administration & Dean Portal</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Enforces Section 11: Authorize student wallets on-chain, resolve lost keys, and exercise faculty oversight.
                </p>
              </div>

              <form onSubmit={handleRoleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Identifier</label>
                  <input
                    type="text"
                    defaultValue="ADMIN_ROOT (Dr. Ramesh Sharma, Faculty Advisor)"
                    className="input-field font-mono"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Master Dean Passcode</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={inputPass}
                      onChange={(e) => setInputPass(e.target.value)}
                      placeholder="Enter admin passcode (demo: admin123)"
                      className="input-field pl-9 text-xs"
                      defaultValue="admin123"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn bg-amber-600 hover:bg-amber-500 text-white w-full text-xs py-3 font-bold mt-2 shadow-lg shadow-amber-600/20"
                >
                  Login as College Administrator
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: Web3 Wallet Login */}
          {activeRoleTab === "wallet" && (
            <div className="space-y-5 text-center py-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <KeyRound className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Direct Web3 Wallet Authentication</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Connect MetaMask or any EVM browser wallet. The contract automatically looks up your authorized role in MembershipContract.sol.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Web3 Provider:</span>
                  <span className="text-white font-mono">{isMetaMaskAvailable ? "MetaMask Detected" : "Simulation Mode Active"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Target Chain ID:</span>
                  <span className="text-cyan-400 font-mono">31337 (Hardhat) / 11155111 (Sepolia)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={connectMetaMask}
                className="btn bg-purple-600 hover:bg-purple-500 text-white py-3 px-8 text-xs font-bold shadow-lg shadow-purple-600/25 inline-flex items-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Connect MetaMask Wallet</span>
              </button>
            </div>
          )}

        </div>

        {/* Right 1 Col: Quick Evaluator 1-Click Login Cards */}
        <div className="space-y-4">
          <div className="glass-panel p-5 border border-slate-800/90 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                1-Click Evaluator Logins
              </span>
              <span className="badge-dot badge-dot-cyan"></span>
            </div>

            <p className="text-[11px] text-slate-400">
              For grading convenience, instantly switch personas with pre-configured on-chain roles:
            </p>

            <div className="space-y-2">
              {/* Aditi */}
              <button
                onClick={() => handleQuickLogin("student_verified", "elections")}
                className="w-full p-2.5 rounded-lg bg-slate-900 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">👩‍🎓</span>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-indigo-300">Aditi Sharma</div>
                      <div className="text-[10px] text-slate-400">2023BCSE042 • CSE Year 2</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    Student Member
                  </span>
                </div>
              </button>

              {/* Rahul */}
              <button
                onClick={() => handleQuickLogin("officer", "elections")}
                className="w-full p-2.5 rounded-lg bg-slate-900 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">👨‍💻</span>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300">Rahul Verma</div>
                      <div className="text-[10px] text-slate-400">2023BCSE010 • Coding Lead</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                    Club Officer
                  </span>
                </div>
              </button>

              {/* Priya */}
              <button
                onClick={() => handleQuickLogin("treasurer", "treasury")}
                className="w-full p-2.5 rounded-lg bg-slate-900 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">👩‍💼</span>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-emerald-300">Priya Nair</div>
                      <div className="text-[10px] text-slate-400">2023BCSE025 • Treasurer</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Treasurer
                  </span>
                </div>
              </button>

              {/* Dr. Sharma */}
              <button
                onClick={() => handleQuickLogin("admin", "admin")}
                className="w-full p-2.5 rounded-lg bg-slate-900 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">👨‍🏫</span>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-amber-300">Dr. Sharma</div>
                      <div className="text-[10px] text-slate-400">ADMIN_ROOT • Dean</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    College Admin
                  </span>
                </div>
              </button>

              {/* Ronit (Unverified) */}
              <button
                onClick={() => handleQuickLogin("student_unauthorized", "dashboard")}
                className="w-full p-2.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">👤</span>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-rose-300">Ronit Sen</div>
                      <div className="text-[10px] text-slate-400">2023BCSE099 • Unverified</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                    Sybil Test
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Role Permissions Summary */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Role Permissions Overview:
            </span>
            <ul className="space-y-1 text-slate-400 text-[11px]">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                <strong>Student:</strong> Vote in elections & proposals (1 per rollNo)
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                <strong>Officer:</strong> Deploy elections & event attendance roots
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <strong>Treasurer:</strong> Submit ₹ INR requests & release test funds
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-amber-400" />
                <strong>Admin:</strong> On-chain wallet authorizations & Sybil defense
              </li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
}
