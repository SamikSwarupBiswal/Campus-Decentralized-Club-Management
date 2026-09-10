# Product Requirements Document (PRD)

**Project Name:** Campus DAO — Decentralized College Club Management

**Document Version:** 4.0 — Final Deployment / Zero-Cost Architecture

**Target Platform:** Web Application (Mobile-Responsive)

**Project Type:** Blockchain / Web3 / DAO

**Deployment Platform:** Netlify

**Blockchain Network:** Polygon Amoy Testnet

**Primary Constraint:** The complete application must be developed, deployed, operated, and demonstrated using only free, open-source, testnet-based, or sufficient free-tier technologies.

---

# 1. Executive Summary

Traditional college clubs often depend on a president, treasurer, or small committee for important decisions such as event approvals, club spending, membership management, and attendance records.

This creates several problems:

* Lack of transparency in club spending.
* Centralized decision-making.
* Voting results that members cannot independently verify.
* Attendance records that can potentially be modified.
* Lack of a permanent and verifiable history of club decisions.

**Campus DAO** is a fully deployed decentralized college club management web application that combines traditional web technologies with blockchain-based governance.

The platform converts critical club governance processes into a **Decentralized Autonomous Organization (DAO)**.

Instead of allowing an administrator to manually determine governance outcomes, smart contracts enforce rules for:

* Membership eligibility.
* Proposal governance.
* Voting.
* Proposal approval and rejection.
* Treasury authorization.
* Attendance integrity.

The application follows a:

**Hybrid Web2 + Web3 Architecture**

Blockchain is used where transparency, immutability, and trust are important.

Traditional databases are used where speed, storage efficiency, privacy, and low cost are more important.

The fundamental principle is:

> **Store data off-chain when efficiency matters. Store decisions and proofs on-chain when trust matters.**

Campus DAO is intended to be deployed as a complete working web application rather than only a local prototype or MVP.

The production-facing academic deployment will use:

* Netlify for web hosting and server-side functions.
* MongoDB Atlas Free Cluster for database hosting.
* Polygon Amoy Testnet for blockchain transactions.
* Alchemy Free Tier for Polygon RPC access.
* MetaMask for wallet connectivity.
* GitHub for source-code hosting and deployment integration.

No paid infrastructure is required for the intended academic usage.

---

# 2. Project Objectives

Campus DAO aims to:

1. Create transparent college club governance.
2. Prevent manipulation of voting results.
3. Allow members to independently verify club decisions.
4. Provide transparent treasury authorization.
5. Prevent unauthorized treasury withdrawals.
6. Create verifiable event attendance records.
7. Reduce attendance fraud using short-lived cryptographically signed QR codes.
8. Provide tamper detection for attendance records.
9. Maintain a permanent blockchain history of important club decisions.
10. Demonstrate a practical real-world application of blockchain and DAO technology.
11. Provide a publicly accessible deployed web application.
12. Maintain zero mandatory operational cost.
13. Provide a mobile-responsive interface suitable for students.
14. Ensure the complete system remains reproducible using free technologies.

---

# 3. Target Users & Roles

## 3.1 Club Member / Student

A Club Member is a verified student whose blockchain wallet has been registered as a member of the club.

Each member receives one governance identity.

Membership credentials must not be freely transferable between wallets.

A Club Member can:

* Connect their MetaMask wallet.
* Authenticate using wallet ownership.
* Access the member dashboard.
* View club information.
* View treasury information.
* View active proposals.
* View completed proposals.
* Create proposals when permitted.
* Vote YES, NO, or ABSTAIN.
* View voting results.
* Verify proposal integrity.
* View upcoming events.
* Generate attendance QR codes.
* View attendance history.
* Verify finalized attendance integrity.
* View blockchain transaction information.

---

## 3.2 Club President / Admin

The Club President/Admin handles operational activities.

The Admin can:

* Verify new club members.
* Register approved member wallets.
* Revoke membership when appropriate.
* Create and manage events.
* Scan attendance QR codes.
* Finalize event attendance records.
* Manage operational club information.
* View governance activity.
* View treasury activity.

However, the Admin cannot:

* Modify an existing vote.
* Vote on behalf of another member.
* Manually approve a failed proposal.
* Manually reject a passed proposal.
* Change proposal results.
* Bypass governance rules.
* Directly withdraw governance-controlled treasury funds.
* Modify finalized blockchain attendance proofs.
* Modify blockchain proposal history.

