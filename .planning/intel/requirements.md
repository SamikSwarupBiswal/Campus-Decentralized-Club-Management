# Extracted PRD Requirements

The normalized, checkable form of these requirements is in `.planning/REQUIREMENTS.md`. Every entry below was extracted from the single final PRD and retains source provenance.

## Platform Experience

- **PLAT-01** — Core workflows support desktop, tablet, and mobile. **Acceptance:** Wallet, proposals, events, attendance, and admin views remain usable at each target width. **Source:** `docs/PRD.md`, sections 25 and 28.
- **PLAT-02** — The complete system has no mandatory cost. **Acceptance:** Every required dependency is open source, testnet, or within a sufficient free tier. **Source:** `docs/PRD.md`, sections 4, 33, and 34.
- **PLAT-03** — The interface provides complete operational feedback. **Acceptance:** Loading, error, empty, pending, success, and failure states are visible. **Source:** `docs/PRD.md`, sections 28 and 30.
- **PLAT-04** — The project is reproducible from GitHub. **Acceptance:** A fresh checkout can install, build, test, configure, and deploy using documented commands. **Source:** `docs/PRD.md`, sections 5.13, 26, and 30.

## Wallet Authentication and Membership

- **AUTH-01** — MetaMask wallet ownership authenticates the user. **Acceptance:** A server challenge is signed, recovered, validated, and consumed once. **Source:** `docs/PRD.md`, sections 9 and 24.
- **AUTH-02** — Successful wallet authentication creates a secure application session. **Acceptance:** The session persists appropriately and logout invalidates it. **Source:** `docs/PRD.md`, sections 9 and 28.
- **MEM-01** — Admin can register an approved member wallet. **Acceptance:** The wallet becomes active in the membership contract and application. **Source:** `docs/PRD.md`, sections 3, 8.1, and 28.
- **MEM-02** — Admin can revoke membership. **Acceptance:** The wallet loses active membership and protected permissions. **Source:** `docs/PRD.md`, sections 3, 8.1, and 28.
- **MEM-03** — Membership is non-transferable. **Acceptance:** No member can transfer governance identity to another wallet. **Source:** `docs/PRD.md`, section 3.1.
- **MEM-04** — Protected capabilities require active membership. **Acceptance:** Non-members and revoked members cannot propose, vote, or generate valid attendance credentials. **Source:** `docs/PRD.md`, sections 3, 13, 21, and 24.
- **MEM-05** — Members can view membership context. **Acceptance:** The dashboard and directory show accurate wallet and membership status. **Source:** `docs/PRD.md`, sections 3 and 10.

## Governance

- **GOV-01** — Eligible members can create proposals. **Acceptance:** Title, description, category, creator, and voting window are preserved. **Source:** `docs/PRD.md`, sections 11 and 28.
- **GOV-02** — Off-chain proposal metadata has an on-chain hash. **Acceptance:** Canonical metadata produces the hash recorded for the proposal. **Source:** `docs/PRD.md`, sections 11, 12, and 24.4.
- **GOV-03** — Proposal metadata tampering is detectable. **Acceptance:** A hash mismatch produces a visible warning. **Source:** `docs/PRD.md`, sections 12 and 24.4.
- **GOV-04** — Users can browse proposal history and details. **Acceptance:** Active, completed, and detail views reflect proposal state. **Source:** `docs/PRD.md`, sections 3.1 and 28.
- **GOV-05** — Members can vote YES, NO, or ABSTAIN. **Acceptance:** All three choices are accepted during an active voting window. **Source:** `docs/PRD.md`, section 13.
- **GOV-06** — Duplicate or modified votes are forbidden. **Acceptance:** A second vote from the same wallet reverts. **Source:** `docs/PRD.md`, sections 13 and 24.1.
- **GOV-07** — Voting windows are enforced. **Acceptance:** Votes before start or after end are rejected. **Source:** `docs/PRD.md`, sections 13 and 24.1.
- **GOV-08** — Quorum is 30% of registered members. **Acceptance:** Proposal participation is evaluated against the registered member count. **Source:** `docs/PRD.md`, section 14.
- **GOV-09** — Approval uses a YES majority after quorum. **Acceptance:** YES reaches at least 60% of YES plus NO; ABSTAIN counts toward quorum only. **Source:** `docs/PRD.md`, section 15.
- **GOV-10** — Contract rules determine outcome. **Acceptance:** Admin cannot manually pass, fail, or alter a proposal result. **Source:** `docs/PRD.md`, sections 3.2 and 24.1.
- **GOV-11** — Successful proposals execute once. **Acceptance:** Failed, early, and repeated execution attempts revert. **Source:** `docs/PRD.md`, sections 8.2, 16, and 24.
- **GOV-12** — Governance evidence is inspectable. **Acceptance:** Vote totals, participation, state, transaction hash, and explorer links are visible. **Source:** `docs/PRD.md`, sections 3.1, 10, and 28.

## Treasury

- **TRY-01** — Treasury balance is public. **Acceptance:** Users can view the current Test POL balance. **Source:** `docs/PRD.md`, sections 10 and 16.
- **TRY-02** — Treasury accepts Test POL. **Acceptance:** Funding transactions are accepted and observable. **Source:** `docs/PRD.md`, sections 16 and 17.
- **TRY-03** — Governance authorizes transfers. **Acceptance:** Passed proposal data controls recipient, amount, and execution. **Source:** `docs/PRD.md`, sections 8.3 and 16.
- **TRY-04** — Treasury bypasses fail. **Acceptance:** Unauthorized, rejected, early, replayed, and reentrant calls revert. **Source:** `docs/PRD.md`, sections 24.2 and 28.
- **TRY-05** — Treasury history and academic scope are visible. **Acceptance:** Transactions are inspectable and the UI states that no real funds are managed. **Source:** `docs/PRD.md`, sections 16, 17, and 28.

