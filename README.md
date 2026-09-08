# Campus DAO — Decentralized College Club Management System

A hybrid Web3 decentralized application (dApp) for managing college club operations — elections, governance proposals, treasury budget approvals, and tamper-evident attendance record verification — using a **Solidity smart-contract layer deployed on an Ethereum-compatible testnet** combined with a modern **React + Vite** frontend and **Supabase** off-chain database.

---

## 🏛️ Region Context & Financial Honesty (India)
- **REAL INR FUNDS ≠ BLOCKCHAIN DEMO TREASURY**
- Campus DAO does **not** custody or transfer real Indian Rupees through smart contracts.
- Actual student club funds remain in the college's existing banking / UPI / accounts office systems.
- The smart contract provides an immutable, independently verifiable **governance approval certificate** (`SpendingApproved` event) that the college accounts department acts on in the real world.
- A simulated demo token release is optionally provided for academic demonstration, clearly distinguished from real currency.

---

## 🚀 Key Features & PRD Mapping

| Feature | PRD Section | On-Chain Responsibility | Off-Chain Responsibility |
|---|---|---|---|
| **Identity & Sybil Mitigation** | §10, §11 | Maps `studentToActiveWallet[studentIdHash] = wallet`. Prevents 1 student from using 10 wallets to multi-vote. | Matches roll number & institutional `@college.edu.in` email OTP against vetted college roster. |
| **Club Elections** | §12 | `VotingContract.sol`: One vote per `studentIdHash` enforced by bytecode. Live tallies, time-bounded windows. | Candidate photos, detailed bios, election banners, and club metadata. |
| **Governance Proposals** | §13 | `GovernanceContract.sol`: Computes and anchors `keccak256` content hash. Enforces quorum and approval thresholds. | Full proposal description, comments, and attachments. |
| **Treasury Governance** | §14 | `TreasuryContract.sol`: Records ₹ INR budget requests, member votes, and emits `SpendingApproved` proof. | Vendor quotes, invoices, and real college bank transfer reference numbers. |
| **Attendance Verification** | §15 | `VerificationContract.sol`: Stores `keccak256(canonicalJSON)` proofs. Detects post-issuance tampering. | Detailed student attendance rows (kept off-chain for privacy). |
| **Admin Access Control** | §21 | `MembershipContract.sol`: Gatekeeping whitelist, role assignment (Officer, Treasurer, Admin), wallet replacement. | **Admin CANNOT alter vote tallies or override proposal outcomes.** |
| **Viva & Demo Portal** | §35, §36 | Interactive 20-step demonstration runner and complete 31 professor viva questions with defensible answers. | Included directly within the application for seamless grading. |

---

## 🛠️ Zero-Cost Technology Stack

- **Frontend**: React 18, Vite, Lucide Icons, Modern Glassmorphism CSS design system.
- **Smart Contracts**: Solidity 0.8.20.
- **Smart Contract Toolchain**: Hardhat, Ethers.js v6, Mocha, Chai.
- **Off-Chain Database**: PostgreSQL / Supabase schema with Row Level Security (RLS) policies.
- **Wallet & Bridge**: MetaMask (`window.ethereum`) + built-in interactive Web3 Sandbox Provider (instant zero-friction testing).

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Compile and Test Smart Contracts
Run the automated test suite verifying all 5 contract modules, Sybil mitigations, time limits, and tamper detection:
```bash
npx hardhat test
```

### 3. Deploy Contracts (Localhost or Testnet)
Deploy to local Hardhat node:
```bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Deploy contracts and export ABIs to frontend
npm run deploy:local
```

### 4. Launch the Web Application
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🎓 Academic Demonstration Mode

Campus DAO features an evaluator persona switcher in the top navigation bar:
- **👨‍🏫 Dr. Sharma (College Admin)**: Authorize / revoke wallets, manage student roster.
- **👨‍💻 Rahul Verma (Coding Club Officer)**: Deploy elections and submit governance proposals.
- **👩‍💼 Priya Nair (Club Treasurer)**: Request ₹15,000 budget allocations.
- **👩‍🎓 Aditi Sharma (Verified Student)**: Cast votes in elections and governance proposals.
- **👤 Ronit Sen (Unverified Student / Sybil Test)**: Test that an unlinked wallet gets rejected with `NotAuthorized`.

---

## 📜 License
MIT License. Built for College Final-Year / Capstone Academic Evaluation.
