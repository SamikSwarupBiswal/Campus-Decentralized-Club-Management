# Requirements: Campus DAO

**Defined:** 2026-07-24
**Core Value:** Club members can trust and independently verify governance decisions, treasury actions, and finalized attendance without relying on an administrator's word.

## v1 Requirements

### Platform Experience

- [ ] **PLAT-01**: A student or administrator can use every core workflow on desktop, tablet, and mobile layouts.
- [ ] **PLAT-02**: The application uses only open-source, testnet, or sufficient free-tier technologies and requires no paid service.
- [ ] **PLAT-03**: Users receive clear loading, empty, error, transaction-pending, transaction-success, and transaction-failure feedback.
- [ ] **PLAT-04**: A developer can reproduce installation, build, contract tests, and runtime configuration from the GitHub repository.

### Wallet Authentication and Membership

- [ ] **AUTH-01**: A user can connect MetaMask and authenticate by signing a server-issued, single-use wallet challenge.
- [ ] **AUTH-02**: An authenticated wallet receives a secure session that survives navigation and can be explicitly logged out.
- [ ] **MEM-01**: An authorized administrator can register an approved student wallet as a club member.
- [ ] **MEM-02**: An authorized administrator can revoke a wallet's active membership.
- [ ] **MEM-03**: Membership is bound to one wallet identity and cannot be transferred between wallets.
- [ ] **MEM-04**: Non-members and revoked members cannot create proposals, vote, or generate valid attendance credentials.
- [ ] **MEM-05**: Members can view their governance identity, member status, and the club member directory.

### Governance

- [ ] **GOV-01**: An eligible member can create a proposal with a title, description, category, creator, and voting window.
- [ ] **GOV-02**: Proposal metadata stored off-chain has a deterministic hash recorded with its on-chain proposal.
- [ ] **GOV-03**: The application detects and visibly reports when stored proposal metadata does not match the on-chain hash.
- [ ] **GOV-04**: Users can browse active and completed proposals and open a proposal detail view.
- [ ] **GOV-05**: An active member can cast exactly one YES, NO, or ABSTAIN vote on an active proposal.
- [ ] **GOV-06**: A wallet cannot vote more than once on the same proposal or modify a submitted vote.
- [ ] **GOV-07**: Votes submitted before the start or after the end of the voting period are rejected.
- [ ] **GOV-08**: Proposal quorum is calculated against the registered member count using the PRD's 30% rule.
- [ ] **GOV-09**: A proposal passes only when quorum is met and YES votes reach at least 60% of YES plus NO votes.
- [ ] **GOV-10**: Proposal state and outcome are derived automatically from contract rules and cannot be overridden by an administrator.
- [ ] **GOV-11**: Only a successful proposal can execute, and the same proposal cannot execute twice.
- [ ] **GOV-12**: Users can inspect vote totals, participation, proposal state, transaction hashes, and Polygon explorer links.

### Treasury

- [ ] **TRY-01**: Any user can view the DAO treasury's current Test POL balance.
- [ ] **TRY-02**: The treasury can receive Test POL for academic demonstration.
- [ ] **TRY-03**: A passed governance proposal can execute its authorized recipient, amount, and call data through the treasury.
- [ ] **TRY-04**: Unauthorized, early, rejected, replayed, and reentrant treasury executions fail.
- [ ] **TRY-05**: Users can view treasury transaction history and a clear notice that the system handles no real money or cryptocurrency.

### Events

- [ ] **EVT-01**: An authorized administrator can create and manage events with name, description, date, times, venue, organizer, attendance status, and optional proposal link.
- [ ] **EVT-02**: Members can browse upcoming events and open complete event detail pages.
- [ ] **EVT-03**: An event can reference the governance proposal that authorized or funded it.
- [ ] **EVT-04**: Event mutations are authorized server-side and persisted in MongoDB Atlas rather than relying on frontend-only controls.

### Signed Attendance

- [ ] **ATT-01**: A verified member can request an event-specific challenge containing event ID, wallet, timestamp, and a cryptographically random nonce.
- [ ] **ATT-02**: The member can sign the challenge with MetaMask and encode the payload and signature into a QR code.
- [ ] **ATT-03**: Attendance QR codes expire after 60 seconds and the member can generate and sign a replacement.
- [ ] **ATT-04**: An authorized administrator can scan a QR code using a supported browser camera.
- [ ] **ATT-05**: The server validates QR structure, recovered signer, claimed wallet, event, membership, timestamp, and expiration.
- [ ] **ATT-06**: A successfully consumed nonce cannot be replayed.
- [ ] **ATT-07**: The same member cannot be checked into the same event more than once.
- [ ] **ATT-08**: Valid attendance is stored in MongoDB and can be viewed in attendance history.

### Integrity and Security

