# Architecture — @musakonttori/accounts-next

**Product:** Next.js adapter for the Musakonttori Accounts identity service — server helpers, session
plumbing and token verification for App Router applications
**Consumers:** Soundstage, HQ (dependency present), Links, LiveGuide, Market, Promo, SoundLaunch,
Stageflow, Ticketing

> Ecosystem context: [MUSAKONTTORI_ARCHITECTURE.md](../../MUSAKONTTORI_ARCHITECTURE.md) ·
> Service: `musakonttori-accounts/docs/architecture.md` ·
> Recovery: [docs/disaster-recovery.md](./disaster-recovery.md)

---

## 1. Measured Stack

| Item | Value |
|------|-------|
| Build | tsup → `dist/` |
| Runtime deps | none of consequence — the adapter is thin by design |
| Distribution | `github:JaakkoMaekelae/musakonttori-accounts-next#main` (Promo uses a `file:` link) |
| Package manager | pnpm 11.18.0 |
| Scripts | `build`, `typecheck` |

---

## 2. Role in the Platform

```
Product (Next.js App Router)
  └─ @musakonttori/accounts-next
       ├─ read the mk-session cookie (httpOnly, 7 d) holding the 24 h user JWT
       ├─ mint the product's short-lived service JWT (SERVICE_JWT_PRIVATE_KEY, 5 min)
       ├─ call Accounts over HTTP with X-User-Token + Authorization headers
       │    └─ /api/me for the session, /api/auth/refresh when the token nears expiry
       └─ expose server helpers to Server Components / Server Actions / route handlers
```

The adapter is what makes the identity contract uniform across nine products.

**It does not verify tokens locally.** `getSession()` in `src/session.ts` resolves a session by calling
`/api/me` through `@musakonttori/accounts-client`; the RS256 signature is checked inside Accounts with
`ACCOUNTS_JWT_PUBLIC_KEY`. Products never hold that key. The consequence is platform-wide: when Accounts
is unreachable, every product reports a null session and users appear signed out on the next page load.

Adding local verification here — accept the user JWT against a distributed public key, call Accounts
only for permission checks and refresh — is the single highest-value change available to this package.
It would turn an Accounts outage into a degraded state instead of a platform-wide logout, and it is a
precondition for any transparent signing-key rotation.

---

## 3. Blast Radius

This package sits in the authentication path of at least eight products and is installed from a moving
`#main` branch. A merge here becomes a production change in every consumer on their next install or
deploy — staggered over hours, which makes it look like several unrelated incidents rather than one.

Two consequences the platform should act on:

1. **Pin consumers to tags or commit SHAs.** A moving branch in the auth path is an un-reviewed deploy.
2. **Support dual public keys.** Accounts key rotation is only transparent if the adapter can accept the
   old and new public keys during the rotation window. Without it, every rotation is a forced logout
   across the platform.

---

## 4. Verification Matrix

Any change here should be verified against one product from each auth pattern before it ships:

| Pattern | Representative product |
|---------|-----------------------|
| Clerk satellite + Accounts | Stageflow, SoundLaunch, Promo |
| Accounts only | Soundstage |
| HQ-integrated | Links, Market, Ticketing |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-08-07 | Engineering | Initial measured architecture |