This separates:

**Administration**

from

**Governance**

The administrator manages operations.

The DAO manages collective decisions.

---

# 4. Mandatory Zero-Cost Requirement

Campus DAO must be capable of development, deployment, operation, and academic demonstration without purchasing any software or infrastructure.

Every required technology must satisfy at least one of the following:

* Free and open-source.
* Completely free for development.
* Available through a sufficient permanent or renewable free tier.
* Testnet-based with freely obtainable test tokens.

The project must not require:

* Paid hosting.
* Paid database infrastructure.
* Paid APIs.
* Paid blockchain networks.
* Purchased cryptocurrency.
* Paid development software.
* Paid QR services.
* Paid authentication services.
* Paid file storage.
* Paid CI/CD.
* Paid domain name.

The default deployment URL provided by Netlify will be used, meaning purchasing a custom domain is not required.

---

# 5. Complete Technology Stack

## 5.1 Frontend Framework

### Next.js

Purpose:

* Application frontend.
* Routing.
* Dashboard.
* Proposal interface.
* Voting interface.
* Treasury interface.
* Event management.
* Attendance interface.
* Server-side functionality.

Cost:

**Free / Open Source**

---

# 5.2 UI Framework

### Tailwind CSS

Purpose:

* Responsive design.
* Mobile interface.
* Dashboard styling.
* Reusable UI components.
* Consistent application design.

Cost:

**Free / Open Source**

---

# 5.3 UI Components

### shadcn/ui

Purpose:

* Buttons.
* Dialogs.
* Cards.
* Forms.
* Navigation.
* Tables.
* Alerts.
* Dashboard components.

Cost:

**Free / Open Source**

---

# 5.4 Programming Languages

### TypeScript

Used for:

* Frontend logic.
* Server-side application logic.
* API endpoints.
* Type-safe development.

### Solidity

Used for:

* Smart contracts.
* Governance.
* Membership.
* Treasury.
* Attendance proof registry.

Cost:

**Free / Open Source**

---

# 5.5 Smart Contract Development

### Hardhat

Used for:

* Smart contract compilation.
* Local blockchain development.
* Contract testing.
* Contract deployment.
* Deployment scripts.

Cost:

**Free / Open Source**

---

# 5.6 Smart Contract Libraries

### OpenZeppelin Contracts

Used for:

* Governor architecture.
* Access control.
* Governance security.
* Reentrancy protection.
* Standardized Solidity utilities.

Cost:

**Free / Open Source**

---

# 5.7 Wallet

### MetaMask

Used for:

* Wallet connection.
* Authentication.
* Transaction signing.
* Governance voting.
* Proposal creation.
* Attendance challenge signing.

Cost:

**Free**

---

# 5.8 Web3 Frontend Integration

### Wagmi

Used for:

* Wallet connection.
* Account state.
* Network detection.
* Contract interactions.

### viem

Used for:

* Blockchain reads.
* Blockchain writes.
* Transaction handling.
* Signature verification utilities.
* RPC communication.

Cost:

**Free / Open Source**

---

# 5.9 Blockchain Network

### Polygon Amoy Testnet

Used for:

* Membership state.
* DAO governance.
* Voting.
* Proposal status.
* Treasury demonstration.
* Attendance hashes.

Network:

**Polygon Amoy**

Chain ID:

**80002**

Native Test Token:

**POL**

Test POL has no monetary value and is used exclusively for blockchain development and demonstration.

No real cryptocurrency is required.

---

# 5.10 RPC Infrastructure

### Alchemy Free Tier

Alchemy will be used as the primary RPC provider for Polygon Amoy.

Architecture:

```text
Campus DAO
     │
     ▼
Wagmi / viem
     │
     ▼
Alchemy RPC
     │
     ▼
Polygon Amoy
```

The application must not depend on deprecated Polygon-operated public RPC endpoints.

The RPC endpoint will be configured using environment variables.

Example:

```text
NEXT_PUBLIC_RPC_URL
```

No RPC API key should be hard-coded into the source code.

Cost:

**₹0 within Free Tier**

---

# 5.11 Database

### MongoDB Atlas Free Cluster

Primary deployed database.

Used for:

* Student profiles.
* Proposal metadata.
* Proposal descriptions.
* Events.
* Attendance records.
* Nonce tracking.
* Application metadata.

