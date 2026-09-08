# Campus DAO — Decentralized College Club Management System
## Product Requirements Document (PRD)

**Version:** 1.0
**Prepared for:** College Academic Project — Blockchain-based Hybrid dApp
**Document type:** Implementation-ready PRD
**Region context:** India (INR-based college finance; blockchain used only for governance/verification, not as a payments system)

---

## Table of Contents

1. Product Overview
2. Executive Summary
3. Problem Statement
4. Background
5. Goals & Non-Goals
6. Target Users, Personas & Roles
7. User Stories
8. Functional Requirements (Overview)
9. System Architecture — Off-Chain, On-Chain, Hybrid
10. Authentication & Identity Verification
11. Wallet Integration & Authorization (incl. Sybil/Multi-Wallet Mitigation)
12. Voting System
13. DAO Governance / Proposal System
14. Treasury Governance
15. Attendance / Record Verification
16. Smart Contract Architecture & Modules
17. Database Requirements & Schema (Supabase)
18. API / Frontend-to-Blockchain Interaction
19. Transaction Lifecycle
20. Security Requirements, Threat Model & Attack Scenarios
21. Admin Permissions & Role-Based Access Control
22. Error Handling & Edge Cases
23. Data Models
24. UI/UX Requirements, Screens & Navigation
25. End-to-End User Flows & Blockchain Transaction Flows
26. Technology Stack & Rationale (Zero-Cost Mapping)
27. Why Blockchain / Why Not Everything On-Chain / Why Testnet
28. Development Environment & Deployment Architecture
29. Testing Strategy
30. Acceptance Criteria & MVP Scope
31. Future Enhancements
32. Limitations, Risks & Mitigations
33. Success Metrics
34. Project Milestones & Development Phases
35. Academic Demonstration Script
36. Professor Viva Preparation (Q&A)
37. Final Summary (A–H)

---

## 1. Product Overview

Campus DAO is a **hybrid web application (dApp)** for managing college club operations — elections, governance proposals, treasury approvals, and record verification — using a **Solidity smart-contract layer deployed on an existing Ethereum-compatible public testnet**, combined with a conventional **React + Supabase** application for everything that does not need blockchain-level immutability.

Campus DAO is **not**:
- A new blockchain
- A cryptocurrency or payment product
- A replacement for the college's banking/UPI finance system
- A system that claims blockchain alone verifies a person's real-world identity

Campus DAO **is**:
- A club administration platform (profiles, events, clubs) built on React + Supabase
- A governance and verification layer where voting, proposals, treasury approvals, and record-integrity proofs are enforced by smart contracts on a public testnet
- A demonstrable, zero-cost, academically defensible dApp architecture suitable for a final-year/capstone project

## 2. Executive Summary

College clubs currently run elections, budget approvals, and governance decisions through centralized systems (spreadsheets, admin panels, WhatsApp polls) where a single administrator or officer can — intentionally or accidentally — alter records with no independent way for members to verify what happened. Campus DAO addresses this by moving the **trust-sensitive, auditable decision points** (who voted, what was proposed, whether a proposal passed, whether a record was later altered) onto a public, append-only ledger via smart contracts, while keeping ordinary application data (profiles, event listings, media, non-sensitive records) in a normal off-chain database (Supabase).

The system authenticates a student's real-world identity through the college's own verification channel (institutional email OTP against a known student roster), then links exactly one authorized MetaMask wallet per verified student for governance actions. Smart contracts enforce that only authorized wallets can vote or propose, that each wallet can act once per election, and that governance/treasury actions follow rules encoded in Solidity rather than a person's discretion. All blockchain activity uses a free public Ethereum-compatible testnet and free testnet ETH from faucets — no real cryptocurrency, and no real INR, ever touches the smart contracts.

This PRD is written to be directly actionable by a small student development team: it specifies architecture, data ownership (on-chain vs off-chain), smart contract responsibilities, security posture, identity/Sybil handling, treasury governance limits, testing strategy, a zero-cost technology mapping, a demo script, and a professor viva preparation guide.

## 3. Problem Statement

Traditional college club management depends on centralized databases and administrators, which creates the following recurring problems:

| Problem | Description | Root Cause |
|---|---|---|
| Election/voting transparency | Members cannot independently verify vote counts or that votes weren't altered | Single controlling database, no public audit trail |
| Treasury transparency | Spending approvals are informal or undocumented | No enforced approval workflow |
| Governance/proposal transparency | Decisions may be made without a verifiable process | No immutable proposal/vote record |
| Attendance/record manipulation | Records can be edited after the fact with no detection | No tamper-evidence mechanism |
| Centralized trust dependency | Members must trust whoever controls the admin panel | Single point of control and failure |

None of these problems are solved by "a better database" alone, because a better database is still controlled by one party. They also aren't solved by "put everything on a blockchain," because most club data (profiles, event descriptions, contact info) is not trust-sensitive and does not need a public, immutable, gas-costing ledger. The correct architecture is **selective**: use blockchain only where independent verifiability and tamper-evidence materially matter.

## 4. Background

This project originates from the existing Campus DAO concept deck (`CampusDAO_Presentation_f1.pptx`), which frames the product as "Normal College Management + Blockchain-based Governance = Campus DAO." This PRD formalizes that concept into an implementation-ready specification, adds the identity/wallet-authorization mechanism needed to prevent one student from acting as many "voters," clarifies that real INR funds never move through smart contracts, and adds the security, testing, and academic-demonstration detail needed for a college capstone submission in an Indian institutional context.


## 5. Goals & Non-Goals

### Goals
- Provide a verifiable, tamper-evident voting system for club elections
- Provide a governance proposal system enforced by smart-contract rules rather than admin discretion
- Provide treasury *governance* (approval transparency), not treasury *custody* of real money
- Provide a tamper-evident verification mechanism for attendance/records without putting personal data on-chain
- Ensure only real, verified students can act as authorized voters, regardless of how many wallets they create
- Build the entire system at zero infrastructure cost using free tiers, open-source tools, and a public testnet
- Produce a system that is easy to demonstrate end-to-end to professors, including a defensible technical viva

### Non-Goals
- Building a new blockchain or consensus protocol
- Building a cryptocurrency, token-sale, or payment product
- Directly custodying or transferring real INR through smart contracts
- Guaranteeing that blockchain alone proves someone is a real, unique human (this requires the off-chain identity layer)
- Replacing the college's official financial systems (banking/UPI/accounts office)
- Building a fully decentralized, permissionless DAO with no institutional oversight (this is a **permissioned/institutional DAO**, not a public, anonymous one)
- Achieving mainnet-grade security auditing (out of scope for an academic MVP; explicitly called out as a limitation)

## 6. Target Users, Personas & Roles

### Target Users
- Verified college students who are club members
- Club officers/coordinators who run elections and propose actions
- Club treasurers who propose spending
- College/club administrators who oversee the system
- Faculty advisors / professors evaluating the project

### User Personas

| Persona | Description | Primary Needs |
|---|---|---|
| **Aditi — Club Member** | 2nd-year student, member of 2 clubs | Wants to vote in elections and see that her vote counted, without technical friction |
| **Rahul — Club President** | Runs the Coding Club, creates proposals | Wants proposal creation and voting to be simple, fast, and defensible to members |
| **Priya — Club Treasurer** | Manages club "budget requests" | Wants spending approvals to be visibly rule-based, not just her own decision |
| **Mr. Sharma — Faculty Advisor / Admin** | Oversees club activity, approves the verified-student roster | Wants oversight capability without being a single point of failure for every decision |
| **Dr. Iyer — Evaluating Professor** | Grades the capstone project | Wants to see genuine, defensible blockchain usage and understand its limits |

### User Roles

| Role | Capabilities |
|---|---|
| **Student (unverified)** | Can browse public club info; cannot vote or propose |
| **Student (verified, wallet-authorized)** | Can vote, view proposals, view treasury proposals, view verification proofs |
| **Club Officer** | All verified-student capabilities + create governance proposals |
| **Treasurer** | All verified-student capabilities + create treasury spending proposals |
| **College Admin** | Manages verified-student roster, revokes/re-authorizes wallets, configures election parameters, has **no unilateral power to alter vote/proposal outcomes** |
| **Smart Contract (system role)** | Enforces authorization, one-vote-per-election, thresholds, proposal state transitions — no human role can bypass these on-chain rules |

## 7. User Stories

- As a verified student, I want to vote once in my club's election so that my vote is counted exactly once and I can see the transaction that proves it.
- As a club officer, I want to create a governance proposal with a budget and description so that members can vote on it transparently.
- As a treasurer, I want to submit a spending request so that the club can approve or reject it by vote rather than by my sole decision.
- As a member, I want to independently verify that an attendance/event record hasn't been silently altered after the fact.
- As a college admin, I want to verify a student's identity once and link exactly one wallet to them, and be able to revoke a lost/compromised wallet and authorize a replacement.
- As a professor, I want to see exactly where blockchain is used, why, and what its limitations are, so I can evaluate the project's technical honesty.
- As a student with multiple MetaMask wallets, I should **not** be able to vote more than once, because only my one authorized wallet can perform governance actions.

## 8. Functional Requirements (Overview)

High-level functional capability list; each is expanded with full technical detail in its dedicated section (§10–§15).

