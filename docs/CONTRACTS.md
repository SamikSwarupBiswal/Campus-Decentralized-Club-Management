# Four contracts, four jobs

The contracts use Solidity 0.8.24. They deliberately avoid governance tokens, delegation, upgradeable proxies, and a large inherited Governor hierarchy. OpenZeppelin handles access control and reentrancy protection; club-specific rules remain visible in a small codebase.

## 1. MembershipRegistry — who can participate?

The manager registers or revokes a wallet. A mapping answers `isMember(wallet)` and a counter records the number of active wallets. There is no transfer function. Checked arithmetic updates the count.

The college must verify a student's identity before registering the wallet. This contract does not independently prove that two different wallets belong to different humans. It also has no wallet-recovery protocol.

## 2. CampusGovernor — what did the club decide?

A member creates a proposal containing a metadata fingerprint, recipient, amount, and voting duration in blocks. The contract captures the current member count for quorum. Each active member can vote once: `0 = NO`, `1 = YES`, `2 = ABSTAIN`.

After voting ends:

- At least 30% of the captured member count must have voted, including abstentions.
- At least 60% of YES plus NO votes must be YES.
- If both checks pass, anyone can execute the approved proposal once.

The code uses readable percentage constants (`30`, `60`) and multiplication by `100` to avoid rounding losses. For example, with 10 members, three participants reach quorum. Two YES and one NO gives 66.7% approval and passes. One YES alone fails quorum. Abstention-only participation cannot pass.

There is no administrator function for changing the result or thresholds. The proposal is marked executed before calling Treasury; if the transfer fails, the whole transaction rolls back.

**Membership caveat:** the member *count* is captured, not a historical list of eligible wallets. An administrator still controls registrations and revocations during voting. This is an institutional trust boundary, not full protection against a malicious membership administrator.

## 3. Treasury — can money leave?

Anyone can send Test POL in. Only the configured governor can call `execute`. The governor address can be set only once. The treasury checks the recipient, available balance, and replay flag before transferring native testnet currency. ReentrancyGuard protects the transfer path.

Unlike the previous main2 contract, this is an actual Test POL transfer, not an INR approval event or a simulated balance update. It must never hold real funds.

## 4. AttendanceRegistry — has the record changed?

An authorized finalizer stores one Keccak-256 attendance fingerprint for an event. An existing proof cannot be overwritten. `verifyAttendance` compares a supplied fingerprint with that original value. Raw attendance remains in MongoDB.

Hashing happens off-chain: normalize wallets, remove duplicates, sort, include the event ID, serialize, then Keccak-256. This intentionally follows Ethereum's native hashing convention. The proof detects later modifications; it cannot prove the original attendance was truthful.

## Deployment order

MembershipRegistry → Treasury → CampusGovernor → AttendanceRegistry. Then call `Treasury.setGovernor` once. The deploy script uses the deployer as initial administrator. Operational admin wallets need the relevant on-chain roles and the web server's admin allowlist.

## Signature login versus a transaction

Login signs a readable message and costs no gas. Voting and execution send transactions, require test POL, and become final only after a receipt. A login cookie gives API identity; it never gives the server the user's wallet key or permission to vote for them.