MongoDB Atlas provides a free cluster suitable for the intended academic workload.

Local development may optionally use:

### MongoDB Community Edition

Cost:

**₹0**

---

# 5.12 Deployment Platform

### Netlify

Netlify is the mandatory deployment platform for Campus DAO.

Used for:

* Hosting the Next.js application.
* HTTPS.
* Global CDN.
* Git-based deployments.
* Environment variables.
* Server-side execution.
* Deployment previews.

Deployment architecture:

```text
GitHub Repository
       │
       ▼
    Netlify
       │
       ├── Next.js Frontend
       │
       └── Server Logic
```

The default Netlify domain can be used.

Example structure:

```text
campus-dao.netlify.app
```

A paid custom domain is NOT required.

Cost:

**₹0 using Netlify Free Plan within included usage limits**

---

# 5.13 Source Code Repository

### GitHub

Used for:

* Source control.
* Git repository.
* Version history.
* Collaboration.
* Netlify deployment integration.

Repository structure:

```text
Campus-DAO/
│
├── app/
├── components/
├── contracts/
├── lib/
├── models/
├── public/
├── scripts/
├── test/
├── hardhat.config.ts
├── next.config.ts
├── package.json
└── README.md
```

Cost:

**Free**

---

# 5.14 Backend / Server Logic

### Next.js Server Functions / Route Handlers

Used for:

* MongoDB communication.
* QR verification.
* Attendance processing.
* Cryptographic hashing.
* Proposal metadata processing.
* Admin operations.
* Blockchain verification.

The backend runs through the deployed Next.js application on Netlify.

A separate paid backend server is not required.

Cost:

**₹0 within Netlify Free Plan limits**

---

# 5.15 QR Generation

### qrcode

Open-source JavaScript library.

Used for:

* Creating student attendance QR codes.

Cost:

**Free / Open Source**

---

# 5.16 QR Scanning

### html5-qrcode

Used for:

* Browser-based QR scanning.
* Mobile camera access.
* Attendance verification.

No external QR API is required.

Cost:

**Free / Open Source**

---

# 5.17 Cryptography

### Web Crypto API

and

### Node.js Crypto

Used for:

* SHA-256 hashing.
* Proposal integrity verification.
* Attendance integrity verification.
* Random nonce generation.

Cost:

**Free / Built-In**

---

# 5.18 Form Validation

### Zod

Used for:

* Proposal validation.
* Event validation.
* Server-side input validation.
* QR payload validation.

Cost:

**Free / Open Source**

---

# 5.19 Complete Zero-Cost Stack Summary

| Component            | Technology                 | Cost   |
| -------------------- | -------------------------- | ------ |
| Frontend             | Next.js                    | ₹0     |
| Language             | TypeScript                 | ₹0     |
| Styling              | Tailwind CSS               | ₹0     |
| Components           | shadcn/ui                  | ₹0     |
| Smart Contracts      | Solidity                   | ₹0     |
| Contract Development | Hardhat                    | ₹0     |
| Contract Libraries   | OpenZeppelin               | ₹0     |
| Wallet               | MetaMask                   | ₹0     |
| Web3 Integration     | Wagmi + viem               | ₹0     |
| Blockchain           | Polygon Amoy               | ₹0     |
| RPC                  | Alchemy Free Tier          | ₹0     |
| Database             | MongoDB Atlas Free Cluster | ₹0     |
| Backend              | Next.js Server Functions   | ₹0     |
| Hosting              | Netlify Free Plan          | ₹0     |
| Repository           | GitHub                     | ₹0     |
| QR Generation        | qrcode                     | ₹0     |
| QR Scanning          | html5-qrcode               | ₹0     |
| Hashing              | Web Crypto / Node Crypto   | ₹0     |
| Validation           | Zod                        | ₹0     |
| Test Blockchain      | Hardhat Network            | ₹0     |
| Test Tokens          | Polygon Amoy Faucet        | ₹0     |
| HTTPS                | Netlify                    | ₹0     |
| Domain               | Netlify Subdomain          | ₹0     |
| **Required Total**   |                            | **₹0** |

---

# 6. Final Deployment Architecture

