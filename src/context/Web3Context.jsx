import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";

// Default pre-seeded demo accounts with roles for instant evaluation
export const DEMO_PERSONAS = {
  admin: {
    name: "Dr. Sharma (College Admin)",
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    role: "Admin",
    roleId: 4,
    rollNo: "ADMIN_ROOT",
    email: "admin@college.edu.in",
    isVerified: true,
    avatar: "👨‍🏫"
  },
  officer: {
    name: "Rahul Verma (Coding Club Lead)",
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    role: "Officer",
    roleId: 2,
    rollNo: "2023BCSE010",
    email: "rahul.verma@college.edu.in",
    isVerified: true,
    avatar: "👨‍💻"
  },
  treasurer: {
    name: "Priya Nair (Club Treasurer)",
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    role: "Treasurer",
    roleId: 3,
    rollNo: "2023BCSE025",
    email: "priya.nair@college.edu.in",
    isVerified: true,
    avatar: "👩‍💼"
  },
  student_verified: {
    name: "Aditi Sharma (Verified Student)",
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    role: "Member",
    roleId: 1,
    rollNo: "2023BCSE042",
    email: "aditi.sharma@college.edu.in",
    isVerified: true,
    avatar: "👩‍🎓"
  },
  student_unauthorized: {
    name: "Ronit Sen (Unlinked Wallet / Sybil Test)",
    address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    role: "Unverified",
    roleId: 0,
    rollNo: "2023BCSE099",
    email: "ronit.sen@college.edu.in",
    isVerified: false,
    avatar: "👤"
  }
};

const Web3Context = createContext();

const loadInitialSession = () => {
  try {
    const saved = localStorage.getItem("campus_dao_session");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.user) return parsed;
    }
  } catch (e) {
    console.error("Failed to load initial session", e);
  }
  return {
    isLoggedIn: true,
    user: DEMO_PERSONAS.student_verified,
    personaKey: "student_verified"
  };
};

export function Web3Provider({ children }) {
  const [initialSession] = useState(loadInitialSession);
  const [session, setSession] = useState(initialSession);
  const [mode, setMode] = useState("simulation"); // 'metamask' or 'simulation'
  const [currentPersonaKey, setCurrentPersonaKey] = useState(initialSession.personaKey || "student_verified");
  const [account, setAccount] = useState(initialSession.user?.address || DEMO_PERSONAS.student_verified.address);
  const [userRole, setUserRole] = useState(initialSession.user?.role || DEMO_PERSONAS.student_verified.role);
  const [isVerified, setIsVerified] = useState(initialSession.user?.isVerified ?? true);
  const [rollNo, setRollNo] = useState(initialSession.user?.rollNo || DEMO_PERSONAS.student_verified.rollNo);
  const [faucetBalance, setFaucetBalance] = useState("1.85");
  const [chainId, setChainId] = useState(31337);
  const [networkName, setNetworkName] = useState("Hardhat Local / Web3 Sandbox");
  const [transactions, setTransactions] = useState([
    {
      hash: "0x78a49c2d1b0f5e3a890123456789abcdef0123456789abcdef0123456789abcd",
      method: "authorizeWallet",
      description: "Admin authorized wallet for 2023BCSE042",
      timestamp: Date.now() - 3600000,
      status: "Confirmed",
      blockNumber: 10421
    }
  ]);
  const [latestTxModal, setLatestTxModal] = useState(null);

  const isMetaMaskAvailable = typeof window !== "undefined" && Boolean(window.ethereum);

  // Sync session changes to localStorage
  const loginUser = (userProfile, personaKey = null) => {
    const newSession = {
      isLoggedIn: true,
      user: userProfile,
      personaKey: personaKey || (Object.entries(DEMO_PERSONAS).find(([_, p]) => p.rollNo === userProfile.rollNo)?.[0] || "custom")
    };
    setSession(newSession);
    try {
      localStorage.setItem("campus_dao_session", JSON.stringify(newSession));
    } catch (e) {
      console.error("Failed to save session", e);
    }
    setAccount(userProfile.address || "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(""));
    setUserRole(userProfile.role || "Member");
    setIsVerified(userProfile.isVerified ?? true);
    setRollNo(userProfile.rollNo || "");
    if (personaKey) setCurrentPersonaKey(personaKey);
  };

  const logoutUser = () => {
    localStorage.removeItem("campus_dao_session");
    setSession({
      isLoggedIn: false,
      user: null,
      personaKey: null
    });
    setAccount("");
    setUserRole("Unverified");
    setIsVerified(false);
    setRollNo("");
  };

  // Connect Real MetaMask
  const connectMetaMask = async () => {
    if (!isMetaMaskAvailable) {
      alert("MetaMask extension not detected! Continuing with Web3 Simulation mode.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();

      setMode("metamask");
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
      setNetworkName(network.name === "unknown" ? `Chain ${network.chainId}` : network.name);

      // Listen for account change
      window.ethereum.on("accountsChanged", (newAccounts) => {
        if (newAccounts.length > 0) {
          setAccount(newAccounts[0]);
        } else {
          setMode("simulation");
          setAccount(DEMO_PERSONAS.student_verified.address);
        }
      });

      // Listen for chain change
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    } catch (err) {
      console.error("MetaMask connection failed:", err);
      alert("MetaMask connection cancelled or failed: " + (err.message || "Unknown error"));
    }
  };

  // Switch persona (for frictionless professor viva / grading demo)
  const switchPersona = (personaKey) => {
    if (!DEMO_PERSONAS[personaKey]) return;
    const p = DEMO_PERSONAS[personaKey];
    setMode("simulation");
    setCurrentPersonaKey(personaKey);
    setAccount(p.address);
    setUserRole(p.role);
    setIsVerified(p.isVerified);
    setRollNo(p.rollNo);

    const newSession = {
      isLoggedIn: true,
      user: p,
      personaKey
    };
    setSession(newSession);
    try {
      localStorage.setItem("campus_dao_session", JSON.stringify(newSession));
    } catch (e) {
      console.error("Failed to save session", e);
    }
  };

  // Claim Testnet ETH Faucet
  const claimFaucet = () => {
    const added = 1.0;
    const newBal = (parseFloat(faucetBalance) + added).toFixed(2);
    setFaucetBalance(newBal);

    const tx = {
      hash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      method: "faucet.claim()",
      description: `Disbursed 1.00 Testnet ETH to ${account.slice(0, 6)}...${account.slice(-4)}`,
      timestamp: Date.now(),
      status: "Confirmed",
      blockNumber: Math.floor(10000 + Math.random() * 5000)
    };
    recordTransaction(tx);
  };

  // Record an on-chain transaction
  const recordTransaction = (tx) => {
    setTransactions((prev) => [tx, ...prev]);
    setLatestTxModal(tx);
  };

  return (
    <Web3Context.Provider
      value={{
        session,
        loginUser,
        logoutUser,
        mode,
        setMode,
        account,
        userRole,
        setUserRole,
        isVerified,
        setIsVerified,
        rollNo,
        setRollNo,
        currentPersona: session?.user || DEMO_PERSONAS[currentPersonaKey],
        currentPersonaKey,
        switchPersona,
        faucetBalance,
        chainId,
        networkName,
        isMetaMaskAvailable,
        connectMetaMask,
        claimFaucet,
        transactions,
        recordTransaction,
        latestTxModal,
        setLatestTxModal
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}
