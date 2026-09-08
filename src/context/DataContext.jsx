import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { hashText, hashRecordSet } from "../utils/cryptoUtils";
import { useWeb3 } from "./Web3Context";

const DataContext = createContext();

// Pre-seeded College Institutional Roster
const INITIAL_ROSTER = [
  { rollNo: "2023BCSE042", name: "Aditi Sharma", email: "aditi.sharma@college.edu.in", program: "B.Tech CSE", year: 2, wallet: "0x90F79bf6EB2c4f870365E785982E1f101E93b906", isAuthorized: true, role: "Member" },
  { rollNo: "2023BCSE010", name: "Rahul Verma", email: "rahul.verma@college.edu.in", program: "B.Tech CSE", year: 3, wallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", isAuthorized: true, role: "Officer" },
  { rollNo: "2023BCSE025", name: "Priya Nair", email: "priya.nair@college.edu.in", program: "B.Tech IT", year: 3, wallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", isAuthorized: true, role: "Treasurer" },
  { rollNo: "2023BME015", name: "Karan Gupta", email: "karan.gupta@college.edu.in", program: "B.Tech ME", year: 2, wallet: null, isAuthorized: false, role: "Member" },
  { rollNo: "2023BEC031", name: "Sneha Patel", email: "sneha.patel@college.edu.in", program: "B.Tech ECE", year: 4, wallet: null, isAuthorized: false, role: "Member" },
  { rollNo: "2023BCSE099", name: "Ronit Sen", email: "ronit.sen@college.edu.in", program: "B.Tech CSE", year: 1, wallet: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", isAuthorized: false, role: "Unverified" }
];

const INITIAL_CLUBS = [
  {
    id: "club-coding",
    name: "Coding Club",
    category: "Technical",
    description: "Fostering competitive programming, open source development, hackathons, and Web3 innovation.",
    lead: "Rahul Verma",
    memberCount: 142,
    banner: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    color: "#6366f1"
  },
  {
    id: "club-robotics",
    name: "Robotics & IoT Society",
    category: "Technical",
    description: "Designing autonomous rovers, drones, and edge AI embedded hardware projects.",
    lead: "Karan Gupta",
    memberCount: 88,
    banner: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
    color: "#06b6d4"
  },
  {
    id: "club-cultural",
    name: "Campus Cultural Forum",
    category: "Arts & Culture",
    description: "Organizing the annual college cultural festival, debates, music concerts, and drama productions.",
    lead: "Sneha Patel",
    memberCount: 210,
    banner: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
    color: "#f59e0b"
  }
];

const INITIAL_ELECTIONS = [
  {
    id: 1,
    clubId: "club-coding",
    clubName: "Coding Club",
    title: "Coding Club President Election 2026",
    description: "Elect the next executive student leader for the 2026–2027 academic term. Voting is strictly one vote per verified student wallet enforced by the smart contract.",
    startTime: Date.now() - 3600000,
    endTime: Date.now() + 86400000 * 5,
    status: "Active",
    candidates: [
      { id: 1, name: "Aditi Sharma", manifesto: "Introduce weekly Web3 and AI hack nights and industry mentorship.", votes: 24, avatar: "👩‍🎓" },
      { id: 2, name: "Rahul Verma", manifesto: "Scale competitive programming bootcamps for ICPC.", votes: 19, avatar: "👨‍💻" },
      { id: 3, name: "Karan Gupta", manifesto: "Foster cross-department hardware & software interdisciplinary projects.", votes: 11, avatar: "👨‍🔧" }
    ],
    voters: {
      // studentIdHash: candidateId
    }
  }
];

const INITIAL_PROPOSALS = [
  {
    id: 1,
    clubId: "club-coding",
    clubName: "Coding Club",
    title: "Conduct National College Hackathon 'Hack-Campus 2026'",
    description: "Organize a 36-hour inter-college hackathon with tracks in Web3, AI, and Cybersecurity. Expected participation of 300+ students across 25 institutions.",
    proposer: "Rahul Verma (Officer)",
    proposerAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    category: "Events",
    startTime: Date.now() - 86400000,
    endTime: Date.now() + 86400000 * 3,
    yesVotes: 38,
    noVotes: 4,
    status: "Active",
    contentHash: ethers.keccak256(ethers.toUtf8Bytes("Conduct National College Hackathon 'Hack-Campus 2026'")),
    voters: {}
  }
];

const INITIAL_TREASURY_PROPOSALS = [
  {
    id: 1,
    clubId: "club-coding",
    clubName: "Coding Club",
    title: "Request ₹15,000 for Hack-Campus Refreshments & Trophies",
    description: "Budget allocation for participant meals, certificates, and prize trophies. Real funds will be processed by College Accounts Office via UPI/NEFT upon DAO approval.",
    amountINR: 15000,
    proposer: "Priya Nair (Treasurer)",
    proposerAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    startTime: Date.now() - 7200000,
    endTime: Date.now() + 86400000 * 4,
    yesVotes: 42,
    noVotes: 2,
    status: "Active", // Active, Approved, Rejected, Executed
    demoFundsReleased: false,
    realPaymentStatus: "Pending Governance Vote",
    realPaymentRef: "SBI-COLLEGE-REF-PENDING",
    contentHash: ethers.keccak256(ethers.toUtf8Bytes("Request ₹15,000 for Hack-Campus Refreshments & Trophies")),
    voters: {}
  }
];

const INITIAL_ATTENDANCE_RECORDS = [
  {
    recordSetId: "0x" + Array.from(ethers.toUtf8Bytes("EVENT_ATTENDANCE_WEB3_WORKSHOP_DAY1")).map(b => b.toString(16).padStart(2, '0')).join('').padEnd(64, '0'),
    eventName: "Web3 Architecture & Solidity Workshop — Day 1",
    eventDate: "March 5, 2026",
    issuer: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (Rahul Verma)",
    timestamp: Date.now() - 86400000 * 2,
    isTamperedLocally: false,
    records: [
      { rollNo: "2023BCSE042", name: "Aditi Sharma", status: "Present", timestamp: "09:15 AM" },
      { rollNo: "2023BCSE010", name: "Rahul Verma", status: "Present", timestamp: "09:02 AM" },
      { rollNo: "2023BCSE025", name: "Priya Nair", status: "Present", timestamp: "09:10 AM" },
      { rollNo: "2023BME015", name: "Karan Gupta", status: "Absent", timestamp: "-" },
      { rollNo: "2023BEC031", name: "Sneha Patel", status: "Present", timestamp: "09:25 AM" }
    ]
  }
];

// Storage helpers for permanent persistence
const loadStorage = (key, defaultVal) => {
  try {
    const saved = localStorage.getItem(`campus_dao_${key}`);
    return saved ? JSON.parse(saved) : defaultVal;
  } catch (e) {
    console.error("Storage load failed for", key, e);
    return defaultVal;
  }
};

const saveStorage = (key, val) => {
  try {
    localStorage.setItem(`campus_dao_${key}`, JSON.stringify(val));
  } catch (e) {
    console.error("Storage save failed for", key, e);
  }
};

export function DataProvider({ children }) {
  const { account, userRole, rollNo, isVerified, recordTransaction } = useWeb3();

  const [roster, setRoster] = useState(() => loadStorage("roster", INITIAL_ROSTER));
  const [clubs, setClubs] = useState(() => loadStorage("clubs", INITIAL_CLUBS));
  const [elections, setElections] = useState(() => loadStorage("elections", INITIAL_ELECTIONS));
  const [proposals, setProposals] = useState(() => loadStorage("proposals", INITIAL_PROPOSALS));
  const [treasuryProposals, setTreasuryProposals] = useState(() => loadStorage("treasuryProposals", INITIAL_TREASURY_PROPOSALS));
  const [attendanceBatches, setAttendanceBatches] = useState(() => {
    return loadStorage("attendanceBatches", INITIAL_ATTENDANCE_RECORDS.map(batch => ({
      ...batch,
      onChainHash: hashRecordSet(batch.records)
    })));
  });

  // Permanently sync changes to localStorage
  useEffect(() => saveStorage("roster", roster), [roster]);
  useEffect(() => saveStorage("clubs", clubs), [clubs]);
  useEffect(() => saveStorage("elections", elections), [elections]);
  useEffect(() => saveStorage("proposals", proposals), [proposals]);
  useEffect(() => saveStorage("treasuryProposals", treasuryProposals), [treasuryProposals]);
  useEffect(() => saveStorage("attendanceBatches", attendanceBatches), [attendanceBatches]);

  const resetAllData = () => {
    localStorage.removeItem("campus_dao_roster");
    localStorage.removeItem("campus_dao_clubs");
    localStorage.removeItem("campus_dao_elections");
    localStorage.removeItem("campus_dao_proposals");
    localStorage.removeItem("campus_dao_treasuryProposals");
    localStorage.removeItem("campus_dao_attendanceBatches");
    setRoster(INITIAL_ROSTER);
    setClubs(INITIAL_CLUBS);
    setElections(INITIAL_ELECTIONS);
    setProposals(INITIAL_PROPOSALS);
    setTreasuryProposals(INITIAL_TREASURY_PROPOSALS);
    setAttendanceBatches(INITIAL_ATTENDANCE_RECORDS.map(b => ({ ...b, onChainHash: hashRecordSet(b.records) })));
  };

  // Verify Student Identity via Institutional Email OTP flow (§10)
  const verifyStudent = (inputRollNo, inputEmail, otp) => {
    const matched = roster.find(
      r => r.rollNo.toUpperCase() === inputRollNo.toUpperCase() && 
           r.email.toLowerCase() === inputEmail.toLowerCase()
    );

    if (!matched) {
      return { success: false, message: "Roll Number and Email do not match College Roster records." };
    }

    if (otp !== "123456" && otp !== "000000") {
      return { success: false, message: "Invalid OTP! Use demo OTP 123456." };
    }

    // Mark student as verified in roster
    setRoster(prev => prev.map(r => r.rollNo === matched.rollNo ? { ...r, isVerified: true } : r));

    return { success: true, student: matched };
  };

  // Authorize student wallet on-chain (§11)
  const authorizeWallet = (targetWallet, targetRollNo, role = "Member") => {
    const studentIdHash = ethers.keccak256(ethers.toUtf8Bytes(targetRollNo));

    // Check if wallet or student already linked
    const existingWallet = roster.find(r => r.wallet && r.wallet.toLowerCase() === targetWallet.toLowerCase());
    if (existingWallet && existingWallet.rollNo !== targetRollNo) {
      throw new Error(`Wallet ${targetWallet.slice(0, 6)}... is already linked to roll number ${existingWallet.rollNo}!`);
    }

    setRoster(prev => prev.map(r => {
      if (r.rollNo === targetRollNo) {
        return { ...r, wallet: targetWallet, isAuthorized: true, role };
      }
      return r;
    }));

    const tx = {
      hash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      method: "Membership.authorizeWallet",
      description: `Authorized wallet ${targetWallet.slice(0, 6)}... for student ${targetRollNo} (Role: ${role})`,
      timestamp: Date.now(),
      status: "Confirmed",
      blockNumber: Math.floor(10000 + Math.random() * 5000)
    };
    recordTransaction(tx);
    return tx;
  };

  // Revoke wallet (§11)
  const revokeWallet = (targetWallet) => {
    setRoster(prev => prev.map(r => {
      if (r.wallet && r.wallet.toLowerCase() === targetWallet.toLowerCase()) {
        return { ...r, isAuthorized: false };
      }
      return r;
    }));

    const tx = {
      hash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      method: "Membership.revokeWallet",
      description: `Revoked authorization for wallet ${targetWallet.slice(0, 6)}...`,
      timestamp: Date.now(),
      status: "Confirmed",
      blockNumber: Math.floor(10000 + Math.random() * 5000)
    };
    recordTransaction(tx);
    return tx;
  };

  // Replace lost or compromised wallet (§11)
  const replaceWallet = (targetRollNo, oldWallet, newWallet) => {
    setRoster(prev => prev.map(r => {
      if (r.rollNo === targetRollNo) {
        return { ...r, wallet: newWallet, isAuthorized: true };
      }
      return r;
    }));

    const tx = {
      hash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      method: "Membership.replaceWallet",
      description: `Replaced wallet for ${targetRollNo} from ${oldWallet.slice(0, 6)}... to ${newWallet.slice(0, 6)}...`,
      timestamp: Date.now(),
      status: "Confirmed",
      blockNumber: Math.floor(10000 + Math.random() * 5000)
    };
    recordTransaction(tx);
    return tx;
  };

  // Cast Vote in an Election (§12)
  const castVote = (electionId, candidateId) => {
    // 1. Authorization check
    const student = roster.find(r => r.wallet && r.wallet.toLowerCase() === account.toLowerCase());
    if (!student || !student.isAuthorized) {
      throw new Error("REVERT: VotingContract: Wallet is not authorized for governance!");
    }

    const studentIdHash = ethers.keccak256(ethers.toUtf8Bytes(student.rollNo));

    // 2. One vote per studentIdHash check
    const election = elections.find(e => e.id === electionId);
    if (!election) throw new Error("Election not found!");

    if (election.voters && election.voters[studentIdHash]) {
      throw new Error(`REVERT: VotingContract: Student ${student.rollNo} has already cast a vote in this election!`);
    }

    // 3. Time bounds check
    const now = Date.now();
    if (now < election.startTime || now > election.endTime) {
      throw new Error("REVERT: VotingContract: Election is not currently active!");
    }

    // 4. Update vote count
    setElections(prev => prev.map(e => {
      if (e.id === electionId) {
        const updatedCandidates = e.candidates.map(c => 
          c.id === candidateId ? { ...c, votes: c.votes + 1 } : c
        );
        return {
          ...e,
          candidates: updatedCandidates,
          voters: { ...e.voters, [studentIdHash]: candidateId }
        };
      }
      return e;
    }));

    const tx = {
      hash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      method: "VotingContract.vote",
      description: `Cast vote in Election #${electionId} for Candidate #${candidateId}`,
      timestamp: Date.now(),
      status: "Confirmed",
      blockNumber: Math.floor(10000 + Math.random() * 5000)
    };
    recordTransaction(tx);
    return tx;
  };

  // Create Election (§12)
  const createElection = (newElectionData) => {
    if (userRole !== "Officer" && userRole !== "Admin") {
      throw new Error("REVERT: VotingContract: Insufficient permissions (Officer or Admin required)!");
    }

    const newId = elections.length > 0 ? Math.max(...elections.map(e => e.id)) + 1 : 1;
    const election = {
      id: newId,
      clubId: newElectionData.clubId || "club-coding",
      clubName: newElectionData.clubName || "Coding Club",
      title: newElectionData.title,
      description: newElectionData.description,
      startTime: Date.now(),
      endTime: Date.now() + (newElectionData.durationDays || 5) * 86400000,
      status: "Active",
      candidates: newElectionData.candidates.map((c, idx) => {
        if (typeof c === "object") {
          return {
            id: idx + 1,
            rollNo: c.rollNo || "",
            name: c.name,
            program: c.program || "",
            manifesto: c.manifesto || `Candidate for ${newElectionData.clubName}`,
            votes: 0,
            avatar: c.avatar || "👤"
          };
        }
        return {
          id: idx + 1,
          name: c,
          manifesto: `Vision for ${newElectionData.clubName}`,
          votes: 0,
          avatar: "👤"
        };
      }),
      voters: {}
    };

    setElections(prev => {
      const updated = [election, ...prev];
      saveStorage("elections", updated);
      return updated;
    });

    const tx = {
      hash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      method: "VotingContract.createElection",
      description: `Created election #${newId}: "${newElectionData.title}" with ${election.candidates.length} candidates`,
      timestamp: Date.now(),
      status: "Confirmed",
      blockNumber: Math.floor(10000 + Math.random() * 5000)
    };
    recordTransaction(tx);
    return { tx, election };
  };

  // Vote on Governance Proposal (§13)
  const voteProposal = (proposalId, support) => {
    const student = roster.find(r => r.wallet && r.wallet.toLowerCase() === account.toLowerCase());
    if (!student || !student.isAuthorized) {
      throw new Error("REVERT: GovernanceContract: Wallet is not authorized!");
    }

    const studentIdHash = ethers.keccak256(ethers.toUtf8Bytes(student.rollNo));
    const p = proposals.find(item => item.id === proposalId);
    if (!p) throw new Error("Proposal not found!");

    if (p.voters && p.voters[studentIdHash] !== undefined) {
      throw new Error("REVERT: GovernanceContract: Student has already voted on this proposal!");
    }

    setProposals(prev => prev.map(item => {
      if (item.id === proposalId) {
        return {
          ...item,
          yesVotes: support ? item.yesVotes + 1 : item.yesVotes,
          noVotes: !support ? item.noVotes + 1 : item.noVotes,
          voters: { ...item.voters, [studentIdHash]: support }
        };
      }
      return item;
    }));

    const tx = {
      hash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      method: "GovernanceContract.voteOnProposal",
      description: `Voted ${support ? "YES" : "NO"} on Governance Proposal #${proposalId}`,
      timestamp: Date.now(),
      status: "Confirmed",
      blockNumber: Math.floor(10000 + Math.random() * 5000)
    };
    recordTransaction(tx);
    return tx;
  };

  // Create Governance Proposal (§13)
  const createProposal = (proposalData) => {
    if (userRole !== "Officer" && userRole !== "Admin") {
      throw new Error("REVERT: GovernanceContract: Only Officers or Admins can submit proposals!");
    }

    const contentHash = hashText(`${proposalData.title}::${proposalData.description}`);
    const newId = proposals.length + 1;
    const newP = {
      id: newId,
      clubId: proposalData.clubId,
      clubName: proposalData.clubName,
      title: proposalData.title,
      description: proposalData.description,
      category: proposalData.category || "General",
      proposer: `${account.slice(0, 6)}... (${userRole})`,
      proposerAddress: account,
      startTime: Date.now(),
      endTime: Date.now() + (proposalData.durationDays || 3) * 86400000,
      yesVotes: 1, // Proposer default
      noVotes: 0,
      status: "Active",
      contentHash,
      voters: {}
    };

    setProposals(prev => [newP, ...prev]);

    const tx = {
      hash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      method: "GovernanceContract.createProposal",
      description: `Created proposal: "${proposalData.title}" (Hash: ${contentHash.slice(0, 10)}...)`,
      timestamp: Date.now(),
      status: "Confirmed",
      blockNumber: Math.floor(10000 + Math.random() * 5000)
    };
    recordTransaction(tx);
    return tx;
  };

  // Finalize Proposal (§13)
  const finalizeProposal = (proposalId) => {
    setProposals(prev => prev.map(p => {
      if (p.id === proposalId) {
        const passed = p.yesVotes > p.noVotes;
        return {
          ...p,
          status: passed ? "Passed" : "Rejected"
        };
      }
      return p;
    }));

    const tx = {
      hash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      method: "GovernanceContract.finalizeProposal",
      description: `Finalized Governance Proposal #${proposalId}`,
      timestamp: Date.now(),
      status: "Confirmed",
      blockNumber: Math.floor(10000 + Math.random() * 5000)
    };
    recordTransaction(tx);
    return tx;
  };

  // Vote on Treasury Proposal (§14)
  const voteTreasuryProposal = (proposalId, support) => {
    const student = roster.find(r => r.wallet && r.wallet.toLowerCase() === account.toLowerCase());
    if (!student || !student.isAuthorized) {
      throw new Error("REVERT: TreasuryContract: Wallet is not authorized!");
    }

    const studentIdHash = ethers.keccak256(ethers.toUtf8Bytes(student.rollNo));
    const p = treasuryProposals.find(item => item.id === proposalId);
    if (!p) throw new Error("Treasury proposal not found!");

    if (p.voters && p.voters[studentIdHash] !== undefined) {
      throw new Error("REVERT: TreasuryContract: Student has already voted on this proposal!");
    }

    setTreasuryProposals(prev => prev.map(item => {
      if (item.id === proposalId) {
        return {
          ...item,
          yesVotes: support ? item.yesVotes + 1 : item.yesVotes,
          noVotes: !support ? item.noVotes + 1 : item.noVotes,
          voters: { ...item.voters, [studentIdHash]: support }
        };
      }
      return item;
    }));

    const tx = {
      hash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      method: "TreasuryContract.voteOnSpendingProposal",
      description: `Voted ${support ? "YES" : "NO"} on Treasury Spending Proposal #${proposalId}`,
      timestamp: Date.now(),
      status: "Confirmed",
      blockNumber: Math.floor(10000 + Math.random() * 5000)
    };
    recordTransaction(tx);
    return tx;
  };

  // Create Treasury Proposal (§14)
  const createTreasuryProposal = (data) => {
    if (userRole !== "Treasurer" && userRole !== "Officer" && userRole !== "Admin") {
      throw new Error("REVERT: TreasuryContract: Only Treasurer or Officer can request funds!");
    }

    const contentHash = hashText(`${data.title}::${data.amountINR}::${data.description}`);
    const newId = treasuryProposals.length + 1;
    const newP = {
      id: newId,
      clubId: data.clubId,
      clubName: data.clubName,
      title: data.title,
      description: data.description,
      amountINR: Number(data.amountINR),
      proposer: `${account.slice(0, 6)}... (${userRole})`,
      proposerAddress: account,
      startTime: Date.now(),
      endTime: Date.now() + (data.durationDays || 4) * 86400000,
      yesVotes: 1,
      noVotes: 0,
      status: "Active",
      demoFundsReleased: false,
      realPaymentStatus: "Pending Governance Vote",
      realPaymentRef: "SBI-PENDING-" + Math.floor(100000 + Math.random() * 900000),
      contentHash,
      voters: {}
    };

    setTreasuryProposals(prev => [newP, ...prev]);

    const tx = {
      hash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      method: "TreasuryContract.createSpendingProposal",
      description: `Created budget request: "${data.title}" for ₹${data.amountINR}`,
      timestamp: Date.now(),
      status: "Confirmed",
      blockNumber: Math.floor(10000 + Math.random() * 5000)
    };
    recordTransaction(tx);
    return tx;
  };

  // Finalize Treasury Proposal (§14)
  const finalizeTreasuryProposal = (proposalId) => {
    setTreasuryProposals(prev => prev.map(p => {
      if (p.id === proposalId) {
        const approved = p.yesVotes > p.noVotes;
        return {
          ...p,
          status: approved ? "Approved" : "Rejected",
          realPaymentStatus: approved ? "Approved by DAO — Forwarded to Accounts Office" : "Rejected by Vote"
        };
      }
      return p;
    }));

    const tx = {
      hash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      method: "TreasuryContract.finalizeSpendingProposal",
      description: `Finalized Treasury Spending Proposal #${proposalId} (Emitted SpendingApproved proof)`,
      timestamp: Date.now(),
      status: "Confirmed",
      blockNumber: Math.floor(10000 + Math.random() * 5000)
    };
    recordTransaction(tx);
    return tx;
  };

  // Release Demo Testnet Simulation Funds (§14)
  const releaseDemoFunds = (proposalId) => {
    setTreasuryProposals(prev => prev.map(p => {
      if (p.id === proposalId) {
        return {
          ...p,
          demoFundsReleased: true,
          status: "Executed",
          realPaymentStatus: "Paid via College Bank Account (Ref: UTR-SBI-2026-991204)"
        };
      }
      return p;
    }));

    const tx = {
      hash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      method: "TreasuryContract.releaseDemoFunds",
      description: `Simulated Demo Testnet Asset Disbursal for Proposal #${proposalId}`,
      timestamp: Date.now(),
      status: "Confirmed",
      blockNumber: Math.floor(10000 + Math.random() * 5000)
    };
    recordTransaction(tx);
    return tx;
  };

  // Attendance Record Verification: Tamper Check (§15)
  const verifyAttendanceTamper = (recordSetId) => {
    const batch = attendanceBatches.find(b => b.recordSetId === recordSetId);
    if (!batch) return { isMatch: false, error: "Record batch not found" };

    const currentCalculatedHash = hashRecordSet(batch.records);
    const onChainAnchorHash = batch.onChainHash;
    const isMatch = currentCalculatedHash === onChainAnchorHash;

    return {
      isMatch,
      currentHash: currentCalculatedHash,
      onChainHash: onChainAnchorHash,
      batch
    };
  };

  // Deliberate DB Tamper Simulation (§15)
  // Allows user to click "Simulate Database Tamper" to show professors that altering a record causes an instant hash mismatch!
  const simulateDatabaseTampering = (recordSetId) => {
    setAttendanceBatches(prev => prev.map(batch => {
      if (batch.recordSetId === recordSetId) {
        // Change one student status from Absent to Present
        const updatedRecords = batch.records.map((rec, idx) => {
          if (rec.status === "Absent") {
            return { ...rec, status: "Present", timestamp: "09:44 AM (FORGED)" };
          }
          return rec;
        });
        return {
          ...batch,
          isTamperedLocally: true,
          records: updatedRecords
        };
      }
      return batch;
    }));
  };

  // Reset database back to authentic state
  const resetTamperedDatabase = (recordSetId) => {
    setAttendanceBatches(prev => prev.map(batch => {
      if (batch.recordSetId === recordSetId) {
        return {
          ...batch,
          isTamperedLocally: false,
          records: [
            { rollNo: "2023BCSE042", name: "Aditi Sharma", status: "Present", timestamp: "09:15 AM" },
            { rollNo: "2023BCSE010", name: "Rahul Verma", status: "Present", timestamp: "09:02 AM" },
            { rollNo: "2023BCSE025", name: "Priya Nair", status: "Present", timestamp: "09:10 AM" },
            { rollNo: "2023BME015", name: "Karan Gupta", status: "Absent", timestamp: "-" },
            { rollNo: "2023BEC031", name: "Sneha Patel", status: "Present", timestamp: "09:25 AM" }
          ]
        };
      }
      return batch;
    }));
  };

  return (
    <DataContext.Provider
      value={{
        roster,
        clubs,
        elections,
        proposals,
        treasuryProposals,
        attendanceBatches,
        verifyStudent,
        authorizeWallet,
        revokeWallet,
        replaceWallet,
        castVote,
        createElection,
        voteProposal,
        createProposal,
        finalizeProposal,
        voteTreasuryProposal,
        createTreasuryProposal,
        finalizeTreasuryProposal,
        releaseDemoFunds,
        verifyAttendanceTamper,
        simulateDatabaseTampering,
        resetTamperedDatabase,
        resetAllData
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