```text
                        USER
                          │
                          ▼
                       Browser
                          │
                 ┌────────┴────────┐
                 │                 │
                 ▼                 ▼
              MetaMask          Netlify
                 │                 │
                 │          Next.js Application
                 │                 │
                 │       ┌─────────┼─────────┐
                 │       │         │         │
                 │       ▼         ▼         ▼
                 │    Frontend   Server    MongoDB
                 │               Logic      Atlas
                 │                 │
                 │                 │
                 └────────┐        │
                          ▼        ▼
                       Wagmi / viem
                            │
                            ▼
                      Alchemy RPC
                            │
                            ▼
                     Polygon Amoy
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
       Membership       Governor        Treasury
        Registry
             │
             ▼
       Attendance
        Registry
```

---

# 7. On-Chain vs Off-Chain Data

## 7.1 On-Chain Data

Blockchain stores information requiring transparency, trust, and immutability:

* Membership status.
* Governance eligibility.
* Proposal IDs.
* Proposal metadata hashes.
* Proposal recipient wallet.
* Requested treasury amount.
* Voting participation.
* YES votes.
* NO votes.
* ABSTAIN votes.
* Proposal status.
* Treasury authorization.
* Treasury transactions.
* Attendance hashes.
* Attendance finalization timestamps.

---

## 7.2 Off-Chain Data

MongoDB stores larger or privacy-sensitive application information:

* Student name.
* Student profile.
* Proposal title.
* Proposal description.
* Proposal category.
* Event information.
* Event venue.
* Event date/time.
* Raw attendance records.
* Application metadata.
* QR nonce information.

Personally identifiable student information must not be placed directly on a public blockchain.

---

# 8. Smart Contract Architecture

Campus DAO uses four primary smart contracts.

---

## 8.1 MembershipRegistry.sol

Purpose:

> Determine who belongs to the DAO.

Responsibilities:

* Register verified wallets.
* Maintain membership status.
* Provide governance eligibility.
* Revoke membership.
* Maintain member count.
* Prevent unauthorized membership modification.

Membership must not be transferable.

---

# 8.2 CampusGovernor.sol

Purpose:

> Manage decentralized club decisions.

Built using appropriate OpenZeppelin Governor components.

Responsibilities:

* Register governance proposals.
* Manage voting periods.
* Accept YES / NO / ABSTAIN votes.
* Prevent duplicate voting.
* Verify voting eligibility.
* Calculate quorum.
* Determine proposal outcomes.
* Authorize successful proposal execution.

The Admin cannot override governance results.

---

# 8.3 Treasury.sol

Purpose:

> Manage governance-controlled testnet funds.

Responsibilities:

* Receive Test POL.
* Display treasury balance.
* Execute approved transactions.
* Prevent unauthorized withdrawals.
* Prevent proposal re-execution.
* Maintain transparent transaction history.

Appropriate smart contract security protections must be implemented.

---

# 8.4 AttendanceRegistry.sol

Purpose:

> Store immutable proof of finalized event attendance.

Responsibilities:

* Store Event ID.
* Store finalized attendance hash.
* Store finalization timestamp.
* Prevent unauthorized finalization.
* Allow attendance integrity verification.

Complete student attendance lists remain off-chain.

---

# 9. Wallet Authentication

Campus DAO uses wallet-based authentication for blockchain functionality.

Flow:

```text
Student
   │
   ▼
Campus DAO
   │
   ▼
Connect MetaMask
   │
   ▼
Wallet Address
   │
   ▼
MembershipRegistry
   │
   ▼
Registered Member?
   │
 ┌─┴─┐
YES  NO
 │    │
 ▼    ▼
Allow Reject
```

For sensitive server-side operations, the application must not trust a wallet address supplied by the browser alone.

The server must verify wallet ownership using a cryptographic signature when required.

---

# 10. Main Dashboard

The deployed dashboard displays:

* Total Members.
* Treasury Balance.
* Active Proposals.
* Approved Proposals.
* Rejected Proposals.
* Upcoming Events.
* Recent Transactions.
* Voting Participation.
* Recent Governance Activity.

Data is obtained from MongoDB and Polygon Amoy.

---

# 11. Proposal Creation

Eligible members can create governance proposals.

Examples:

* Purchase Raspberry Pi Kits.
* Conduct Hackathon.
* Organize AI Workshop.
* Purchase Club Equipment.
* Fund Coding Competition.

Proposal form contains:

