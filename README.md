# Campus DAO

An animated club-governance website built with Next.js, TypeScript, Tailwind, Wagmi/viem, MongoDB, and four small Solidity contracts for Polygon Amoy.

`main2` follows the architecture from `main`. The previous Vite/Supabase simulation and its alternative PRD have been replaced. The original requirements are preserved in [docs/PRD.md](docs/PRD.md); [GSD planning](.planning/PROJECT.md) tracks unfinished product work.

## Run locally

```sh
npm ci
npm run dev
```

Open http://localhost:3000. The landing page links to `/dashboard`. Club pages currently contain labeled preview data; that content is not proof of a production deployment.

## Verify

```sh
npm run typecheck
npm run contracts:test
npx playwright install chromium
npx playwright test
npm run build
```

Browser tests exercise responsive navigation and real signature verification with an isolated test wallet/provider. They do not use a real MetaMask extension or deploy to a public network.

Verified on 2026-09-10: production build (Next.js 15.5.25), TypeScript checks, 11 contract tests, and 3 browser tests passed. See [desktop preview](docs/landing-desktop.png) and [mobile preview](docs/landing-mobile.png).

## Authentication

1. Connect MetaMask (or use its mobile in-app browser).
2. Switch to Polygon Amoy, chain ID 80002.
3. Sign a server-issued message bound to the site, wallet, nonce, and expiry.
4. The server verifies the signature, consumes the nonce once, and issues an HttpOnly session cookie.
5. Signing out deletes the server cookie and disconnects the wallet. Changing wallets clears a mismatched session.

Connecting a wallet is not login. Signing in is not membership approval. Administrative API operations also require the signed wallet to appear in `ADMIN_WALLETS`; contracts enforce their own manager/finalizer roles.

## Configuration

Copy `.env.example` to `.env.local` for the web app. Set a random `SESSION_SECRET` of at least 32 characters, `NEXT_PUBLIC_APP_URL` to the exact origin, and `ADMIN_WALLETS` to approved administrators. Configure `MONGODB_URI` and the four deployed contract addresses before using persistent writes and membership checks.

Production authentication refuses to run without MongoDB and a session secret. Local development may use process-local, short-lived nonces; these disappear on restart. No example member wallet is accepted as real on-chain membership.

Hardhat loads `.env` (or process environment). Keep `AMOY_RPC_URL` and `DEPLOYER_PRIVATE_KEY` there, never in browser variables. Run `npm run contracts:deploy` to deploy to Amoy with a funded testnet wallet. No real money is required.

`NEXT_PUBLIC_RPC_URL` is visible to browsers by design. If using a browser Alchemy key, restrict its allowed origins and methods. Never put private RPC credentials or deployer keys in `NEXT_PUBLIC_*` values.

Netlify uses `netlify.toml`. Configure its environment variables before deploying; no public deployment is claimed by this repository update.

## Contracts, explained

See [docs/CONTRACTS.md](docs/CONTRACTS.md) for a short explanation of all four contracts, percentage rules, deployment order, and limitations.

Implementation decision: proposal metadata, attendance fingerprints, event IDs, and Solidity role identifiers use Ethereum-native Keccak-256. HMAC-SHA-256 remains limited to signing server session cookies; it is not used as an on-chain content hash. This supersedes the PRD's SHA-256 content-hash wording.

## UI direction

True black, white, and neutral grey define the landing and workspace. The landing uses the interactive Compose proposal component supplied for this project, with restrained focus-ring motion and scroll reveals. Motion respects reduced-motion preferences.

## Remaining product work

The restored baseline still needs live data throughout the club pages, proposal metadata persistence and retrieval, complete admin registration/finalization transaction flows, and a public Atlas/Amoy/Netlify acceptance run. See [ROADMAP.md](.planning/ROADMAP.md). Sample proposal IDs must not be treated as an indexed view of a deployed governor.

Dependency review: compatible security updates moved Next.js to 15.5.25 and removed the reported critical advisories. The full dependency audit still reports 46 findings (11 low, 27 moderate, 8 high), including wallet-connector and Hardhat transitive dependencies. Breaking Wagmi/Hardhat upgrades were not applied. Resolve and reassess these before public deployment; passing functional tests is not a security certification.
