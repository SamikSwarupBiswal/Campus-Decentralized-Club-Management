# Campus DAO

## What This Is

Campus DAO is a mobile-responsive decentralized college club management application for students and club administrators. It combines wallet-authenticated Web2 operations with Polygon Amoy smart contracts so membership, proposals, voting, treasury authorization, and attendance proofs can be independently verified.

The repository already contains a working Next.js and Solidity baseline. The current milestone is to close the gap between that baseline and the PRD's complete, publicly deployed, zero-cost academic application.

## Core Value

Club members can trust and independently verify governance decisions, treasury actions, and finalized attendance without relying on an administrator's word.

## Requirements

### Validated

- ✓ The Next.js application compiles and produces a production build — baseline commit `6bc2597`
- ✓ The four Solidity contracts compile and their current automated suite passes — 5 contract tests at baseline
- ✓ The repository contains responsive member, proposal, treasury, event, attendance, and admin surfaces — baseline implementation

These validations establish a technical baseline; they do not certify the complete production workflow or all v1 requirements.

### Active

- [ ] Deliver wallet authentication and enforce registered, non-transferable membership
- [ ] Make proposal governance and three-way voting verifiable on Polygon Amoy
- [ ] Restrict Test POL treasury execution to successful governance
- [ ] Persist operational member and event data in MongoDB Atlas
- [ ] Prevent attendance replay and duplicate check-ins with signed, expiring QR challenges
- [ ] Anchor deterministic attendance proofs on-chain and detect later tampering
- [ ] Harden APIs, contracts, secret handling, and responsive user feedback
- [ ] Deploy and validate the complete application on Netlify using only free-tier infrastructure

### Out of Scope

- Real-money or mainnet treasury — the academic demonstration uses valueless Polygon Amoy Test POL
- Governance tokens, transferable membership tokens, NFTs, quadratic voting, and delegated voting — excluded by the final PRD
- IPFS and decentralized file storage — operational metadata remains in MongoDB for efficiency and cost
- Native Android or iOS applications — the responsive web application is the supported client
- Multiple independent DAOs — v1 represents one college club
- Fiat payments, timetable/OD integration, and AI features — unrelated to the core governance proof
- Paid hosting, APIs, databases, CI/CD, authentication, storage, domains, or blockchain services — violates the zero-cost constraint

## Context

- The product is an academic deployment intended to demonstrate a practical hybrid Web2/Web3 DAO.
- The source baseline uses Next.js 15, React 19, TypeScript, Tailwind CSS, Wagmi, viem, MongoDB, Hardhat, Solidity, and OpenZeppelin.
- Four contracts exist: `MembershipRegistry`, `CampusGovernor`, `Treasury`, and `AttendanceRegistry`.
- The UI and APIs currently include demo-data fallbacks. Production completion requires proving configured MongoDB and deployed-contract paths end to end.
- The current governor is a purpose-built membership-weighted contract rather than OpenZeppelin Governor modules; security behavior must be verified against the PRD rather than assumed from the library.
- GitHub hosts the source. Netlify, MongoDB Atlas, Alchemy, and Polygon Amoy are the intended external runtime.
- The supplied PRD is version 4.0 and explicitly defines one complete deployment scope rather than a reduced MVP.

## Constraints

- **Budget**: Mandatory operating cost must remain ₹0 — use open source, free tiers, and testnet assets only
- **Network**: Governance and proofs run on Polygon Amoy, chain ID 80002 — no real cryptocurrency
- **Hosting**: The web application must deploy to Netlify with its default HTTPS subdomain — no paid domain required
- **Database**: Operational data uses MongoDB Atlas Free Cluster in production — blockchain is reserved for trust-critical state and proofs
- **RPC**: Polygon access uses Alchemy Free Tier with a public Amoy fallback where practical
- **Wallet**: MetaMask signs authentication, governance, and attendance operations — private keys never enter application storage
- **Security**: Admin authorization must be enforced server-side and on-chain, never only by hidden UI
- **Secrets**: MongoDB URIs, Alchemy credentials, deployment keys, and admin secrets stay in environment variables and never in Git
- **Compatibility**: Desktop, laptop, tablet, and mobile layouts must support core workflows
- **Architecture**: Store efficient/private operational data off-chain; store decisions and integrity proofs on-chain
- **Deployment**: Contract addresses and chain configuration must be reproducible from documented scripts and environment variables

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use a hybrid Web2/Web3 architecture | Blockchain is valuable for trust-critical state but inefficient for profiles, descriptions, and attendance rows | — Pending production validation |
| Use one-wallet-one-member governance | Prevents transferable credentials and token-weighted capture in a college club | — Pending production validation |
| Use Polygon Amoy and Test POL only | Demonstrates transparent execution without financial risk or mandatory cost | — Pending production validation |
| Use short-lived signed QR challenges | Limits screenshot sharing and proves wallet ownership at check-in | — Pending production validation |
| Anchor canonical attendance hashes on-chain | Makes later database changes detectable without exposing attendance data publicly | — Pending production validation |
| Treat the existing application as a brownfield baseline | Code exists, but PRD completion requires integration and E2E evidence, not file presence alone | ✓ Good |

## Evolution

After each phase, move requirements from Active to Validated only when implementation, verification, and commit evidence exist. Record material architecture decisions here and keep the product description aligned with deployed behavior.

---
*Last updated: 2026-07-24 after ingesting the Campus DAO PRD and auditing the baseline repository*