* Title.
* Description.
* Category.
* Requested Amount.
* Recipient Wallet.
* Voting Duration.

Inputs must be validated before blockchain submission.

---

# 12. Proposal Data Integrity

Full proposal descriptions remain off-chain.

Process:

```text
Proposal
   │
   ├──────────────► MongoDB
   │
   ▼
Canonical Serialization
   │
   ▼
SHA-256
   │
   ▼
Metadata Hash
   │
   ▼
Polygon Amoy
```

Blockchain stores:

* Proposal ID.
* Metadata Hash.
* Amount.
* Recipient.

Verification:

```text
MongoDB Proposal
       │
       ▼
Recalculate Hash
       │
       ▼
Blockchain Hash
       │
       ▼
Compare
     /     \
 MATCH    MISMATCH
   │         │
   ▼         ▼
Verified   Tampered
```

---

# 13. DAO Voting

Members can vote:

**YES**

**NO**

**ABSTAIN**

Flow:

```text
Member
   │
   ▼
Select Vote
   │
   ▼
MetaMask
   │
   ▼
Polygon Amoy
   │
   ▼
CampusGovernor
   │
   ├── Member?
   ├── Voting active?
   └── Already voted?
          │
          ▼
      Record Vote
```

Duplicate voting must be rejected by the smart contract.

---

# 14. Quorum

A proposal cannot pass with insufficient participation.

Initial governance configuration:

**Quorum = 30%**

The governance configuration may be changed during initial contract configuration before final deployment.

Once deployed, governance rules must not be silently alterable by the administrator.

---

# 15. Approval Threshold

After quorum is reached:

**YES approval threshold = 60%**

Conceptual flow:

```text
Voting Ends
    │
    ▼
Quorum Reached?
   /       \
 NO        YES
 │          │
 ▼          ▼
FAIL      Check
        Approval
        Threshold
          /   \
        NO    YES
        │      │
        ▼      ▼
      FAIL    PASS
```

The smart contract determines the outcome.

---

# 16. DAO Treasury

The treasury demonstrates transparent decentralized fund management.

Example:

```text
Treasury
0.50 Test POL
      │
      ▼
Proposal
      │
"Allocate 0.05 Test POL"
      │
      ▼
DAO Voting
      │
      ▼
Proposal Passes
      │
      ▼
Execute
      │
      ▼
Recipient receives
0.05 Test POL
```

Only governance-approved transactions can execute.

---

# 17. Treasury Scope

Campus DAO does NOT directly manage Indian Rupees or real cryptocurrency.

Polygon Amoy Test POL is used to demonstrate:

* Treasury governance.
* Fund authorization.
* Transparent transactions.
* Smart contract execution.
* DAO-controlled spending.

This keeps the deployed academic project completely free and avoids handling real financial assets.

---

# 18. Event Management

Authorized administrators can create events.

Event information includes:

* Event Name.
* Description.
* Date.
* Start Time.
* End Time.
* Venue.
* Organizer.
* Related Proposal ID.
* Attendance status.

Event information is stored in MongoDB Atlas.

---

# 19. Dynamic QR Attendance

Students generate short-lived cryptographically signed QR codes.

QR challenge:

```text
Event ID
+
Student Wallet
+
Timestamp
+
Unique Nonce
```

The student signs the challenge using MetaMask.

The resulting payload and signature are encoded into a QR code.

---

# 20. QR Expiration

QR codes remain valid for:

**60 seconds**

After expiration:

```text
QR Expired
     │
     ▼
Generate New Challenge
     │
     ▼
Sign Again
     │
     ▼
New QR
```

This reduces screenshot-sharing attacks.

---

# 21. Attendance Verification

The Admin scans the QR using the browser camera.

Server-side verification performs:

1. Decode QR.
2. Validate QR structure.
3. Recover signed message.
4. Recover signer wallet.
5. Compare signer with claimed wallet.
6. Verify club membership.
7. Verify Event ID.
8. Verify timestamp.
9. Verify nonce.
10. Verify expiration.
11. Check duplicate attendance.
12. Mark nonce as consumed.
13. Store valid attendance in MongoDB.

A QR nonce must not be reusable after successful attendance registration.

---

# 22. Attendance Finalization

After an event:

Admin selects:

**Finalize Attendance**

Process:

