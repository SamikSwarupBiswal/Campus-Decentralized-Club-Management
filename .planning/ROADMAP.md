# Roadmap: Campus DAO

## Overview

Campus DAO begins this roadmap with a substantial application and smart-contract baseline already committed. The roadmap therefore treats file presence as evidence of a starting point, not completion: each phase closes and verifies one user-visible capability until the complete hybrid DAO runs through MongoDB Atlas, Alchemy, Polygon Amoy, and Netlify at zero mandatory cost.

## Phases

- [ ] **Phase 1: Reproducible Application Baseline** - Turn the existing source into a documented, responsive, consistently verifiable foundation.
- [ ] **Phase 2: Wallet Identity and Membership** - Prove wallet ownership and enforce one-wallet-one-member access across UI, API, and contracts.
- [ ] **Phase 3: Verifiable Governance** - Deliver proposal integrity, three-way voting, automatic outcomes, and single execution end to end.
- [ ] **Phase 4: DAO-Controlled Treasury** - Make Test POL balances and transfers transparent and exclusively governance-authorized.
- [ ] **Phase 5: Governed Event Operations** - Persist authorized events and connect operational activity to governance decisions.
- [ ] **Phase 6: Replay-Safe Attendance** - Complete the signed, expiring QR workflow with server verification and durable attendance history.
- [ ] **Phase 7: On-Chain Integrity and Security** - Finalize deterministic attendance proofs and harden critical failure paths.
- [ ] **Phase 8: Zero-Cost Production Deployment** - Deploy contracts and the web application, then prove the complete public workflow.

## Phase Details

### Phase 1: Reproducible Application Baseline
**Goal**: A developer and end user can reliably build, understand, and use the responsive application baseline before external services are introduced.
**Depends on**: Nothing (first phase)
**Requirements**: PLAT-01, PLAT-02, PLAT-03, PLAT-04
**Success Criteria** (what must be TRUE):
  1. A fresh checkout installs, type-checks, builds, and runs the contract suite using documented commands.
  2. Core member and admin pages remain usable at mobile, tablet, and desktop widths.
  3. Empty, loading, error, and transaction states explain what is happening and what the user can do next.
  4. The documented stack and local fallback mode require no paid dependency.
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [ ] 01-01: Audit the brownfield baseline, reproducibility, dependencies, and developer setup.
- [ ] 01-02: Close responsive accessibility and application-state feedback gaps.

### Phase 2: Wallet Identity and Membership
**Goal**: Students prove wallet ownership and only active, administrator-approved wallets receive club capabilities.
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, MEM-01, MEM-02, MEM-03, MEM-04, MEM-05
**Success Criteria** (what must be TRUE):
  1. A user can connect MetaMask, sign a one-time challenge, retain a secure session, and log out.
  2. An authorized administrator can register and revoke a member wallet.
  3. A non-member or revoked wallet is rejected by protected API and contract operations even if it calls them directly.
  4. A member can see the correct membership identity and directory without transferring that identity.
**Plans**: 3 plans
**UI hint**: yes

Plans:
- [ ] 02-01: Verify nonce-backed wallet authentication, session security, and logout.
- [ ] 02-02: Complete membership administration, contract roles, and persistence.
- [ ] 02-03: Enforce membership authorization across protected workflows and member UI.

### Phase 3: Verifiable Governance
**Goal**: Members can create, inspect, vote on, and execute proposals whose metadata and outcomes are independently verifiable.
**Depends on**: Phase 2
**Requirements**: GOV-01, GOV-02, GOV-03, GOV-04, GOV-05, GOV-06, GOV-07, GOV-08, GOV-09, GOV-10, GOV-11, GOV-12
**Success Criteria** (what must be TRUE):
  1. An active member can publish a proposal whose off-chain metadata matches its recorded on-chain hash.
  2. Users can browse proposal state, details, vote totals, participation, transactions, and integrity status.
  3. Each active member can submit one YES, NO, or ABSTAIN vote only during the voting window.
  4. The contract applies the 30% quorum and 60% approval rule without an administrator override.
  5. Only a successful proposal executes, and it executes no more than once.
**Plans**: 3 plans
**UI hint**: yes

Plans:
- [ ] 03-01: Complete proposal persistence, canonical metadata hashing, creation, and integrity checks.
- [ ] 03-02: Verify vote eligibility, timing, uniqueness, quorum, threshold, and state calculation.
- [ ] 03-03: Complete proposal browsing, transaction feedback, explorer evidence, and execution.

### Phase 4: DAO-Controlled Treasury
**Goal**: Test POL can move from the treasury only through an approved, transparent, single-use governance action.
**Depends on**: Phase 3
**Requirements**: TRY-01, TRY-02, TRY-03, TRY-04, TRY-05
**Success Criteria** (what must be TRUE):
  1. Any user can inspect the current treasury Test POL balance and transaction history.
  2. The treasury accepts Test POL while clearly stating that no real funds are managed.
  3. A successful proposal transfers only its authorized recipient and amount.
  4. Direct, early, failed, replayed, and reentrant withdrawal attempts are rejected.
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [ ] 04-01: Verify treasury wiring, funding, governed execution, and contract security invariants.
- [ ] 04-02: Connect live balances, histories, execution feedback, and explorer evidence to the treasury UI.