| # | Capability | Section |
|---|---|---|
| FR1 | Student identity verification (institutional email/OTP against roster) | §10 |
| FR2 | MetaMask wallet linking & authorization to a verified student | §11 |
| FR3 | Wallet revocation & re-authorization (lost/compromised wallet) | §11 |
| FR4 | Club/event/profile management (off-chain) | §17 |
| FR5 | Election creation, candidate management, time-boxed voting | §12 |
| FR6 | Vote casting with on-chain enforcement of eligibility & one-vote rule | §12 |
| FR7 | Governance proposal creation, voting, threshold evaluation | §13 |
| FR8 | Treasury spending proposal creation, voting, approval recording | §14 |
| FR9 | Attendance/record hashing and later tamper-evidence verification | §15 |
| FR10 | Admin dashboard for roster & wallet management (no outcome override) | §21 |

## 9. System Architecture — Off-Chain, On-Chain, Hybrid

Campus DAO is a **hybrid dApp**. The guiding rule for what goes where:

> **Off-chain (Supabase):** anything that is normal application data — profiles, club info, events, non-sensitive records — where a single, revocable admin database is acceptable and cost-free.
> **On-chain (Solidity/testnet):** anything that is trust-sensitive, where independent verifiability and tamper-evidence matter more than storage cost — voting, governance proposal outcomes, treasury approval decisions, and record-verification proofs (hashes only, never raw personal data).

### Diagram 1 — Overall Architecture

```
                         ┌────────────────────────────┐
                         │        STUDENT (Browser)     │
                         └──────────────┬───────────────┘
                                        │
                          ┌─────────────▼──────────────┐
                          │   React + Vite + Tailwind    │
                          │        (Campus DAO UI)        │
                          └───────┬───────────────┬──────┘
                                  │               │
                 (normal data)    │               │  (trust-sensitive actions)
                                  ▼               ▼
                    ┌──────────────────┐   ┌───────────────────┐
                    │      Supabase      │   │      Ethers.js      │
                    │  Auth + Postgres   │   │  (blockchain bridge) │
                    │  Profiles / Clubs  │   └─────────┬──────────┘
                    │  Events / Off-chain│             │
                    │  Attendance detail │             ▼
                    └────────────────────┘   ┌───────────────────┐
                                              │      MetaMask       │
                                              │ Wallet + Tx Signing │
                                              └─────────┬──────────┘
                                                        │
                                                        ▼
                                         ┌────────────────────────────┐
                                         │   Solidity Smart Contracts   │
                                         │  Voting / Governance /       │
                                         │  Treasury / Membership /     │
                                         │  Verification                │
                                         └─────────────┬───────────────┘
                                                        │
                                                        ▼
                                         ┌────────────────────────────┐
                                         │  Ethereum-Compatible Testnet │
                                         │        (BLOCKCHAIN)          │
                                         └────────────────────────────┘
```

### Diagram 2 — Frontend → MetaMask → Ethers.js → Smart Contract → Blockchain

```
React Component (e.g. "Vote" button)
        │
        ▼
Ethers.js: contract.vote(candidateId)
        │
        ▼
MetaMask popup: "Confirm transaction?"
        │  (user approves)
        ▼
MetaMask signs tx with PRIVATE KEY (never leaves MetaMask)
        │
        ▼
Signed transaction broadcast to Ethereum-Compatible Testnet
        │
        ▼
Smart Contract executes: checks authorization → checks hasVoted → records vote
        │
        ▼
Testnet confirms block → Transaction Hash returned
        │
        ▼
Ethers.js listens for confirmation → React updates UI with tx hash + status
```

### Diagram 3 — Supabase vs Blockchain Data Division

```
 SUPABASE (off-chain, private/normal data)     BLOCKCHAIN (on-chain, trust-sensitive data)
 ─────────────────────────────────────────     ────────────────────────────────────────────
 • Student profile (name, program, photo)       • Authorized wallet address list
 • Club info, descriptions, media                • Vote records (wallet → candidate, no name)
 • Event listings & RSVPs                        • Proposal text hash + vote tallies
 • Detailed attendance rows                       • Proposal state transitions
 • College-verification status flag              • Treasury proposal approval records
 • Election metadata (title, description)         • Attendance/record verification hashes
 • OTP / session data                             • Transaction hashes (audit trail)
```

**Data-division rule of thumb:** if losing independent verifiability would let one party quietly rewrite history in a way that matters for trust (an election result, a governance decision, a spending approval, "was this record altered") → on-chain. If it's ordinary operational data with no dispute risk → off-chain.

### On-Chain / Off-Chain Boundary — Explicit Statement

We do **NOT** put on blockchain:
- Student names, emails, or personal identity information
- Passwords or session tokens
- Private keys (never touch the app at all — MetaMask-only)
- Full attendance detail (only a hash/proof reference goes on-chain)
- Club descriptions, event media, general content

We **DO** put on blockchain:
- Authorized-wallet ↔ eligibility mapping (wallet addresses only, not names)
- Vote casts and tallies
- Governance proposal hashes, states, and vote outcomes
- Treasury proposal approvals (governance decision, not fund custody)
- Verification hashes for records that need tamper-evidence


## 10. Authentication & Identity Verification

**Purpose:** Establish that a real, enrolled student — not an anonymous wallet — is behind every governance action, without assuming "any typed ID = verified."

**User:** Prospective voter/member (any student with institutional access)

**Preconditions:** College has provided (or the team has seeded, for demo purposes) an authorized student dataset (roll number ↔ institutional email) accessible to Supabase.