```text
Attendance Records
       │
       ▼
Normalize Wallet Addresses
       │
       ▼
Remove Duplicates
       │
       ▼
Sort Deterministically
       │
       ▼
Include Event ID
       │
       ▼
Canonical Serialization
       │
       ▼
SHA-256
       │
       ▼
Attendance Hash
       │
       ▼
AttendanceRegistry
       │
       ▼
Polygon Amoy
```

Once finalized, the blockchain proof becomes the authoritative integrity reference.

---

# 23. Attendance Tamper Detection

Verification process:

```text
MongoDB Attendance
       │
       ▼
Canonicalization
       │
       ▼
SHA-256
       │
       ▼
Current Hash

       VS

Blockchain Hash
```

If equal:

**✓ Attendance Verified**

If different:

**⚠ Attendance Record Has Been Modified**

---

# 24. Security Requirements

## 24.1 Governance Security

The system must prevent:

* Duplicate voting.
* Voting by non-members.
* Voting outside the voting period.
* Vote modification.
* Admin result manipulation.
* Unauthorized proposal execution.

---

## 24.2 Treasury Security

The system must prevent:

* Unauthorized withdrawals.
* Admin treasury bypass.
* Reentrancy attacks.
* Re-execution of proposals.
* Execution of rejected proposals.
* Execution before governance completion.

---

## 24.3 Attendance Security

The system must implement:

* Wallet signatures.
* Event-specific challenges.
* Short-lived QR codes.
* Cryptographically random nonces.
* One-time nonce consumption.
* Duplicate prevention.
* Membership verification.
* Deterministic hashing.
* Blockchain finalization.

---

## 24.4 Proposal Security

Off-chain proposal data must have an on-chain metadata hash.

The application must automatically detect hash mismatches.

---

## 24.5 API Security

Server endpoints must implement:

* Input validation.
* Authorization checks.
* Wallet ownership verification where required.
* Secure environment variables.
* Error handling.
* Request validation.

Admin authorization must never rely only on hiding frontend buttons.

---

## 24.6 Secret Management

The following must never be committed to GitHub:

```text
MongoDB connection string
Alchemy API key
Deployment private key
Admin secrets
```

Secrets must be stored using Netlify environment variables.

---

# 25. Responsive Design Requirements

Campus DAO must work on:

* Desktop.
* Laptop.
* Tablet.
* Mobile.

Mobile optimization is mandatory for:

* MetaMask interaction.
* Proposal voting.
* Event pages.
* QR generation.
* QR scanning.
* Attendance verification.

---

# 26. Deployment Configuration

The final application is deployed directly through Netlify.

Deployment pipeline:

```text
Developer
    │
    ▼
Git Push
    │
    ▼
GitHub
    │
    ▼
Netlify Build
    │
    ▼
Next.js Production Build
    │
    ▼
Netlify Deployment
    │
    ▼
Public HTTPS URL
```

Required environment variables include conceptually:

```text
MONGODB_URI

NEXT_PUBLIC_CHAIN_ID

NEXT_PUBLIC_RPC_URL

NEXT_PUBLIC_MEMBERSHIP_CONTRACT

NEXT_PUBLIC_GOVERNOR_CONTRACT

NEXT_PUBLIC_TREASURY_CONTRACT

NEXT_PUBLIC_ATTENDANCE_CONTRACT
```

Deployment-only secrets such as a smart-contract deployer private key must never be exposed using a `NEXT_PUBLIC_` variable.

---

# 27. Smart Contract Deployment

Contracts will first be tested using Hardhat.

Final contracts are deployed to:

**Polygon Amoy Testnet**

Deployment order:

```text
MembershipRegistry
       │
       ▼
Treasury
       │
       ▼
CampusGovernor
       │
       ▼
AttendanceRegistry
```

Contract addresses are saved as deployment configuration.

The Netlify application then connects to these deployed contracts.

---

# 28. Complete Application Scope

The final Campus DAO application must include:

