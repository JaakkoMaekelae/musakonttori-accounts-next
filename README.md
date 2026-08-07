# @musakonttori/accounts-next

Next.js App Router adapter for Musakonttori Accounts — server helpers, session plumbing and token
verification for the platform's RS256 JWT identity service.

**Documentation:** [Architecture](docs/architecture.md) · [Disaster recovery](docs/disaster-recovery.md) ·
[Accounts service](../musakonttori-accounts/README.md) ·
[Framework-agnostic SDK](../musakonttori-accounts-client/README.md) ·
[Ecosystem architecture](../MUSAKONTTORI_ARCHITECTURE.md)

## Installation

```bash
pnpm add github:JaakkoMaekelae/musakonttori-accounts-next#main
```

Consumed by Soundstage, HQ, Links, LiveGuide, Market, Promo, SoundLaunch, Stageflow and Ticketing.

## What It Does

```
Product (Next.js App Router)
  └─ @musakonttori/accounts-next
       ├─ reads the mk-session cookie (httpOnly, 7 d) holding the 24 h user JWT
       ├─ mints the product's short-lived service JWT (SERVICE_JWT_PRIVATE_KEY, 5 min)
       ├─ calls Accounts with X-User-Token + Authorization headers
       │    └─ /api/me for the session, /api/auth/refresh near expiry
       └─ exposes server helpers to Server Components, Server Actions and route handlers
```

**Tokens are not verified locally.** `getSession()` calls `/api/me` on every session read; the RS256
signature is checked inside Accounts. So an Accounts outage signs users out of every product on the next
page load — there is no offline validation path. Adding local verification with a distributed public key
is the top open improvement for this package.

## Environment

| Variable | Description |
|----------|-------------|
| `ACCOUNTS_API_URL` | Base URL of the Accounts service |
| `ACCOUNTS_SERVICE_NAME` | This product's registered service name |
| `SERVICE_JWT_PRIVATE_KEY` | RS256 private key used to sign the 5-minute service JWT |

## Development

```bash
pnpm build       # tsup → dist/
pnpm typecheck   # tsc --noEmit
```

## Release Discipline

This package sits in the authentication path of at least eight products and is installed from a moving
`#main` branch. **A merge here is a production change in every consumer** on their next deploy, staggered
over hours — which makes it look like several unrelated incidents.

- Revert on `main` first; do not fix forward while products are failing.
- Verify against one product from each auth pattern before merging: Clerk satellite + Accounts
  (Stageflow, SoundLaunch, Promo), Accounts only (Soundstage), HQ-integrated (Links, Market, Ticketing).
- Support dual public keys during an Accounts key rotation — without it, every rotation becomes a
  platform-wide forced logout.
- Pinning consumers to tags is the recorded follow-up. See [docs/disaster-recovery.md](docs/disaster-recovery.md).