### Phase 5: Governed Event Operations
**Goal**: Administrators can manage durable events and members can trace those events back to relevant governance.
**Depends on**: Phase 2
**Requirements**: EVT-01, EVT-02, EVT-03, EVT-04
**Success Criteria** (what must be TRUE):
  1. An authorized administrator can create and update complete event records stored in MongoDB.
  2. A direct unauthenticated event mutation is rejected server-side.
  3. Members can browse upcoming events and view complete details on responsive pages.
  4. An event can show the proposal that authorized or funded it.
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [ ] 05-01: Complete the authorized MongoDB event model, validation, indexes, and API operations.
- [ ] 05-02: Connect event administration, browsing, details, and proposal relationships to live data.

### Phase 6: Replay-Safe Attendance
**Goal**: A verified student can prove presence with a short-lived wallet signature that cannot be replayed or duplicated.
**Depends on**: Phase 2, Phase 5
**Requirements**: ATT-01, ATT-02, ATT-03, ATT-04, ATT-05, ATT-06, ATT-07, ATT-08
**Success Criteria** (what must be TRUE):
  1. A member can request, sign, display, and refresh an event-specific QR challenge that expires after 60 seconds.
  2. An authorized administrator can scan the QR with a supported browser camera.
  3. The server rejects malformed, expired, wrong-event, wrong-wallet, non-member, and invalid-signature payloads.
  4. Reused nonces and duplicate event check-ins are rejected.
  5. A valid check-in appears once in durable attendance history.
**Plans**: 3 plans
**UI hint**: yes

Plans:
- [ ] 06-01: Harden challenge issuance, signing payloads, QR expiry, and regeneration.
- [ ] 06-02: Complete camera scanning, server verification, nonce consumption, and authorization.
- [ ] 06-03: Persist unique attendance records and deliver member/admin history views.

### Phase 7: On-Chain Integrity and Security
**Goal**: Finalized attendance and critical operations produce trustworthy evidence and withstand defined abuse cases.
**Depends on**: Phase 3, Phase 4, Phase 6
**Requirements**: INT-01, INT-02, INT-03, INT-04, INT-05, SEC-01, SEC-02, SEC-03, SEC-04
**Success Criteria** (what must be TRUE):
  1. The same event attendance set always produces the same canonical Keccak-256 hash regardless of input ordering or address casing.
  2. An authorized administrator can anchor one final attendance proof on Polygon Amoy.
  3. Users can recompute integrity and clearly see whether MongoDB data matches or differs from the on-chain proof.
  4. Protected APIs and contracts reject unauthorized, invalid, duplicate, replayed, and reentrant operations in automated tests.
  5. Production headers and secret handling expose no private configuration.
**Plans**: 3 plans
**UI hint**: yes

Plans:
- [ ] 07-01: Specify and test canonical attendance serialization and deterministic hashing.
- [ ] 07-02: Complete on-chain finalization, recomputation, and the integrity verification interface.
- [ ] 07-03: Expand API, contract, header, secret, and adversarial security validation.

### Phase 8: Zero-Cost Production Deployment
**Goal**: The complete Campus DAO workflow is publicly accessible and demonstrably operates on free-tier infrastructure.
**Depends on**: Phase 1 through Phase 7
**Requirements**: DEP-01, DEP-02, DEP-03, DEP-04, DEP-05, DEP-06
**Success Criteria** (what must be TRUE):
  1. All four contracts are deployed in dependency order on Polygon Amoy with verified roles, ownership, and recorded addresses.
  2. Netlify serves the GitHub application through public HTTPS with working Atlas, Alchemy, chain, and contract configuration.
  3. The complete registration-to-integrity workflow succeeds against production services and failures are documented with evidence.
  4. A deployment record shows that every mandatory service remains within a ₹0 plan and identifies its free-tier limits.
**Plans**: 3 plans

Plans:
- [ ] 08-01: Deploy and verify contracts, roles, ownership, addresses, and Alchemy Amoy connectivity.
- [ ] 08-02: Provision Atlas and Netlify configuration, indexes, secrets, and public HTTPS deployment.
- [ ] 08-03: Execute and document the complete production E2E and zero-cost acceptance run.

## Progress

**Execution Order:** Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Reproducible Application Baseline | 0/2 | Not started | - |
| 2. Wallet Identity and Membership | 0/3 | Not started | - |
| 3. Verifiable Governance | 0/3 | Not started | - |
| 4. DAO-Controlled Treasury | 0/2 | Not started | - |
| 5. Governed Event Operations | 0/2 | Not started | - |
| 6. Replay-Safe Attendance | 0/3 | Not started | - |
| 7. On-Chain Integrity and Security | 0/3 | Not started | - |
| 8. Zero-Cost Production Deployment | 0/3 | Not started | - |