1. MetaMask wallet connection.
2. Wallet authentication.
3. Membership registration.
4. Membership verification.
5. Membership revocation.
6. Member dashboard.
7. Admin dashboard.
8. Proposal creation.
9. Proposal metadata hashing.
10. Proposal integrity verification.
11. Proposal browsing.
12. Proposal detail pages.
13. YES voting.
14. NO voting.
15. ABSTAIN voting.
16. Duplicate vote prevention.
17. Voting period enforcement.
18. Quorum calculation.
19. Approval threshold.
20. Automatic proposal outcome.
21. Treasury balance.
22. Governance-authorized treasury execution.
23. Treasury transaction history.
24. Event creation.
25. Event management.
26. Dynamic attendance QR generation.
27. Wallet-signed QR challenges.
28. QR expiration.
29. QR scanning.
30. Signature verification.
31. Nonce verification.
32. Nonce replay prevention.
33. Duplicate attendance prevention.
34. Attendance database.
35. Attendance history.
36. Attendance finalization.
37. Blockchain attendance hash.
38. Attendance integrity verification.
39. Mobile-responsive interface.
40. Error and loading states.
41. Netlify production deployment.
42. MongoDB Atlas cloud database integration.
43. Polygon Amoy integration.
44. Alchemy RPC integration.
45. Public HTTPS access.

There is no separate MVP scope.

These requirements represent the intended complete deployed academic application.

---

# 29. Out-of-Scope Features

The following features are not required for the final version:

* Real-money treasury.
* Real cryptocurrency treasury.
* NFT achievement badges.
* Governance cryptocurrency.
* Quadratic voting.
* Delegated voting.
* IPFS.
* AI features.
* College timetable integration.
* OD integration.
* Native Android application.
* Native iOS application.
* Multiple independent DAOs.
* Paid custom domain.
* Fiat payment integration.

These features are intentionally excluded because they are not necessary to demonstrate the project's core innovation.

---

# 30. Development and Deployment Phases

## Phase 1 — Project Setup

Set up:

* GitHub repository.
* Next.js.
* TypeScript.
* Tailwind CSS.
* shadcn/ui.
* Hardhat.
* Solidity.
* MongoDB development environment.

---

## Phase 2 — Smart Contracts

Develop:

* MembershipRegistry.sol.
* CampusGovernor.sol.
* Treasury.sol.
* AttendanceRegistry.sol.

Write automated tests before testnet deployment.

---

## Phase 3 — Web3 Integration

Implement:

* MetaMask connection.
* Wagmi configuration.
* viem configuration.
* Polygon Amoy configuration.
* Alchemy RPC.
* Network switching.
* Contract read/write functions.

---

## Phase 4 — Membership System

Implement:

* Member registration.
* Member verification.
* Membership revocation.
* Wallet authentication.
* Role-based UI.

---

## Phase 5 — Governance

Implement:

* Proposal creation.
* Metadata hashing.
* Proposal viewing.
* Voting.
* Quorum.
* Approval threshold.
* Proposal state.
* Execution.

---

## Phase 6 — Treasury

Implement:

* Treasury funding.
* Treasury balance.
* Governance-authorized execution.
* Transaction history.
* Security protections.

---

## Phase 7 — Database

Configure MongoDB Atlas.

Implement collections for:

* Users.
* Proposals.
* Events.
* Attendance.
* Nonces.

---

## Phase 8 — Events

Implement:

* Event creation.
* Event management.
* Upcoming events.
* Event detail pages.
* Proposal-event relationships.

---

## Phase 9 — Attendance

Implement:

* QR challenge generation.
* MetaMask signature.
* Dynamic QR.
* Browser QR scanning.
* Signature verification.
* Expiration.
* Nonce verification.
* Replay protection.
* Attendance storage.

---

## Phase 10 — Blockchain Attendance Integrity

Implement:

* Canonicalization.
* SHA-256 hashing.
* Attendance finalization.
* AttendanceRegistry integration.
* Tamper detection.

---

## Phase 11 — UI Completion

Complete:

* Student dashboard.
* Admin dashboard.
* Proposal pages.
* Treasury pages.
* Event pages.
* Attendance pages.
* Mobile interface.
* Loading states.
* Error states.
* Empty states.
* Transaction feedback.

---

## Phase 12 — Smart Contract Testnet Deployment

Deploy contracts to:

**Polygon Amoy Testnet**

Configure Alchemy RPC.

Fund deployment wallet using free Test POL.

Record contract addresses.

---

## Phase 13 — Production Web Deployment

Connect:

```text
GitHub
   ↓
Netlify
```

Configure:

* Build settings.
* Environment variables.
* MongoDB Atlas.
* Alchemy.
* Smart contract addresses.

Deploy the complete application.

---

## Phase 14 — End-to-End Testing