- [ ] **INT-01**: Attendance finalization normalizes wallet addresses, removes duplicates, sorts deterministically, includes the event ID, and uses canonical serialization.
- [ ] **INT-02**: The canonical attendance payload produces a deterministic SHA-256 hash.
- [ ] **INT-03**: An authorized administrator can finalize an event's attendance hash once in `AttendanceRegistry` on Polygon Amoy.
- [ ] **INT-04**: The application can recompute the current MongoDB attendance hash and compare it with the authoritative on-chain proof.
- [ ] **INT-05**: The integrity view clearly distinguishes verified attendance from modified or mismatched records.
- [ ] **SEC-01**: APIs validate inputs, authenticate protected operations, verify wallet ownership when required, and return safe errors.
- [ ] **SEC-02**: MongoDB credentials, RPC credentials, deployment keys, session secrets, and admin configuration remain in environment variables and out of Git.
- [ ] **SEC-03**: The deployed application uses HTTPS and appropriate content, framing, referrer, and camera security headers.
- [ ] **SEC-04**: Automated tests cover critical membership, governance, treasury, attendance, replay, duplicate, and authorization failure paths.

### Production Deployment

- [ ] **DEP-01**: The four contracts deploy to Polygon Amoy in the documented dependency order with correct roles and cross-contract addresses.
- [ ] **DEP-02**: The application connects to Polygon Amoy through Alchemy Free Tier and guides users to the correct chain without using real funds.
- [ ] **DEP-03**: Netlify builds the GitHub source and serves the application through a public HTTPS URL using configured environment variables.
- [ ] **DEP-04**: MongoDB Atlas Free Cluster stores production operational data with required uniqueness and expiry indexes.
- [ ] **DEP-05**: The public deployment passes the complete member-registration → proposal → vote → treasury → event → attendance → integrity workflow.
- [ ] **DEP-06**: Deployment evidence confirms hosting, database, RPC, blockchain, authentication, QR, HTTPS, source control, and domain costs remain ₹0 within documented free-tier limits.

## v2 Requirements

None. The source PRD declares one complete v1 deployment scope and no separate MVP or deferred product tier.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-money or mainnet treasury | The academic project must use valueless Polygon Amoy Test POL |
| NFT achievement badges | Not required to prove governance or attendance integrity |
| Governance cryptocurrency | One-wallet-one-member governance is the required model |
| Quadratic or delegated voting | Explicitly excluded by the PRD |
| IPFS | MongoDB is the required efficient off-chain store |
| AI features | Unrelated to the project's core innovation |
| College timetable or OD integration | Institution integrations are outside the club DAO demonstration |
| Native Android or iOS applications | Responsive web is the required client |
| Multiple independent DAOs | v1 manages one college club |
| Paid custom domain | The Netlify subdomain satisfies public HTTPS access |
| Fiat payments | The treasury is testnet-only |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PLAT-01 | Phase 1 | Pending |
| PLAT-02 | Phase 1 | Pending |
| PLAT-03 | Phase 1 | Pending |
| PLAT-04 | Phase 1 | Pending |
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| MEM-01 | Phase 2 | Pending |
| MEM-02 | Phase 2 | Pending |
| MEM-03 | Phase 2 | Pending |
| MEM-04 | Phase 2 | Pending |
| MEM-05 | Phase 2 | Pending |
| GOV-01 | Phase 3 | Pending |
| GOV-02 | Phase 3 | Pending |
| GOV-03 | Phase 3 | Pending |
| GOV-04 | Phase 3 | Pending |
| GOV-05 | Phase 3 | Pending |
| GOV-06 | Phase 3 | Pending |
| GOV-07 | Phase 3 | Pending |
| GOV-08 | Phase 3 | Pending |
| GOV-09 | Phase 3 | Pending |
| GOV-10 | Phase 3 | Pending |
| GOV-11 | Phase 3 | Pending |
| GOV-12 | Phase 3 | Pending |
| TRY-01 | Phase 4 | Pending |
| TRY-02 | Phase 4 | Pending |
| TRY-03 | Phase 4 | Pending |
| TRY-04 | Phase 4 | Pending |
| TRY-05 | Phase 4 | Pending |
| EVT-01 | Phase 5 | Pending |
| EVT-02 | Phase 5 | Pending |
| EVT-03 | Phase 5 | Pending |
| EVT-04 | Phase 5 | Pending |
| ATT-01 | Phase 6 | Pending |
| ATT-02 | Phase 6 | Pending |
| ATT-03 | Phase 6 | Pending |
| ATT-04 | Phase 6 | Pending |
| ATT-05 | Phase 6 | Pending |
| ATT-06 | Phase 6 | Pending |
| ATT-07 | Phase 6 | Pending |
| ATT-08 | Phase 6 | Pending |
| INT-01 | Phase 7 | Pending |
| INT-02 | Phase 7 | Pending |
| INT-03 | Phase 7 | Pending |
| INT-04 | Phase 7 | Pending |
| INT-05 | Phase 7 | Pending |
| SEC-01 | Phase 7 | Pending |
| SEC-02 | Phase 7 | Pending |
| SEC-03 | Phase 7 | Pending |
| SEC-04 | Phase 7 | Pending |
| DEP-01 | Phase 8 | Pending |
| DEP-02 | Phase 8 | Pending |
| DEP-03 | Phase 8 | Pending |
| DEP-04 | Phase 8 | Pending |
| DEP-05 | Phase 8 | Pending |
| DEP-06 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 55 total
- Mapped to phases: 55
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-24*
*Last updated: 2026-07-24 after initial PRD ingestion and roadmap mapping*