**Main flow:**
1. Student opens Campus DAO and selects "Register / Verify."
2. Student enters college roll number and institutional email.
3. Backend checks the entered roll number + email pair against the authorized student dataset (Supabase table, seeded from college records).
4. If matched, Supabase sends an OTP to the institutional email (Supabase Auth email OTP, or a free transactional-email provider's free tier).
5. Student enters OTP.
6. On success, Supabase creates/confirms the student's authenticated session and marks `is_verified = true` for that student record.
7. Student is redirected to "Connect Wallet" (§11).

**Background technical flow:**
```
Student → enters {roll_no, institutional_email}
        → Supabase Edge Function / RLS-checked query
        → SELECT * FROM authorized_students WHERE roll_no=? AND email=?
        → match found → Supabase Auth: send OTP to email
        → student submits OTP → Supabase Auth verifies OTP
        → students.is_verified = true, students.verified_at = now()
```

**Data stored off-chain (Supabase):** roll number, institutional email, name, program/year, verification status/timestamp, session/auth tokens.

**Data stored on-chain:** none at this stage. (The *outcome* of this step — "this wallet belongs to a verified student" — is what gets written on-chain in §11, not the identity data itself.)

**Smart contract interaction:** none directly; this step is a precondition for the wallet-authorization transaction in §11.

**Expected result:** Student has a verified Supabase account and can proceed to wallet linking.

**Failure cases:**
- Roll number/email not found in authorized dataset → registration rejected with a clear message ("not found in college records — contact admin").
- OTP expired/incorrect → re-send flow, rate-limited.
- Student already verified with a different session → prompt to log in instead of re-registering.

**Security considerations:** Rate-limit OTP requests to prevent spam/abuse of the free email tier; never accept an unverified "enter any ID" shortcut; store no passwords (OTP/magic-link only, via Supabase Auth); institutional email domain allow-list (e.g., only `@college.edu.in` addresses accepted) as a second check beyond roster matching.

**Acceptance criteria:**
- A roll number/email not present in the authorized dataset cannot reach `is_verified = true` under any input.
- OTP must be correct and unexpired to verify.
- A verified student's record is uniquely tied to one Supabase auth identity.

---

## 11. Wallet Integration & Authorization (incl. Sybil/Multi-Wallet Mitigation)

**Purpose:** Link exactly one MetaMask wallet address to one verified student and make the *smart contract itself* refuse to accept governance actions from any other wallet — this is what actually prevents "one student, many voters," not the impossibility of creating multiple wallets (which is not preventable).

**User:** Verified student (post-§10)

**Preconditions:** Student has completed identity verification (`is_verified = true`) and has MetaMask installed, connected to the correct testnet network.

**Main flow:**
1. Verified student clicks "Connect Wallet."
2. MetaMask prompts for connection approval; student approves.
3. Frontend reads the connected wallet address (e.g., `0x71AB…93C`).
4. Frontend asks the student to sign a one-time authorization message (`"Authorize wallet for Campus DAO — student_id: <id>, nonce: <n>"`) with MetaMask — this proves *control* of the wallet's private key without ever exposing the key.
5. Frontend sends `{student_id (server-side session), wallet_address, signature}` to the backend/contract call.
6. An authorized admin-controlled function (or a Supabase Edge Function acting as a relayer, or the student's own transaction, depending on design — see note below) calls `MembershipContract.authorizeWallet(wallet_address)` on-chain, gated so it can only be called once per verified `student_id` and only for a wallet that isn't already authorized to a different student.
7. Smart contract stores `authorizedWallet[wallet_address] = true` and emits `WalletAuthorized(wallet_address, studentIdHash)`.
8. Supabase records `students.wallet_address = wallet_address` and `students.wallet_authorized_at = now()`.

> **Design note on who submits the on-chain authorization transaction:** for a zero-cost academic build, the simplest defensible pattern is that a small **admin-controlled allow-listing function** (`onlyAdmin`) performs the authorization after off-chain identity verification succeeds — because the smart contract has no way to independently verify "this wallet belongs to a real student" (that trust must come from §10). This is stated explicitly as a designed trust boundary, not hidden.

**Background technical flow:**
```
MetaMask.connect() → address obtained
        → student signs authorization message (personal_sign)
        → frontend verifies signature client-side (sanity check)
        → backend verifies: student.is_verified == true AND student has no prior wallet
        → Ethers.js calls MembershipContract.authorizeWallet(address) [onlyAdmin/relayer]
        → contract: require(!walletTaken[address]); require(!studentAlreadyHasWallet[studentIdHash])
        → authorizedWallet[address] = true
        → emit WalletAuthorized(address, studentIdHash)
```

**Data stored off-chain:** wallet address (linked to student record), authorization timestamp, signature (audit log only).

**Data stored on-chain:** `authorizedWallet[address] → bool`, a **hashed/pseudonymous student identifier** (never the raw name/email) mapped to the wallet for uniqueness checks, wallet-authorization event log.

**Smart contract interaction:** `MembershipContract.authorizeWallet(address, studentIdHash)`, `MembershipContract.isAuthorized(address) → bool` (read by Voting/Governance/Treasury contracts).

**Expected result:** Exactly one wallet is authorized per verified student; the contract can now gate all governance functions with `require(membership.isAuthorized(msg.sender))`.

**Failure cases:**
- Student is not verified → authorization call reverts.
- Wallet address already authorized to a different student → reverts (`WalletAlreadyLinked`).
- Student already has an authorized wallet and tries to add a second one directly → reverts; must go through **wallet replacement flow** below.

**Wallet Replacement / Recovery Flow (lost or compromised wallet):**
1. Student re-verifies identity (§10 OTP flow again) — proves it's really them, not an attacker.
2. Student (or admin, if wallet is fully inaccessible) requests wallet replacement.
3. `MembershipContract.revokeWallet(oldAddress)` → `authorizedWallet[oldAddress] = false`, and — critically — **any election the student already voted in stays voted** (the *studentIdHash* "has voted in election X" flag is independent of wallet address, so revoking/replacing a wallet cannot be used to vote twice in the same election).
4. `MembershipContract.authorizeWallet(newAddress, studentIdHash)` links the new wallet.
5. Old wallet immediately loses all governance permissions.

**Security considerations (Sybil / multi-wallet honesty):**
- **Blockchain cannot prevent a student from creating 10 MetaMask wallets.** What Campus DAO prevents is those 10 wallets from becoming 10 eligible voters — only the one wallet explicitly authorized by the verified-identity flow can pass `isAuthorized()`.
- Vote/proposal "has acted" flags are keyed to the **studentIdHash**, not the wallet address, specifically so wallet replacement cannot be exploited to double-vote in an election that's already in progress.
- Admin-gated authorization is itself a trust boundary — documented as a limitation (§32), with the mitigation that admin actions are logged and, ideally for future work, require multi-admin/multi-sig approval rather than a single admin key.

**Acceptance criteria:**
- A wallet cannot be authorized unless the linked student passed §10 verification.
- No wallet address can be linked to more than one student.
- No student can have more than one *currently active* authorized wallet at a time.
- Revoking a wallet and authorizing a replacement cannot reset an already-cast vote for an in-progress election.


## 12. Voting System

**Purpose:** Run a club election where only authorized wallets can vote, each exactly once, with an independently verifiable result.

**User:** Verified, wallet-authorized student (voter); club officer/admin (election creator).

**Preconditions:** Election exists on-chain with candidates and a start/end time; voter's wallet is authorized (§11).

**Main flow:**
1. Officer/admin creates an election off-chain (title, description) and on-chain (`VotingContract.createElection(startTime, endTime, candidateList)`).
2. Student browses to the election page; frontend reads live candidate list and election status from the contract.
3. Student selects a candidate and clicks **Vote**.
4. Ethers.js calls `VotingContract.vote(electionId, candidateId)`.
5. MetaMask opens; student reviews and approves the transaction.
6. MetaMask signs the transaction with the private key (key never leaves MetaMask).
7. Signed transaction is broadcast to the testnet.
8. Smart contract executes: checks (a) wallet is authorized, (b) election is currently active, (c) `hasVoted[electionId][studentIdHash] == false`.
9. If all checks pass: `votes[electionId][candidateId] += 1`; `hasVoted[electionId][studentIdHash] = true`; emits `VoteCast(electionId, candidateId, walletAddress)`.
10. Testnet confirms the block; a transaction hash is returned.
11. Frontend displays the transaction hash and a "vote confirmed" state; result tallies update live (readable by anyone, since contract state is public).

**Background technical flow (diagram — Voting Lifecycle):**
```
CREATE ELECTION (admin/officer)
        │
        ▼
ELECTION ACTIVE (startTime ≤ now ≤ endTime)
        │
        ▼
Student selects candidate → clicks "Vote"
        │
        ▼
React → Ethers.js → contract.vote(electionId, candidateId)
        │
        ▼
MetaMask opens → student approves → tx signed
        │
        ▼
Tx broadcast → Testnet
        │
        ▼
Smart Contract checks:
  ✓ isAuthorized(msg.sender)?
  ✓ election.active?
  ✓ !hasVoted[electionId][studentIdHash]?
        │  (any check fails → revert, no state change, "already voted"/"not authorized"/"election closed")
        ▼  (all pass)
votes[candidateId]++ ; hasVoted = true
        │
        ▼
emit VoteCast(...) → Tx Hash generated
        │
        ▼
Frontend shows confirmation + Tx Hash
        │
        ▼
ELECTION CLOSED (now > endTime) → results final & publicly readable
```

**Data stored off-chain:** election title/description/banner, candidate bios/photos, election metadata for display.

**Data stored on-chain:** election id/start/end time, candidate ids, vote tallies per candidate, `hasVoted` mapping (keyed by studentIdHash), transaction/event log.

**Smart contract interaction:** `createElection()`, `vote(electionId, candidateId)`, `getResults(electionId)`, `hasVoted(electionId, studentIdHash) → bool`, all gated through `MembershipContract.isAuthorized()`.

**Expected result:** A publicly verifiable, tamper-evident tally where each authorized student contributed at most one vote.

**Failure cases:**
- Unauthorized wallet calls `vote()` → revert `NotAuthorized`.
- Wallet already voted (via studentIdHash) → revert `AlreadyVoted`.
- Election not yet started or already ended → revert `ElectionNotActive`.
- MetaMask transaction rejected by user → no state change, frontend shows "cancelled."
- Insufficient testnet ETH for gas → frontend shows a clear "get testnet ETH from the faucet" message with a faucet link.

**Security considerations:** Re-entrancy is low-risk here (no external calls/value transfer in `vote()`), but checks-effects-interactions ordering is still followed; `hasVoted` keyed to studentIdHash (not wallet) prevents the wallet-replacement double-vote described in §11; election time bounds enforced on-chain, not just in the UI, since a modified frontend cannot bypass a contract-level `require`.

**Acceptance criteria:**
- An unauthorized address can never successfully cast a vote.
- No studentIdHash can be recorded as having voted more than once in the same election.
- Vote tallies visible on-chain match the sum of `VoteCast` events.
- Voting cannot succeed outside the election's start/end window.

---

## 13. DAO Governance / Proposal System

**Purpose:** Let officers/members propose club actions (e.g., "conduct a hackathon") and have the outcome decided by an enforced voting/threshold process rather than officer discretion.

**User:** Club officer (proposer); verified members (voters).

**Preconditions:** Proposer's wallet is authorized; proposer holds the "officer" role required to create proposals (role check, not just membership).

**Main flow:**
1. Officer fills a proposal form (title, description, category, requested budget if applicable) in the UI.
2. Frontend computes a hash of the proposal text/metadata (e.g., keccak256 of the JSON) and stores the full text off-chain in Supabase.
3. Ethers.js calls `GovernanceContract.createProposal(proposalHash, votingPeriod)`.
4. MetaMask signs and submits; contract stores the proposal in `Draft → Active` state and starts the voting window.
5. Members browse to the proposal (full text fetched from Supabase, verified against the on-chain hash) and cast `yes`/`no` votes via `GovernanceContract.voteOnProposal(proposalId, support)`.
6. Contract enforces one vote per authorized studentIdHash per proposal.
7. When the voting period ends (or quorum/threshold is met early, per contract design), anyone can call `finalizeProposal(proposalId)`, which evaluates yes/no totals against the configured approval threshold and sets state to `Passed` or `Rejected`.
8. If `Passed` and the proposal has downstream action (e.g., a treasury request), it becomes eligible for §14's execution flow; otherwise it moves to `Executed/Closed` once the officer marks real-world completion (off-chain status update).

**Background technical flow (diagram — Proposal Lifecycle):**
```
DRAFT (off-chain form filled)
   │  createProposal(hash, votingPeriod)
   ▼
ACTIVE (on-chain, voting window open)
   │  members vote: voteOnProposal(id, yes/no)
   ▼
VOTING (accumulating yes/no tallies; hasVoted[proposalId][studentIdHash] enforced)
   │  window ends → finalizeProposal(id)
   ▼
 ┌────────────┴────────────┐
 ▼                          ▼
PASSED                  REJECTED
 │  (if budget-linked → §14 Treasury flow)
 ▼
EXECUTED / CLOSED (officer marks real-world completion off-chain)
```

**Data stored off-chain:** full proposal text/description, category, attachments, discussion/comments, execution status notes.

**Data stored on-chain:** proposal hash, proposer's studentIdHash, voting period start/end, yes/no tallies, `hasVoted` mapping, final state (`Draft/Active/Passed/Rejected/Executed`).

**Smart contract interaction:** `createProposal()`, `voteOnProposal()`, `finalizeProposal()`, `getProposalState()`, all gated by `MembershipContract.isAuthorized()` plus an officer-role check for creation.

**Expected result:** A publicly auditable record of what was proposed (via hash-matching to the off-chain text), who could vote, how they voted in aggregate, and whether it passed according to fixed, inspectable rules.

**Failure cases:**
- Non-officer attempts `createProposal()` → revert `NotAuthorizedRole`.
- Voting after the window closes → revert `VotingClosed`.
- Double vote attempt → revert `AlreadyVoted`.
- Off-chain text is edited after creation → hash mismatch is detectable by anyone recomputing the hash, flagging tampering (§15's verification pattern applied here too).

**Security considerations:** Approval threshold and quorum are contract constants/config, not adjustable by a single admin after deployment (or if adjustable, gated behind a documented multi-step/admin-role process, not silent); proposal hash-binding prevents "bait and switch" proposal text edits.

**Acceptance criteria:**
- A proposal's on-chain hash always matches its currently displayed off-chain text, or the UI visibly flags a mismatch.
- Only wallets with the officer role can create proposals.
- Final state (`Passed`/`Rejected`) is deterministic from the recorded on-chain tallies and threshold — reproducible by any observer.

---

## 14. Treasury Governance

**Purpose:** Make spending *approval* transparent and rule-based — explicitly **without** claiming the smart contract holds or moves real Indian Rupees.

> **Critical clarification, restated for this section:** REAL INR FUNDS ≠ BLOCKCHAIN DEMO TREASURY. The actual money for "₹15,000 for a hackathon" stays in the college's existing banking/UPI/accounts process. The smart contract only produces a verifiable **governance decision** ("this spend was proposed, voted on, and approved under club rules") that the college's real finance process can then act on.

**User:** Treasurer/officer (proposer); verified members (voters); college finance office (real-world executor, outside the system).

**Preconditions:** Same as §13 (authorized wallet, officer/treasurer role for proposal creation).

**Main flow:**
1. Treasurer creates a spending proposal: description + INR amount requested (e.g., "₹15,000 for Hackathon 2026"), stored off-chain; a hash + the amount (as a plain on-chain uint, since the number itself isn't sensitive) is written on-chain via `TreasuryContract.createSpendingProposal(proposalHash, amountINR)`.
2. Members vote exactly as in §13.
3. On finalization, if passed, contract sets state `Approved` and emits `SpendingApproved(proposalId, amountINR, proposerHash)` — **this event is the "proof of governance approval," not a fund transfer.**
4. (Optional, for the blockchain demonstration only) A **simulated/demo treasury** using free testnet ETH or a free demo ERC-20 token can show a symbolic "release of demo funds" via `TreasuryContract.releaseDemoFunds(proposalId)`, clearly labeled in the UI as a **simulation**, not real money movement.
5. Separately and off-chain, the college's actual finance office processes the real INR payment through its existing process (bank transfer/UPI/accounts office). The payment reference/status can optionally be recorded back into Supabase (`treasury_requests.payment_status`, `payment_reference`) for record-keeping — this is off-chain by design, since it involves real banking data.

**Background technical flow (diagram — Treasury Governance Lifecycle):**
```
Treasurer creates spending proposal (₹ amount, description)
        │
        ▼
Members vote (same mechanism as §13)
        │
        ▼
finalizeProposal() → threshold check
        │
   ┌────┴─────┐
   ▼           ▼
APPROVED     REJECTED
   │
   ▼
emit SpendingApproved(...)  ← ON-CHAIN GOVERNANCE PROOF ONLY
   │
   ├──► (optional demo) release demo/testnet tokens — LABELED "SIMULATION"
   │
   ▼
Real INR payment processed by college finance office — OFF-CHAIN, OUTSIDE SMART CONTRACT
   │
   ▼
payment_status/reference recorded in Supabase (off-chain audit note)
```

**Data stored off-chain:** full spending justification, vendor/recipient details, actual payment status/reference/receipts (all real-money-adjacent data, intentionally off-chain).

**Data stored on-chain:** spending proposal hash, requested amount (as a number, for transparency), vote tallies, approval state, optional demo-token release event.

**Smart contract interaction:** `createSpendingProposal()`, `voteOnProposal()` (shared with governance), `finalizeProposal()`, optional `releaseDemoFunds()` clearly scoped to demo/testnet assets only.

**Expected result:** An independently verifiable record that a spend was approved under club voting rules — without ever claiming custody of real money.

**Failure cases:**
- Proposal exceeds a configured max-amount-per-proposal safety constant → contract can optionally reject or flag for additional review (design choice, documented).
- Attempt to call `releaseDemoFunds()` on a non-approved proposal → revert.
- Confusion risk: UI must **always** visually distinguish "on-chain governance approval" from "real payment sent" — treated as a security/trust requirement, not just a UX nicety.

**Security considerations:** No smart contract function should ever be named/labeled in a way that implies real fund custody; treasury abuse (a treasurer proposing spends to themselves) is mitigated by requiring member voting + threshold for every spend, with no direct "treasurer-only execute" path; demo-token balance is capped and clearly synthetic.

**Acceptance criteria:**
- No code path in the system transfers real INR.
- Every "approved" spending decision has a corresponding on-chain vote record meeting the threshold.
- The UI never displays a demo/testnet token balance in a way that could be mistaken for real currency.

---

## 15. Attendance / Record Verification

**Purpose:** Make records (e.g., event attendance) tamper-evident after issuance, without putting personal/sensitive data on a public blockchain, and **without overstating what this proves.**

**User:** Event organizer (issuer); any member/admin (later verifier).

**Preconditions:** An event/attendance record has been created off-chain (Supabase) at issuance time.

**Main flow (issuing a record):**
1. Organizer marks attendance for an event: `{student_id, event_id, timestamp, status}` rows stored in Supabase.
2. At issuance, the backend computes `hash = keccak256(canonicalJSON(record_set))` for the finalized attendance batch.
3. `VerificationContract.storeProof(recordSetId, hash)` writes the hash (and only the hash) on-chain.
4. Contract emits `ProofStored(recordSetId, hash, timestamp)`.

**Main flow (verifying a record later):**
1. Anyone (member, admin, auditor) requests verification for a record set.
2. Backend recomputes `currentHash = keccak256(canonicalJSON(current_record_set))` from the **current** Supabase data.
3. Frontend reads the originally stored `storedHash` from `VerificationContract.getProof(recordSetId)`.
4. Compare `currentHash == storedHash`:
   - **Match** → "Record unchanged since issuance ✓"
   - **Different** → "Possible modification detected ⚠" (flag for manual review — does not itself say *what* changed or *who* changed it, only *that* the current data no longer matches what was originally committed).

**Background technical flow (diagram — Attendance Hash Verification):**
```
ISSUANCE:
Attendance rows (Supabase) → canonicalize → keccak256 → hash
        → VerificationContract.storeProof(recordSetId, hash)
        → emit ProofStored(...)

LATER VERIFICATION:
Current Supabase rows → canonicalize → keccak256 → currentHash
        → read storedHash from VerificationContract.getProof(recordSetId)
        → compare currentHash vs storedHash
              MATCH     → "Record unchanged ✓"
              MISMATCH  → "Possible modification ⚠"
```

**Data stored off-chain:** full attendance rows (student, event, timestamp, status — this is the sensitive data, correctly kept off public chain).

**Data stored on-chain:** only the hash/proof and a non-identifying `recordSetId`, plus the issuance timestamp.

**Smart contract interaction:** `storeProof(recordSetId, hash)` (issuer-role gated), `getProof(recordSetId) → hash`.

**Expected result:** Anyone can detect *whether* a record has changed since issuance, without the blockchain ever holding personal data.

**Failure cases:**
- Hash mismatch → flagged, but system correctly does **not** claim to know which field changed or why (that requires off-chain investigation/logs).
- Attempt to `storeProof()` twice for the same `recordSetId` → revert (`ProofAlreadyExists`) to preserve the "first committed version" guarantee, or explicitly versioned (`recordSetId_v2`) if legitimate re-issuance is needed — documented design choice.

**Security considerations & honest limitation (stated explicitly, per requirement):** *Blockchain does not prove the original attendance data was truthful — it only proves the data hasn't silently changed since the hash was committed.* If the organizer marks a student present who wasn't there, the hash will faithfully "verify" that false record forever. Attendance still needs a trusted issuance mechanism (e.g., organizer accountability, cross-checks) — this is a governance/process control, not something blockchain can supply.

**Acceptance criteria:**
- Any single-byte change to the underlying record set changes the computed hash and is detected on next verification.
- The on-chain proof never contains raw student-identifying data.
- The system's UI/documentation never claims the hash proves the original record was accurate — only that it's unchanged since issuance.


## 16. Smart Contract Architecture & Modules

**Design reasoning:** rather than one monolithic contract or an over-fragmented set of many tiny contracts, Campus DAO uses **five focused modules** that mirror the five trust-sensitive domains identified above. This keeps each contract auditable and testable in isolation, while `MembershipContract` acts as the shared authorization source-of-truth that the others read from — avoiding duplicated authorization logic (and duplicated bugs) across contracts.

| Contract | Responsibility |
|---|---|
| `MembershipContract` | Wallet ↔ studentIdHash authorization, revocation/replacement, role flags (officer/treasurer/admin) |
| `VotingContract` | Election creation, candidate management, vote casting, results |
| `GovernanceContract` | Proposal creation, proposal voting, threshold evaluation, state machine |
| `TreasuryContract` | Spending proposal creation (extends/reuses `GovernanceContract` voting), approval events, optional demo-fund simulation |
| `VerificationContract` | Storing and reading record-verification hashes |

`VotingContract`, `GovernanceContract`, and `TreasuryContract` all call `MembershipContract.isAuthorized(msg.sender)` and `MembershipContract.roleOf(msg.sender)` rather than re-implementing authorization — this is the single most important architectural decision for both security and auditability.

### High-Level Solidity Interfaces (pseudocode — not full implementation)

```solidity
interface IMembershipContract {
    function authorizeWallet(address wallet, bytes32 studentIdHash) external; // onlyAdmin
    function revokeWallet(address wallet) external;                          // onlyAdmin
    function isAuthorized(address wallet) external view returns (bool);
    function studentIdOf(address wallet) external view returns (bytes32);
    function roleOf(address wallet) external view returns (Role);            // Member/Officer/Treasurer/Admin
}

interface IVotingContract {
    function createElection(uint256 start, uint256 end, uint256[] calldata candidateIds) external; // onlyOfficerOrAdmin
    function vote(uint256 electionId, uint256 candidateId) external;
    function hasVoted(uint256 electionId, bytes32 studentIdHash) external view returns (bool);
    function results(uint256 electionId) external view returns (uint256[] memory tallies);
}

interface IGovernanceContract {
    function createProposal(bytes32 proposalHash, uint256 votingPeriod) external; // onlyOfficer
    function voteOnProposal(uint256 proposalId, bool support) external;
    function finalizeProposal(uint256 proposalId) external;
    function getProposalState(uint256 proposalId) external view returns (State);
}

interface ITreasuryContract {
    function createSpendingProposal(bytes32 proposalHash, uint256 amountINR) external; // onlyTreasurerOrOfficer
    // voting reuses GovernanceContract mechanics via composition or shared base
    function releaseDemoFunds(uint256 proposalId) external; // demo/testnet-only, clearly scoped
}

interface IVerificationContract {
    function storeProof(bytes32 recordSetId, bytes32 hash) external; // onlyIssuerRole
    function getProof(bytes32 recordSetId) external view returns (bytes32 hash, uint256 timestamp);
}
```

**Key contract-level invariants enforced everywhere:**
- Every state-changing function that represents a governance action starts with `require(membership.isAuthorized(msg.sender), "NotAuthorized");`
- Every "vote" style action checks and sets a `hasVoted` flag keyed by `studentIdHash`, never by raw wallet address, before any state mutation (checks-effects-interactions).
- No function transfers real currency; only `TreasuryContract.releaseDemoFunds()` moves demo/testnet assets, and it is explicitly separate from the approval-recording function.

## 17. Database Requirements & Schema (Supabase)

**Core tables (Postgres via Supabase):**

```
authorized_students        -- pre-seeded roster from college records
  roll_no (PK), full_name, institutional_email, program, year

students
  id (PK), auth_uid (FK → Supabase auth.users), roll_no (FK), is_verified,
  verified_at, wallet_address, wallet_authorized_at, role (member/officer/treasurer/admin)

clubs
  id (PK), name, description, banner_url, created_by

club_members
  club_id (FK), student_id (FK), role_in_club

events
  id (PK), club_id (FK), title, description, event_date, location

attendance
  id (PK), event_id (FK), student_id (FK), timestamp, status, record_set_id

record_sets
  id (PK), event_id (FK), on_chain_hash, issued_at, verification_contract_ref

elections
  id (PK), club_id (FK), title, description, on_chain_election_id, start_time, end_time

candidates
  id (PK), election_id (FK), student_id (FK, nullable if external candidate), bio, photo_url

proposals
  id (PK), club_id (FK), proposer_id (FK), title, description, category,
  on_chain_proposal_id, on_chain_hash, type (governance/treasury), amount_inr (nullable)

treasury_requests
  proposal_id (FK), payment_status, payment_reference, executed_at
```

**Row-Level Security (RLS):** enabled on all tables; students can read public club/event/proposal data, but can only read/write their own `students` row and cannot self-elevate `role` or `is_verified` (only service-role/admin functions can). This is a Supabase free-tier feature, at no additional cost.

## 18. API / Frontend-to-Blockchain Interaction

| Layer | Responsibility |
|---|---|
| React components | UI state, form handling, calling Supabase client SDK and Ethers.js |
| Supabase client SDK | Auth (OTP), CRUD on off-chain tables, RLS-enforced |
| Ethers.js `Contract` instances | Typed read/write calls to each deployed contract using ABI + address |
| MetaMask (`window.ethereum`) | Wallet connection, network switching prompt, transaction signing |
| Testnet RPC (public, free) | Broadcasts signed transactions, returns confirmations/events |

Ethers.js is used for **both** read calls (`contract.results(electionId)` — free, no gas, via `.call()`/view functions) and write calls (`contract.vote(...)` — costs testnet gas, requires MetaMask signature). The frontend always distinguishes these in the UI (read = instant; write = "confirm in MetaMask" + pending state).

## 19. Transaction Lifecycle

```
1. User Action (e.g., click "Vote")
2. Frontend builds calldata via Ethers.js contract interface
3. Ethers.js requests signature from MetaMask (eth_sendTransaction)
4. MetaMask shows gas estimate (in free testnet ETH) + calldata summary
5. User confirms → MetaMask signs with private key locally
6. Signed tx broadcast to testnet RPC endpoint
7. Tx enters mempool → picked up by testnet validator/miner
8. Tx included in a block → contract code executes
9. Event(s) emitted; state updated
10. Frontend (via Ethers.js provider.waitForTransaction) detects confirmation
11. Frontend displays: tx hash, block number, status (success/reverted), and a block-explorer link (e.g., Etherscan testnet explorer)
```

Reverted transactions (e.g., "already voted") still consume a small amount of gas but change no contract state — the frontend surfaces the revert reason string directly from the failed transaction receipt.


## 20. Security Requirements, Threat Model & Attack Scenarios

### Security Requirements
- Private keys never touch React, Supabase, or any backend — MetaMask-only, by construction (this is a property of the architecture, not just a policy).
- All governance functions gated by `MembershipContract.isAuthorized()`.
- All "has acted" flags keyed by `studentIdHash`, not wallet address.
- Supabase RLS prevents students from editing their own `role`, `is_verified`, or `wallet_address` fields directly.
- Admin actions (wallet authorization/revocation) are logged (on-chain events + off-chain audit table).
- No contract function claims or performs custody of real INR.

### Threat Model & Attack Scenarios

| # | Attack Scenario | Mitigation | Residual Risk (honest) |
|---|---|---|---|
| 1 | **Sybil attack** — student creates many wallets to vote many times | Only the one wallet linked via verified identity passes `isAuthorized()`; unauthorized wallets' votes always revert | Cannot stop wallet *creation*, only prevents those wallets from voting |
| 2 | **Replay / double voting** | `hasVoted[electionId][studentIdHash]` set before/atomic with vote count update; keyed to student, not wallet | None significant if contract logic is correct — covered by tests (§29) |
| 3 | **Wallet spoofing (impersonating another address)** | Impossible without the private key; MetaMask signature is cryptographically tied to the wallet | N/A — this is a core Ethereum security guarantee |
| 4 | **Wallet compromise (private key stolen)** | Student re-verifies identity → admin revokes compromised wallet → authorizes new one; stolen wallet immediately loses permissions | Window between compromise and revocation is a real risk; documented as a limitation |
| 5 | **Lost wallet (no compromise, just lost access)** | Same re-verification + revoke/re-authorize flow | Student must still prove identity via §10 to recover access |
| 6 | **Admin account compromise** | Admin actions logged/emitted as events (auditable); recommend (future work) multi-signature admin instead of single key | Single-admin-key model is a real, acknowledged limitation for the MVP |
| 7 | **Database manipulation (Supabase)** | Any trust-sensitive outcome (vote tallies, proposal states, treasury approvals, record hashes) lives on-chain, not just in Supabase — an admin editing Supabase cannot change on-chain results | Off-chain *display* data (e.g., candidate bio) could still be edited; doesn't affect vote integrity |
| 8 | **Frontend manipulation (malicious/modified client)** | All critical checks (`isAuthorized`, `hasVoted`, time windows, thresholds) enforced in the smart contract, not the UI — a modified frontend cannot bypass a `require()` | UI-only validation would be fully bypassable; this is why all such checks are duplicated on-chain |
| 9 | **Malicious proposal creation (spam/abuse)** | `onlyOfficer` role gate on `createProposal()`; officer roles assigned via admin-controlled `MembershipContract` | Relies on correct off-chain officer vetting process |
| 10 | **Treasury abuse (self-dealing spend requests)** | Every spend requires member vote + threshold; no direct treasurer-only execute path; demo funds are symbolic, not real money | Doesn't prevent a treasurer from *proposing* a bad-faith request — only prevents unilateral approval |
| 11 | **Fake attendance (issuer records false data)** | Not preventable by hashing — explicitly documented; hash only proves *no change since issuance*, not truthfulness at issuance | Requires organizer accountability / process controls, a known and stated limitation |
| 12 | **Reentrancy** | None of the MVP functions send value/ETH out during vote/proposal flows (state changes precede any external calls); `releaseDemoFunds()` (if implemented) follows checks-effects-interactions and reentrancy-guard pattern | Reentrancy risk is concentrated in the one function that moves demo assets; flagged for extra test coverage |
| 13 | **Oracle / trusted-input problem** | The system is explicit that off-chain-to-on-chain data (identity verification, attendance issuance) always requires a trusted party (admin/organizer) — blockchain doesn't remove this trust requirement, only makes the *result* tamper-evident afterward | Fundamental limitation of all hybrid dApps, stated rather than hidden |
| 14 | **Unauthorized access to admin functions** | `onlyAdmin`/`onlyOfficer` Solidity modifiers checked on-chain; Supabase RLS mirrors role checks off-chain | Standard access-control risk if admin key is mismanaged (see #6) |

## 21. Admin Permissions & Role-Based Access Control

| Role | On-chain permissions | Off-chain (Supabase) permissions | Cannot do |
|---|---|---|---|
| Admin | Authorize/revoke wallets, assign officer/treasurer roles, create elections (or delegate) | Manage authorized_students roster, view audit logs | Cannot change vote tallies, cannot override proposal outcomes, cannot move real funds |
| Officer | Create elections/proposals (if granted) | Manage club/event content | Cannot authorize wallets, cannot bypass one-vote rule |
| Treasurer | Create spending proposals | Update payment_status/reference after real payment | Cannot unilaterally approve/execute a spend |
| Member | Vote, view all public governance data | Update own profile (non-privileged fields) | Cannot vote twice, cannot self-assign roles |

**Design principle:** the smart contract's `onlyAdmin` is powerful for *provisioning* (who gets to participate) but deliberately has **no function that can alter a recorded vote, proposal outcome, or verification hash** — admin power is scoped to gatekeeping, not to outcomes.


## 22. Error Handling & Edge Cases

**General error-handling principles:** every on-chain `require`/`revert` has a descriptive reason string; the frontend maps known revert reasons to plain-language messages; unknown/unexpected errors fall back to a generic "transaction failed — see details" with the raw error available for debugging.

| Scenario | Handling |
|---|---|
| MetaMask not installed | UI detects `window.ethereum` absence, shows install prompt/link |
| Wrong network selected in MetaMask | UI detects chain ID mismatch, prompts `wallet_switchEthereumChain` to the correct testnet |
| Insufficient testnet ETH for gas | UI shows balance + faucet link before allowing the transaction attempt |
| User rejects MetaMask prompt | No state change; UI shows "cancelled by user," allows retry |
| Network congestion / slow confirmation | UI shows "pending" state with the tx hash and a link to check status on the block explorer |
| Election exists but hasn't started | Vote button disabled with a countdown to `startTime` |
| Election ended, results not yet finalized (governance/treasury proposals) | UI shows "awaiting finalization," allows anyone to trigger `finalizeProposal()` |
| Duplicate vote attempt (e.g., double-click) | Frontend disables the button after first click; contract-level `hasVoted` check is the real safeguard regardless |
| Wallet already linked to another student | `authorizeWallet()` reverts; UI explains a wallet can only belong to one student |
| Verified student loses access to institutional email (edge case) | Manual admin-assisted recovery process (documented, outside pure self-service flow) |
| Off-chain proposal text edited after on-chain hash was committed | Frontend recomputes hash on every view and flags mismatch prominently |
| RPC/testnet outage (public infra) | UI shows a clear "blockchain network unavailable, please retry" state; off-chain features (browsing clubs/events) remain functional since they don't depend on the chain |

## 23. Data Models

### Off-Chain (Supabase) — summarized from §17 schema
Relational tables: `authorized_students`, `students`, `clubs`, `club_members`, `events`, `attendance`, `record_sets`, `elections`, `candidates`, `proposals`, `treasury_requests`.

### On-Chain (Solidity structs — pseudocode)

```solidity
struct Election {
    uint256 id;
    uint256 startTime;
    uint256 endTime;
    uint256[] candidateIds;
    mapping(uint256 => uint256) tallies;       // candidateId => votes
    mapping(bytes32 => bool) hasVoted;         // studentIdHash => voted?
}

struct Proposal {
    uint256 id;
    bytes32 contentHash;
    bytes32 proposerId;                        // studentIdHash
    uint256 votingStart;
    uint256 votingEnd;
    uint256 yesVotes;
    uint256 noVotes;
    mapping(bytes32 => bool) hasVoted;
    ProposalState state;                       // Draft/Active/Passed/Rejected/Executed
    uint256 amountINR;                         // 0 if not a treasury proposal
}

struct WalletRecord {
    address wallet;
    bytes32 studentIdHash;
    Role role;                                 // Member/Officer/Treasurer/Admin
    bool active;
}

struct VerificationProof {
    bytes32 recordSetId;
    bytes32 hash;
    uint256 issuedAt;
}
```

## 24. UI/UX Requirements, Main Screens & Navigation

### Main Screens
1. **Landing / About** — explains Campus DAO, no wallet required to view
2. **Register / Verify** — roll number + email + OTP (§10)
3. **Connect Wallet** — MetaMask connect + authorization message signing (§11)
4. **Dashboard** — student's clubs, upcoming elections, open proposals
5. **Club Page** — club info, members, events, elections, proposals for that club
6. **Election Page** — candidates, live tally (post-close), vote button, tx status
7. **Proposal Page** — description, hash-verification indicator, yes/no vote, tally
8. **Treasury Request Page** — amount requested, description, vote, approval status, payment status (off-chain, clearly separated section)
9. **Verification Page** — search a record set, see match/mismatch result
10. **Admin Dashboard** — roster management, wallet authorize/revoke, role assignment, audit log
11. **Transaction History** — all of the student's own past transactions with hashes/links to explorer

### Navigation Flow
```
Landing → Register/Verify → Connect Wallet → Dashboard
                                                 │
                    ┌────────────────────────────┼────────────────────────┐
                    ▼                            ▼                        ▼
              Club Page                   Election Page             Proposal Page
                    │                            │                        │
                    ▼                            ▼                        ▼
              Events / Members            Vote → MetaMask →         Vote → MetaMask →
                                           Tx Confirmation           Tx Confirmation
```

### UI/UX Requirements
- Every on-chain action (vote, propose) must show a clear "this requires a MetaMask confirmation and testnet gas" notice before the click, so students aren't surprised.
- Every completed on-chain action displays its transaction hash with a copy button and a block-explorer link.
- Demo/testnet assets and real INR amounts must be visually distinct at all times (different color/badge, e.g., a "TESTNET DEMO" tag).
- Verification results (match/mismatch) use unambiguous icons/colors (✓ green / ⚠ amber), never silently hidden.

## 25. End-to-End User Flows & Blockchain Transaction Flows

Covered in full detail per-feature in §10–§15 diagrams. The complete combined flow is repeated in §35 (Academic Demonstration Script) and summarized in §37 (Final Summary).


## 26. Technology Stack & Rationale (Zero-Cost Mapping)

| Layer | Technology | Cost Status | Why Selected | Future Production Cost |
|---|---|---|---|---|
| Frontend framework | React + Vite | FREE / OPEN SOURCE | Fast dev server, large ecosystem, standard for dApp frontends | None (client-side, static hosting) |
| Styling | Tailwind CSS | FREE / OPEN SOURCE | Rapid, consistent UI without custom CSS overhead | None |
| Auth + off-chain DB | Supabase | FREE TIER | Postgres + Auth (incl. email OTP) + RLS, generous free tier, no server to manage | Paid tier if usage/storage exceeds free limits at scale |
| Frontend hosting | Netlify (or Vercel) | FREE TIER | Zero-cost static hosting with CI from GitHub | Paid tier for high bandwidth/team features |
| Smart contract language | Solidity | FREE / OPEN SOURCE | Standard, well-documented EVM smart contract language | None |
| Contract dev/test/deploy | Hardhat | FREE / OPEN SOURCE | Local EVM node, scripting, testing framework, plugin ecosystem | None |
| Prototyping (optional) | Remix IDE | FREE / OPEN SOURCE | Useful for quick learning/experiments; not the primary workflow | None |
| Blockchain bridge | Ethers.js | FREE / OPEN SOURCE | Standard library to connect React ↔ MetaMask ↔ contracts | None |
| Wallet | MetaMask | FREE | Browser extension wallet; user-controlled keys; industry standard | None |
| Blockchain network | Ethereum-compatible public **testnet** (e.g., Sepolia) | FREE / TESTNET | Real EVM semantics without real financial risk; free faucet ETH | Would require mainnet ETH (real cost) or an L2 if ever moved to production |
| Testnet ETH source | Public faucets | FREE | Provides gas for testing at zero cost | N/A (testnet-only concept) |
| Version control / CI | Git + GitHub | FREE (public/free-tier private repos) | Standard collaboration & deployment trigger for Netlify/Vercel | Paid tier only for advanced private-org features |
| IDE | VS Code | FREE / OPEN SOURCE | Standard development environment | None |

**Zero-cost summary:** every component used for development, testing, and demonstration is free, open-source, or a no-cost free tier. The only "cost" that would appear in a real production deployment is (a) Supabase/Netlify paid tiers at scale, and (b) real mainnet ETH or L2 gas fees if the system were ever moved off a testnet — both explicitly out of scope for this academic project.

## 27. Why Blockchain / Why Not Everything On-Chain / Why Testnet

**Why blockchain is necessary here:** the core problems (§3) are all *trust* problems — members need to verify outcomes without trusting a single administrator's database. A public, append-only ledger with contract-enforced rules gives independent verifiability that a centralized database structurally cannot, because in a centralized system the same party who could misuse it is also the only one able to prove they didn't.

**Why not everything on blockchain:** most application data (profiles, event descriptions, media, detailed attendance rows) is not trust-sensitive, is larger than efficient to store on-chain, and would expose personal data publicly and permanently if placed on a public ledger — none of which is acceptable. Blockchain is reserved for the specific decision points where independent verifiability matters (§9's data-division rule).

**Why an Ethereum-compatible testnet:**
- **What Ethereum is:** a decentralized, public blockchain platform that supports smart contracts (programs whose execution and state changes are enforced by the network itself).
- **What a testnet is:** a separate network that behaves identically to Ethereum mainnet (same EVM, same tools) but uses valueless test currency instead of real ETH.
- **Why used:** it lets the team build, deploy, and fully demonstrate real smart-contract behavior — including gas costs, transaction confirmation, and on-chain state — without any real financial risk or cost.
- **Why real ETH is not required:** testnet ETH from public faucets behaves identically for gas/transaction purposes but has no market value, making the entire project zero-cost.
- **Mainnet vs testnet:** mainnet is the live, real-value Ethereum network; a testnet is functionally identical for development/testing purposes but its assets are worthless outside the test network, and its state is not considered production-grade permanent (testnets can occasionally be reset by their maintainers).

## 28. Development Environment & Deployment Architecture

**Local development:**
- VS Code + Node.js + Hardhat local node for fast contract iteration before testnet deployment.
- React dev server (Vite) with a `.env` pointing to local Hardhat node initially, then to the public testnet RPC + deployed contract addresses.

**Deployment architecture:**
```
GitHub repo (frontend)  ──push──►  Netlify/Vercel CI  ──build/deploy──►  Static hosted frontend (FREE)
GitHub repo (contracts) ──Hardhat scripts──►  Deploy to public testnet (Sepolia or similar) (FREE, gas via faucet)
Contract ABI + addresses ──imported into──►  React frontend via Ethers.js
Supabase project (hosted, free tier) ──used directly by──► React frontend via Supabase client SDK
```

**Zero-Cost Architecture summary:** frontend hosting (Netlify/Vercel free tier), database/auth (Supabase free tier), blockchain (public testnet + faucet), source control/CI (GitHub free tier) — no credit card required for the academic build.

## 29. Testing Strategy

### Smart Contract Testing (Hardhat + Mocha/Chai)
- Unit tests per contract function: authorization gating, one-vote enforcement, time-window enforcement, threshold evaluation, revert reason correctness.
- Scenario tests: full election lifecycle, full proposal lifecycle, wallet revoke/re-authorize followed by an in-progress election (must not allow a second vote).
- Negative tests: unauthorized wallet attempts, double-vote attempts, voting outside window, non-officer proposal creation, non-admin wallet authorization.
- Gas usage checks (sanity, not optimization-critical for an academic MVP).
- (Stretch) Static analysis with a free tool such as Slither, if time permits, to catch common Solidity issues.

### Frontend Testing
- Component tests (e.g., React Testing Library) for form validation (OTP entry, proposal creation form).
- Integration tests mocking Ethers.js/MetaMask (e.g., using a test provider) to verify UI states (pending/confirmed/reverted) render correctly.
- Manual cross-browser check for MetaMask connection flow.

### Security Testing
- Manual re-entrancy and access-control review against the checklist in §20.
- Attempt every attack scenario in §20's table against the testnet deployment (e.g., try to vote from an unauthorized wallet) and confirm expected reverts.
- Confirm no private key, password, or raw personal data ever appears in any on-chain transaction calldata (manual calldata inspection on the block explorer).


## 30. Acceptance Criteria & MVP Scope

### MVP Scope (must-have for demonstration)
- Student registration + institutional email OTP verification (§10)
- MetaMask connection + wallet authorization by admin, including revoke/replace (§11)
- One election, end-to-end: create → vote → close → view results with tx hash (§12)
- One governance proposal, end-to-end: create → vote → finalize → passed/rejected (§13)
- One treasury proposal, end-to-end: create → vote → approve → (optional) demo-fund simulation, clearly labeled (§14)
- One attendance record set: issue → hash on-chain → later verify match/mismatch (§15)
- Admin dashboard: roster view, wallet authorize/revoke, role assignment
- All flows deployed and runnable on a public testnet with a shareable frontend URL

### Overall Acceptance Criteria
- No unauthorized wallet can perform any governance action, verified by direct contract-call attempts.
- No studentIdHash can vote twice in the same election or proposal, verified by test + manual attempt.
- No real currency transfer exists anywhere in the codebase.
- Every trust-sensitive outcome (vote tally, proposal state, treasury approval, verification hash) is independently readable and verifiable on the public testnet block explorer by anyone, without needing admin access.
- Entire system runs at $0 infrastructure cost using only the stack in §26.

## 31. Future Enhancements

- Multi-signature admin (replace single-admin-key wallet-authorization with a 2-of-3 or similar scheme) to remove the single-admin-compromise risk noted in §20.
- Layer-2 deployment (e.g., a low-fee Ethereum L2) if the project ever moved toward a real, ongoing production deployment, to reduce gas costs versus mainnet.
- Delegated/liquid voting (members delegate their vote to a trusted representative).
- Integration with the college's official ERP/SSO system for identity verification instead of a manually seeded roster.
- Formal, professional smart-contract audit before any real-value or real-institution production use.
- Push notifications for open elections/proposals nearing close.
- On-chain quorum requirements configurable per election/proposal type via governance itself, rather than fixed constants.

## 32. Limitations, Risks & Mitigations

| Limitation / Risk | Honest Statement | Mitigation |
|---|---|---|
| Blockchain doesn't prove someone is a unique real human | Only proves wallet control; identity trust comes entirely from the off-chain §10 verification step | Institutional email OTP against a vetted roster; single-wallet-per-student enforcement |
| Multiple wallets can be created | Not preventable by any blockchain mechanism | Only the one authorized wallet can act; unauthorized wallets always revert |
| Admin key is a single point of trust for wallet authorization | A compromised or malicious admin could authorize a fraudulent wallet | Logged/auditable on-chain events; recommended future work: multi-sig admin |
| Attendance hashing doesn't prove truthfulness at issuance | Only proves no change *since* issuance | Organizer accountability process; documented explicitly, never overstated in UI/docs |
| Public testnets can be reset/deprecated by maintainers | Testnet state is not permanent/production-grade | Acceptable for an academic MVP; documented as out-of-scope for production permanence |
| No professional smart-contract audit performed | Academic-level testing only, not audit-grade assurance | Manual attack-scenario testing (§29); explicitly flagged as future work (§31) before any real-value use |
| Gas costs (even free testnet ETH) require faucet access | Faucets can be rate-limited or temporarily unavailable | Document multiple faucet sources; keep a buffer of pre-funded demo wallets before presentations |
| Real INR payment is entirely outside the smart contract | System cannot itself guarantee the college actually pays after approval | Explicitly scoped as an off-chain institutional process, not a system responsibility |

## 33. Success Metrics

- 100% of unauthorized-wallet action attempts correctly revert in testing.
- 0 instances of a studentIdHash voting twice in the same election/proposal across all test runs.
- End-to-end demo (registration → vote → proposal → treasury → verification) completes without manual database intervention.
- All required PRD sections (§1–§37) map to a working, demonstrable feature or an explicitly documented limitation.
- Professor viva questions (§36) can each be answered accurately by any team member without notes.

## 34. Project Milestones & Development Phases

| Phase | Deliverables | Focus |
|---|---|---|
| Phase 1 — Setup | Repo scaffolding, Supabase project, Hardhat project, MetaMask/testnet config | Zero-cost infra setup |
| Phase 2 — Identity & Wallet | §10 and §11 fully working (OTP verify, wallet authorize/revoke) | Trust foundation |
| Phase 3 — Voting | `VotingContract` + election UI, full vote lifecycle (§12) | Core governance feature #1 |
| Phase 4 — Governance Proposals | `GovernanceContract` + proposal UI (§13) | Core governance feature #2 |
| Phase 5 — Treasury | `TreasuryContract` + spending proposal UI, demo-fund simulation (§14) | Core governance feature #3 |
| Phase 6 — Verification | `VerificationContract` + attendance hashing UI (§15) | Tamper-evidence feature |
| Phase 7 — Admin Dashboard | Roster management, wallet authorize/revoke UI, role assignment | Operational control |
| Phase 8 — Testing & Hardening | Full test suite (§29), attack-scenario walkthrough (§20) | Assurance |
| Phase 9 — Deployment & Demo Prep | Testnet deployment, Netlify deploy, demo script rehearsal (§35) | Presentation readiness |


## 35. Academic Demonstration Script

A complete, presentable demo sequence for a professor evaluation:

1. Student registers with roll number + institutional email.
2. Student identity is verified via OTP against the authorized roster.
3. Student connects MetaMask (on the configured public testnet).
4. Admin (or pre-configured demo flow) authorizes the wallet on-chain.
5. Student joins/views a club and its member list.
6. Student views an active election with candidates.
7. Student casts a vote for a candidate.
8. MetaMask opens and asks for transaction confirmation; student approves.
9. Smart contract processes the vote (authorization check, one-vote check).
10. Transaction hash is displayed in the UI, with a link to the block explorer.
11. Vote/result is independently verified live on the block explorer (showing the contract state, not just the app's claim).
12. A member/officer creates a governance proposal ("Hackathon 2026").
13. Members vote yes/no on the proposal.
14. Proposal is finalized and passes/rejects according to the fixed on-chain threshold.
15. A treasurer creates a treasury spending proposal ("₹15,000 for Hackathon").
16. Members vote; the approval is recorded on-chain (`SpendingApproved` event).
17. (Optional) a demo/testnet-token "release" is shown, clearly labeled as a simulation — the presenter explicitly states this is **not** real money.
18. An attendance record for a past event is created off-chain and its hash is committed on-chain.
19. A verification hash/proof is generated and displayed.
20. The verification is checked against the current record: match (unchanged) is shown, and — to demonstrate tamper-evidence — a record is deliberately edited in Supabase to show the mismatch/warning state.

## 36. Professor Viva Preparation (Q&A)

| Question | Technically Correct Answer |
|---|---|
| What is blockchain? | A distributed, append-only ledger maintained by many independent nodes, where data (once confirmed) is computationally impractical to alter without network-wide consensus. |
| What is Ethereum? | A public blockchain platform that, beyond simple transactions, supports Turing-complete smart contracts — programs whose execution and resulting state changes are enforced by the network. |
| What is a testnet? | A separate network, identical in software/behavior to Ethereum mainnet, that uses valueless test currency so developers can build and test without financial risk. |
| Why aren't you creating your own blockchain? | Building and securing a new blockchain (consensus, validator network, security) is a separate, far larger problem than this project's goal; we instead deploy our own smart contracts on an existing, already-secure, free Ethereum-compatible testnet. |
| What is a smart contract? | Code deployed to the blockchain whose functions execute deterministically and whose resulting state changes are enforced by the network, not by any single party. |
| Why Solidity? | It's the standard, most widely supported and documented language for EVM-compatible smart contracts, with mature tooling (Hardhat, Remix) suited to an academic timeline. |
| Why MetaMask? | It's a free, widely used browser wallet that keeps private keys local to the user's device and provides a standard interface (`window.ethereum`) for dApps to request signatures. |
| What is a wallet? | Software that manages a public/private key pair; the public part (address) identifies the account on-chain, the private part authorizes transactions via cryptographic signatures. |
| What is a wallet address? | A public identifier (derived from the public key) that represents an account on the blockchain — safe to share, unlike the private key. |
| What is a private key? | A secret cryptographic key that authorizes transactions from a wallet; it never leaves MetaMask in this system and is never seen by the application. |
| What is a transaction hash? | A unique identifier for a specific submitted transaction, generated once it's included in a block; used to look up its status/result on a block explorer. |
| What is gas? | The fee paid (in ETH, or testnet ETH here) to compensate the network for the computation required to execute a transaction/smart-contract call. |
| Why Ethers.js? | It's the standard JavaScript library for connecting a web frontend to Ethereum-compatible networks and contracts, and for interacting with MetaMask. |
| Why Hardhat? | It provides a local EVM node, a testing framework, and deployment scripting — the standard free, open-source workflow for Solidity development. |
| Why Supabase if blockchain is being used? | Most application data isn't trust-sensitive; Supabase provides free, fast auth and storage for that data, while blockchain is reserved for the subset of data that needs independent verifiability. |
| Why not store everything on blockchain? | Cost, public exposure of otherwise-private data, and storage inefficiency — most data doesn't need permanent public immutability. |
| What happens if a student creates 10 wallets? | All 10 can exist, but only the single wallet explicitly authorized through identity verification can pass the contract's `isAuthorized()` check and participate in governance. |
| How do you verify a wallet belongs to a student? | The student verifies identity via institutional email OTP against the college roster, then signs an authorization message with that wallet, which an admin-gated function then links on-chain. |
| Can blockchain prevent fake attendance? | No — it can only make an already-issued record tamper-evident afterward; it cannot verify the truthfulness of data at the moment it's entered. |
| Who controls the treasury? | No single person; spending approval requires a member vote passing a fixed threshold, recorded on-chain as a governance decision. |
| Is the treasury holding real INR? | No. Real INR stays in the college's existing banking/UPI/finance process; the smart contract only records a governance approval decision (and, optionally, a clearly labeled demo/testnet token simulation). |
| Why use a testnet? | To demonstrate real smart-contract behavior (gas, confirmations, on-chain state) at zero cost and zero financial risk. |
| What happens if the admin changes the database (Supabase)? | Trust-sensitive outcomes (votes, proposal states, treasury approvals, verification hashes) live on-chain and are unaffected by off-chain database edits; only non-sensitive display data could be altered off-chain. |
| What happens if a student's wallet is compromised? | The student re-verifies identity, the admin revokes the compromised wallet on-chain, and a new wallet is authorized; the old wallet immediately loses all permissions. |
| What happens if a user loses their wallet? | Same recovery flow as compromise: re-verify identity, revoke old wallet, authorize new one. |
| Is cryptocurrency required? | No real cryptocurrency is required or used; only free testnet ETH (valueless outside the test network) for gas. |
| Why is this a DAO? | Governance decisions (elections, proposals, treasury approvals) are made via member voting enforced by smart-contract rules rather than a single administrator's discretion — the defining property of a DAO, scoped here to an institutional/permissioned context rather than a fully public, anonymous one. |
| Where exactly is blockchain being used? | Voting, governance proposal outcomes, treasury approval decisions, wallet authorization records, and record-verification hashes — never for ordinary application data or real fund custody. |
| What problem does blockchain solve that a database cannot? | Independent verifiability without trusting the database's administrator — anyone can confirm an outcome directly against the public ledger rather than taking the admin's word for it. |
| What are the limitations of your system? | See §32 in full: cannot prove real-world identity beyond the off-chain verification step, cannot prevent wallet creation (only unauthorized *participation*), relies on a single admin key in the MVP, cannot prove attendance truthfulness at issuance, and has not undergone a professional security audit. |


## 37. Final Summary

### A. Final Recommended Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Auth & off-chain DB | Supabase (Postgres, Auth/OTP, RLS) |
| Hosting | Netlify or Vercel (free tier) |
| Smart contracts | Solidity |
| Contract tooling | Hardhat (+ optional Remix for prototyping) |
| Blockchain bridge | Ethers.js |
| Wallet | MetaMask |
| Network | Ethereum-compatible public testnet (e.g., Sepolia) + free faucets |
| Source control / CI | GitHub |

### B. Final Architecture Diagram

```
Student → React (Vite/Tailwind) ─┬─► Supabase (off-chain: profiles, clubs, events, attendance detail)
                                  └─► Ethers.js → MetaMask → Solidity Contracts → Ethereum Testnet
                                                                (on-chain: votes, proposals, treasury
                                                                 approvals, verification hashes)
```

### C. Smart Contract Module Summary
`MembershipContract` (wallet authorization/roles) ← read by → `VotingContract`, `GovernanceContract`, `TreasuryContract`; `VerificationContract` operates independently for record hashing.

### D. Database Schema Summary
`authorized_students`, `students`, `clubs`, `club_members`, `events`, `attendance`, `record_sets`, `elections`, `candidates`, `proposals`, `treasury_requests` — full column detail in §17.

### E. End-to-End Workflow
Verify identity (§10) → Authorize wallet (§11) → Participate: vote (§12) / propose (§13) / request treasury spend (§14) → Verify records (§15) → All trust-sensitive outcomes independently readable on-chain.

### F. Development Roadmap
Nine phases from infra setup through demo-prep, detailed in §34.

### G. Professor Viva Preparation
Full Q&A bank provided in §36, covering blockchain fundamentals, architectural choices, identity/Sybil handling, treasury honesty, and system limitations.

### H. Known Limitations & Honest Technical Assumptions
- Blockchain verifies wallet control, not real-world human uniqueness — that trust is supplied entirely by the off-chain identity-verification step.
- Multiple wallets cannot be prevented; only unauthorized *participation* is prevented.
- The MVP uses a single admin key for wallet authorization — a documented, real trust boundary, with multi-sig admin proposed as future work.
- Attendance/record hashing proves *no change since issuance*, not truthfulness *at* issuance.
- No real INR ever moves through any smart contract; real payments remain in the college's existing finance process.
- The system has not undergone a professional smart-contract security audit and is scoped as an academic MVP, not a production financial or identity system.

---

*End of Product Requirements Document — Campus DAO.*