## Events

- **EVT-01** — Authorized admins manage complete event records. **Acceptance:** Required event fields can be created and updated. **Source:** `docs/PRD.md`, sections 18 and 28.
- **EVT-02** — Members browse and inspect events. **Acceptance:** Upcoming and detail pages present persisted event data. **Source:** `docs/PRD.md`, sections 3.1, 18, and 28.
- **EVT-03** — Events can reference governance. **Acceptance:** A related proposal ID is stored and displayed when provided. **Source:** `docs/PRD.md`, section 18.
- **EVT-04** — Event operations are authorized and durable. **Acceptance:** Server-side authorization protects MongoDB-backed mutations. **Source:** `docs/PRD.md`, sections 18, 24.5, and 28.

## Signed Attendance

- **ATT-01** — Members receive event-specific random challenges. **Acceptance:** Event ID, wallet, timestamp, and unique nonce are included. **Source:** `docs/PRD.md`, section 19.
- **ATT-02** — MetaMask signatures become QR credentials. **Acceptance:** Payload and signature are encoded into a scannable QR. **Source:** `docs/PRD.md`, section 19.
- **ATT-03** — QR credentials expire after 60 seconds. **Acceptance:** Expired QR codes fail and a replacement can be generated. **Source:** `docs/PRD.md`, section 20.
- **ATT-04** — Admin can scan with a browser camera. **Acceptance:** The supported scanning interface decodes the QR payload. **Source:** `docs/PRD.md`, section 21.
- **ATT-05** — The server validates the full credential. **Acceptance:** Structure, signer, wallet, member, event, timestamp, and expiry checks all pass. **Source:** `docs/PRD.md`, section 21.
- **ATT-06** — Nonces are single use. **Acceptance:** A consumed nonce cannot register attendance again. **Source:** `docs/PRD.md`, sections 21 and 24.3.
- **ATT-07** — Event attendance is unique by member. **Acceptance:** A duplicate event-wallet check-in is rejected. **Source:** `docs/PRD.md`, sections 21 and 24.3.
- **ATT-08** — Valid attendance is durable and viewable. **Acceptance:** MongoDB contains one record and attendance history displays it. **Source:** `docs/PRD.md`, sections 21 and 28.

## Integrity and Security

- **INT-01** — Attendance uses canonical serialization. **Acceptance:** Addresses are normalized, records deduplicated and sorted, and event ID included. **Source:** `docs/PRD.md`, section 22.
- **INT-02** — Canonical attendance produces SHA-256. **Acceptance:** Identical logical records always produce the same hash. **Source:** `docs/PRD.md`, sections 22 and 23.
- **INT-03** — Final attendance is anchored on-chain. **Acceptance:** Admin records one proof for the event in `AttendanceRegistry`. **Source:** `docs/PRD.md`, sections 8.4 and 22.
- **INT-04** — Current attendance can be compared with its proof. **Acceptance:** The application recomputes and compares MongoDB and blockchain hashes. **Source:** `docs/PRD.md`, section 23.
- **INT-05** — Integrity status is explicit. **Acceptance:** Match displays verified; mismatch displays modified/tampered. **Source:** `docs/PRD.md`, section 23.
- **SEC-01** — APIs enforce validation and authorization. **Acceptance:** Protected routes validate input, wallet ownership, role, and errors server-side. **Source:** `docs/PRD.md`, section 24.5.
- **SEC-02** — Secrets never enter Git or public variables. **Acceptance:** Credentials and private keys exist only in protected environment configuration. **Source:** `docs/PRD.md`, sections 24.6 and 26.
- **SEC-03** — The production web surface is hardened. **Acceptance:** HTTPS and appropriate browser security headers are active. **Source:** `docs/PRD.md`, sections 26 and 32.
- **SEC-04** — Critical abuse cases have automated coverage. **Acceptance:** Membership, governance, treasury, attendance, replay, duplicate, and authorization failures are tested. **Source:** `docs/PRD.md`, sections 24, 27, and 30.

## Production Deployment

- **DEP-01** — Contracts deploy to Amoy in dependency order. **Acceptance:** Roles, ownership, and cross-contract addresses match the documented architecture. **Source:** `docs/PRD.md`, section 27.
- **DEP-02** — The app uses Amoy through Alchemy. **Acceptance:** Chain ID 80002, free Test POL, network handling, and contract reads/writes work. **Source:** `docs/PRD.md`, sections 5.9, 5.10, and 27.
- **DEP-03** — Netlify serves the GitHub build via HTTPS. **Acceptance:** Production environment variables and public URL work. **Source:** `docs/PRD.md`, sections 5.12 and 26.
- **DEP-04** — Atlas stores production operational data. **Acceptance:** The free cluster is connected and required indexes exist. **Source:** `docs/PRD.md`, sections 5.11, 7.2, and 30.
- **DEP-05** — Production passes the complete E2E workflow. **Acceptance:** Registration through attendance integrity succeeds on deployed services. **Source:** `docs/PRD.md`, sections 30 and 32.
- **DEP-06** — Production retains mandatory cost of ₹0. **Acceptance:** Hosting, database, RPC, chain, auth, QR, HTTPS, source control, and subdomain use free allowances. **Source:** `docs/PRD.md`, sections 4 and 33.
