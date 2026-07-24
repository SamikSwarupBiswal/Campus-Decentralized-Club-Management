# Synthesized Constraints

## CON-01 — Zero mandatory cost

- **Type:** non-functional requirement
- **Content:** Development, deployment, operation, and academic demonstration must use open-source, testnet, or sufficient free-tier technology with a required total cost of ₹0.
- **Source:** `C:/Users/Samik/.codex/attachments/77ccb942-4ed5-4403-b159-3e2e7ce4f531/pasted-text.txt`

## CON-02 — Hybrid trust boundary

- **Type:** architecture
- **Content:** Membership, governance, voting, treasury authorization, and integrity proofs belong on-chain; profiles, descriptions, events, attendance rows, and operational data belong off-chain.
- **Source:** `C:/Users/Samik/.codex/attachments/77ccb942-4ed5-4403-b159-3e2e7ce4f531/pasted-text.txt`

## CON-03 — Required web stack

- **Type:** technology
- **Content:** Use Next.js, TypeScript, Tailwind CSS, reusable UI components, Wagmi, viem, Zod, qrcode, and html5-qrcode.
- **Source:** `C:/Users/Samik/.codex/attachments/77ccb942-4ed5-4403-b159-3e2e7ce4f531/pasted-text.txt`

## CON-04 — Required contract stack

- **Type:** technology
- **Content:** Use Solidity, Hardhat, and OpenZeppelin security/access-control utilities for the four-contract architecture.
- **Source:** `C:/Users/Samik/.codex/attachments/77ccb942-4ed5-4403-b159-3e2e7ce4f531/pasted-text.txt`

## CON-05 — Polygon Amoy only

- **Type:** protocol
- **Content:** On-chain operations target Polygon Amoy, chain ID 80002, using valueless Test POL.
- **Source:** `C:/Users/Samik/.codex/attachments/77ccb942-4ed5-4403-b159-3e2e7ce4f531/pasted-text.txt`

## CON-06 — Production services

- **Type:** deployment
- **Content:** Netlify hosts the web application, MongoDB Atlas Free Cluster stores operational data, Alchemy Free Tier supplies primary RPC access, and GitHub hosts source.
- **Source:** `C:/Users/Samik/.codex/attachments/77ccb942-4ed5-4403-b159-3e2e7ce4f531/pasted-text.txt`

## CON-07 — Wallet authentication

- **Type:** security protocol
- **Content:** MetaMask proves wallet ownership through signed, single-use challenges; the application never stores a wallet private key.
- **Source:** `C:/Users/Samik/.codex/attachments/77ccb942-4ed5-4403-b159-3e2e7ce4f531/pasted-text.txt`

## CON-08 — Governance rules

- **Type:** protocol
- **Content:** One active member wallet receives one vote; votes are YES, NO, or ABSTAIN; quorum is 51% of registered membership; passage requires YES greater than 50% of YES plus NO.
- **Source:** `C:/Users/Samik/.codex/attachments/77ccb942-4ed5-4403-b159-3e2e7ce4f531/pasted-text.txt`

## CON-09 — QR validity

- **Type:** security protocol
- **Content:** Attendance challenges are event-specific, cryptographically random, wallet-signed, valid for 60 seconds, and consumable once.
- **Source:** `C:/Users/Samik/.codex/attachments/77ccb942-4ed5-4403-b159-3e2e7ce4f531/pasted-text.txt`

## CON-10 — Attendance finality

- **Type:** integrity protocol
- **Content:** Attendance must be normalized, deduplicated, sorted, canonically serialized, SHA-256 hashed, and anchored in `AttendanceRegistry`.
- **Source:** `C:/Users/Samik/.codex/attachments/77ccb942-4ed5-4403-b159-3e2e7ce4f531/pasted-text.txt`

## CON-11 — Secret isolation

- **Type:** security
- **Content:** MongoDB connection strings, Alchemy credentials, deployment private keys, and admin secrets must be environment variables and must never be committed.
- **Source:** `C:/Users/Samik/.codex/attachments/77ccb942-4ed5-4403-b159-3e2e7ce4f531/pasted-text.txt`

## CON-12 — Responsive web delivery

- **Type:** compatibility
- **Content:** Desktop, laptop, tablet, and mobile must support wallet, proposal, event, QR generation, QR scanning, and integrity workflows.
- **Source:** `C:/Users/Samik/.codex/attachments/77ccb942-4ed5-4403-b159-3e2e7ce4f531/pasted-text.txt`