Test the complete production deployment:

```text
Register Member
      ↓
Connect Wallet
      ↓
Create Proposal
      ↓
Vote
      ↓
Proposal Passes
      ↓
Execute Treasury Transaction
      ↓
Create Event
      ↓
Generate Attendance QR
      ↓
Scan QR
      ↓
Finalize Attendance
      ↓
Store Blockchain Hash
      ↓
Verify Attendance
```

---

# 31. Final Production Architecture

```text
                    CAMPUS DAO
                         │
                         ▼
              Netlify HTTPS Website
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
       Next.js Frontend       Server Logic
              │                     │
       ┌──────┴──────┐              ▼
       │             │        MongoDB Atlas
       ▼             ▼
   MetaMask      Wagmi / viem
                     │
                     ▼
                 Alchemy
                     │
                     ▼
               Polygon Amoy
                     │
       ┌─────────────┼─────────────┐
       │             │             │
       ▼             ▼             ▼
  Membership      Governor      Treasury
    Registry
       │
       ▼
   Attendance
    Registry
```

---

# 32. Success Criteria

Campus DAO is considered complete when:

* The application is publicly accessible through Netlify.
* HTTPS is enabled.
* A user can connect MetaMask.
* The application detects the correct blockchain network.
* A verified member can access governance.
* An unauthorized wallet cannot participate.
* Admin can register members.
* A member can create a proposal.
* Proposal metadata integrity can be verified.
* Members can vote.
* Duplicate voting is rejected.
* Voting periods are enforced.
* Governance automatically determines proposal outcomes.
* Admin cannot override governance results.
* Treasury balance is publicly visible.
* Approved treasury proposals can execute.
* Unauthorized treasury withdrawals fail.
* Admin can create events.
* Students can generate signed attendance QR codes.
* Expired QR codes are rejected.
* Reused QR codes are rejected.
* Admin can verify attendance.
* Duplicate attendance is prevented.
* Attendance can be finalized.
* Final attendance receives a blockchain hash.
* Modified attendance can be detected.
* The UI works on desktop and mobile.
* MongoDB Atlas operates within the free cluster.
* Netlify operates within the free plan.
* Alchemy operates within the free tier.
* Polygon Amoy Test POL is used instead of real cryptocurrency.
* No paid technology is required for the intended academic deployment.

---

# 33. Zero-Cost Deployment Requirement

The intended deployed architecture is:

```text
Netlify
   │
   │ ₹0
   ▼
Next.js
   │
   ├───────────────► MongoDB Atlas
   │                       ₹0
   │
   ▼
Alchemy RPC
   │
   │ ₹0 Free Tier
   ▼
Polygon Amoy
   │
   │ Free Test POL
   ▼
Smart Contracts
```

Expected mandatory infrastructure cost:

**Hosting: ₹0**

**Database: ₹0**

**Blockchain: ₹0**

**RPC: ₹0**

**Authentication: ₹0**

**QR Infrastructure: ₹0**

**HTTPS: ₹0**

**Source Control: ₹0**

**Domain: ₹0 using Netlify subdomain**

### Required Total Cost: ₹0

The architecture assumes usage remains within the relevant providers' free-tier limits.

---

# 34. Core Project Principle

Campus DAO does not attempt to place every operation on blockchain.

Instead:

```text
                CAMPUS DAO

        ┌─────────────────────┐
        │     BLOCKCHAIN      │
        │                     │
        │ Membership          │
        │ Governance          │
        │ Voting              │
        │ Treasury            │
        │ Integrity Proofs    │
        └──────────┬──────────┘
                   │
              Hybrid DAO
                   │
        ┌──────────▼──────────┐
        │      DATABASE       │
        │                     │
        │ Profiles            │
        │ Descriptions        │
        │ Events              │
        │ Attendance          │
        │ Application Data    │
        └─────────────────────┘
```

The guiding principle is:

> **Store data off-chain when efficiency and privacy matter. Store decisions and proofs on-chain when transparency and trust matter.**

Campus DAO therefore provides a practical balance between:

* Decentralization.
* Transparency.
* Security.
* Privacy.
* Performance.
* Development complexity.
* Real-world usability.
* Zero-cost deployment.

The final result is a **fully deployed, mobile-responsive, blockchain-based college club governance platform accessible directly through Netlify without requiring any paid infrastructure.**
