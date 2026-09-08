import React, { useState } from "react";
import { Web3Provider, useWeb3 } from "./context/Web3Context";
import { DataProvider } from "./context/DataContext";
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./pages/Dashboard";
import { Elections } from "./pages/Elections";
import { Proposals } from "./pages/Proposals";
import { Treasury } from "./pages/Treasury";
import { AttendanceRecords } from "./pages/AttendanceRecords";
import { Admin } from "./pages/Admin";
import { VivaPortal } from "./pages/VivaPortal";
import { Login } from "./pages/Login";
import { StudentRegisterModal } from "./components/StudentRegisterModal";
import { TxNotificationModal } from "./components/TxNotificationModal";
import { TxHistoryModal } from "./components/TxHistoryModal";
import { ShieldCheck, Heart, Github, ExternalLink } from "lucide-react";

function MainApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showTxHistory, setShowTxHistory] = useState(false);
  const { latestTxModal, setLatestTxModal } = useWeb3();

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        setShowTxHistory={setShowTxHistory}
        setShowRegisterModal={setShowRegisterModal}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === "login" && (
          <Login setActiveTab={setActiveTab} />
        )}
        {activeTab === "dashboard" && (
          <Dashboard setActiveTab={setActiveTab} setShowRegisterModal={setShowRegisterModal} />
        )}
        {activeTab === "elections" && (
          <Elections setShowRegisterModal={setShowRegisterModal} />
        )}
        {activeTab === "proposals" && (
          <Proposals setShowRegisterModal={setShowRegisterModal} />
        )}
        {activeTab === "treasury" && (
          <Treasury setShowRegisterModal={setShowRegisterModal} />
        )}
        {activeTab === "records" && (
          <AttendanceRecords />
        )}
        {activeTab === "admin" && (
          <Admin />
        )}
        {activeTab === "viva" && (
          <VivaPortal setActiveTab={setActiveTab} />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/80 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-400">Campus DAO</span>
            <span>• College Academic Project • Hybrid Web3 dApp</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <span>Region: India (INR-governed)</span>
            <span>EVM Testnet Architecture</span>
            <button 
              onClick={() => setActiveTab("login")}
              className="text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Role Login Portal
            </button>
            <button 
              onClick={() => setActiveTab("viva")}
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Professor Viva Portal
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <StudentRegisterModal 
        isOpen={showRegisterModal} 
        onClose={() => setShowRegisterModal(false)} 
      />

      <TxNotificationModal 
        tx={latestTxModal} 
        onClose={() => setLatestTxModal(null)} 
      />

      <TxHistoryModal 
        isOpen={showTxHistory} 
        onClose={() => setShowTxHistory(false)} 
      />
    </div>
  );
}

export default function App() {
  return (
    <Web3Provider>
      <DataProvider>
        <MainApp />
      </DataProvider>
    </Web3Provider>
  );
}
