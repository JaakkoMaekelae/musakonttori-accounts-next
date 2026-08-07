# Disaster Recovery Plan — @musakonttori/accounts-next

**Product:** Next.js adapter for the Musakonttori Accounts identity service (server helpers, middleware,
session plumbing)
**Criticality:** Tier 1 by blast radius — installed from `#main` by Soundstage, HQ, Links, Stageflow,
Market, Promo, SoundLaunch and LiveGuide
**Distribution:** GitHub (`github:JaakkoMaekelae/musakonttori-accounts-next#main`), built with tsup

> Read together with [MUSAKONTTORI_DISASTER_RECOVERY_STANDARD.md](../../MUSAKONTTORI_DISASTER_RECOVERY_STANDARD.md),
> [musakonttori-accounts/docs/disaster-recovery.md](../../musakonttori-accounts/docs/disaster-recovery.md)
> and the sibling SDK plan in `musakonttori-accounts-client`.

---

## 1. Recovery Objectives

| Metric | Target | Rationale |
|--------|--------|-----------|
| **RPO** | 0 — all source is in git | No runtime state exists in a library. |
| **RTO** | 4 hours | Nothing here has uptime. The risk is a bad commit on `main` reaching eight products' authentication layer on their next deploy. |

---

## 2. Disaster Scenarios

### 2.1 Bad Commit on `main` Breaks Authentication Across Products

**Impact:** The largest single-commit blast radius in the ecosystem. This package sits in the auth path
of at least eight products and is installed from a moving branch, so a broken merge here can take down
sign-in everywhere the next time each product deploys — staggered over hours, which makes it look like
several unrelated incidents.

**Detection:** sign-in failures in multiple products with no changes of their own · middleware errors
after an unrelated deploy · build failures across repos following a merge here.

**Recovery procedure:**
1. Revert on `main` immediately. Do not fix forward — each passing minute is another product deploying
   the broken version.
2. Verify: `pnpm build && pnpm typecheck`.
3. Enumerate the consuming products and notify their owners. Products already on the bad version roll
   back their own deployment; products not yet deployed simply pick up the revert.
4. Confirm each product's sign-in works before closing the incident. "The library is fixed" is not the
   end state — "every product authenticates" is.
5. Fix properly on a branch afterwards, with at least one consuming product's auth suite run against it.

**Prevention:** pin consumers to tags or commit SHAs. A moving `#main` dependency in the authentication
path means library merges are un-reviewed production deploys across eight products.

---

### 2.2 Version Skew Between Adapter and Accounts Service

**Impact:** The adapter expects endpoints, claims or headers the service no longer provides. Symptoms
are silent auth failures rather than build errors — the hardest kind to diagnose because each product
reports it differently.

**Recovery procedure:**
1. Establish which side changed. The Accounts service owns the contract.
2. Check the claim shapes and header conventions documented in `musakonttori-accounts/README.md`
   (`Authorization: Bearer <service-jwt>`, `X-User-Token: Bearer <user-jwt>`).
3. Roll back whichever side moved, then re-sequence changes: service → adapter → products.

---

### 2.3 Public Key Rotation Handling

**Impact:** When the Accounts signing keypair rotates, this adapter is what verifies tokens inside each
product. If it cannot accept two public keys during the rotation window, key rotation becomes a
platform-wide forced logout instead of a transparent operation.

**Recovery procedure:**
1. During an Accounts key rotation, verify the adapter's dual-key acceptance path before the private key
   switches — see Section 4.2 of the Accounts plan.
2. If dual acceptance is not supported, the rotation must be scheduled as a planned maintenance window
   with a forced re-login, communicated in advance.
3. Adding dual-key support here is the fix that turns a platform incident into a routine operation.

---

### 2.4 GitHub Unavailable

**Impact:** Products cannot install. Existing deployments are unaffected.

**Recovery:** confirm at https://www.githubstatus.com; rely on lockfiles and warm package stores; vendor
`dist/` temporarily only if a deploy genuinely cannot wait, with a task filed to remove it.

---

## 3. Backup Strategy

| Asset | Method | Retention | Recovery |
|-------|--------|-----------|----------|
| Source code | GitHub + developer clones | Full history | `git clone` |
| Built `dist/` | Reproducible via `pnpm build` | — | Rebuild |
| Release history | Git tags and commits | Full history | `git checkout <tag>` |

---

## 4. Detailed Procedures

### 4.1 Emergency revert

```bash
git revert <bad-commit>
pnpm build && pnpm typecheck
# push to main, then notify every consuming product owner
```

### 4.2 Consumer verification matrix

After any change to this package, verify sign-in in at least one product from each auth pattern:
- Clerk satellite + Accounts (Stageflow, SoundLaunch, Promo)
- Accounts only (Soundstage)
- HQ-integrated products (Links, Market)

If those three pass, the remaining products are very likely fine. If any fails, none of them ship.

---

## 5. Communication

Notify product owners in `#incidents` with an explicit product list and the action each must take
(redeploy, roll back, or nothing).

---

## 6. Testing Schedule

| Drill | Frequency | Success criteria |
|-------|-----------|------------------|
| Emergency revert rehearsal | Annually | All consumers back on a good version within 4 h |
| Dual-key acceptance test | Before every Accounts key rotation | Both old and new public keys verify |
| Consumer verification matrix | Every release | Three representative products authenticate |
| Clean-clone build | Quarterly | Builds with no undocumented steps |

---

## 7. Recovery Checklist

- [ ] Revert on `main` first
- [ ] Verify build and typecheck
- [ ] Enumerate consuming products, notify owners with the action required
- [ ] Confirm sign-in works in each product before closing
- [ ] Fix on a branch with a real consumer test
- [ ] File the pinning follow-up if it is still open

---

## 8. Dependencies

| Dependency | Status page | Impact |
|------------|-------------|--------|
| GitHub | https://www.githubstatus.com | Products cannot install |
| Accounts service | Internal | Adapter is useless without it |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-08-07 | Engineering | Initial plan |
