---
type: testing-strategy
status: source-of-truth
owner: Musakonttori
applies_to:
  - Stageflow
  - Ticketing
  - LiveGuide
  - SmartLink
  - Market
  - SoundLaunch
  - Mastering
  - Musakonttori HQ
last_updated: 2026-08-12
---

# Musakonttori Testing Strategy

## Purpose

This document defines how tests must be designed, written, reviewed, executed and maintained across every Musakonttori project.

The goal is not simply to increase test coverage.

The goal is to make every product:

- safe to change
- easy to refactor
- resistant to regressions
- reliable in production
- testable before release
- observable after release
- consistent across the product ecosystem

This document is the **source of truth for testing standards**.

Related:

- [[00 Musakonttori HQ]]
- [[02 Shared Platform]]
- [[10 Stageflow]]
- [[11 Ticketing]]
- [[12 LiveGuide]]
- [[13 SmartLink]]
- [[14 Market]]
- [[15 SoundLaunch]]
- [[16 Mastering]]

---

# 1. Core Testing Principle

Every feature must be tested at the lowest useful level and at the highest critical user-flow level.

Use this order:

1. Unit tests
2. Domain/service tests
3. Integration tests
4. API tests
5. Component tests
6. End-to-end tests
7. Contract tests
8. Security tests
9. Accessibility tests
10. Performance tests
11. Production monitoring / synthetic checks

Do not rely only on E2E tests.

Do not rely only on unit tests.

Critical business flows must always have end-to-end coverage.

---

# 2. Definition of Tested

A feature is not considered complete until:

- [ ] Happy path is tested
- [ ] Validation errors are tested
- [ ] Permission checks are tested
- [ ] Unauthorized access is tested
- [ ] Empty states are tested
- [ ] Loading states are tested
- [ ] Error states are tested
- [ ] Relevant edge cases are tested
- [ ] Analytics events are tested where applicable
- [ ] Audit events are tested where applicable
- [ ] API contracts are tested where applicable
- [ ] Cross-product integrations are tested where applicable
- [ ] Critical user flow has an E2E test
- [ ] Tests pass in CI
- [ ] No flaky tests are introduced

---

# 3. Test Pyramid

Recommended test distribution:

## Unit / Domain Tests

Approximately 50–60%

Use for:

- calculations
- permissions
- validation
- transformations
- business rules
- pricing
- inventory logic
- entitlements
- status transitions
- helper functions

## Integration Tests

Approximately 25–35%

Use for:

- database interactions
- repositories
- API handlers
- external adapters
- background jobs
- event processing
- billing flows
- webhook processing

## End-to-End Tests

Approximately 10–20%

Use for:

- login
- onboarding
- checkout
- publishing
- purchasing
- ticket scanning
- event operations
- final delivery
- admin support workflows

The percentages are guidance, not hard requirements.

Business risk determines the required depth.

---

# 4. Required Test Layers

## Unit Tests

Every reusable business rule should have unit tests.

Examples:

- ticket price calculation
- VAT calculation
- discount eligibility
- feature entitlement
- role permission checks
- inventory availability
- SmartLink scheduling
- LiveGuide alert severity mapping
- mastering credit calculations

Unit tests must:

- be deterministic
- avoid network access
- avoid real databases
- run quickly
- test one responsibility

---

# 5. Domain / Service Tests

Business services should be tested independently from UI.

Examples:

- createTicketOrder()
- publishSmartLink()
- calculatePayout()
- createLiveGuideAlert()
- distributeRelease()
- createMasteringJob()

Test:

- valid inputs
- invalid inputs
- boundary values
- state transitions
- authorization
- failure recovery

---

# 6. Database Integration Tests

Test against a real test database when database behavior matters.

Required for:

- RLS / tenant isolation
- transactions
- unique constraints
- foreign keys
- inventory locks
- seat reservations
- idempotency
- database triggers
- queue persistence
- audit logs

Tests must verify:

- user A cannot read user B data
- organization A cannot modify organization B data
- failed transactions roll back correctly
- concurrent operations remain consistent

---

# 7. API Tests

Every public or internal API endpoint must have tests for:

- [ ] Success
- [ ] Authentication missing
- [ ] Authentication invalid
- [ ] Permission denied
- [ ] Invalid input
- [ ] Missing resource
- [ ] Conflict
- [ ] Rate limiting where relevant
- [ ] Idempotency where relevant
- [ ] Expected response schema
- [ ] Error response schema

---

# 8. Contract Tests

Cross-product integrations must use contract tests.

Examples:

- Stageflow → Ticketing
- Ticketing → LiveGuide
- Mastering → SoundLaunch
- SoundLaunch → SmartLink
- Market → HQ
- All products → Shared Platform

Contract tests must validate:

- endpoint schemas
- event payloads
- webhook payloads
- required fields
- backwards compatibility
- enum compatibility
- version compatibility

A product must not silently break another product.

---

# 9. Component Tests

Interactive UI components should be tested for behavior.

Examples:

- forms
- modals
- dropdowns
- date pickers
- ticket selectors
- SmartLink blocks
- schedule editor
- audio player controls

Test:

- rendering
- user input
- validation
- keyboard interaction
- disabled states
- loading
- errors
- permission-based visibility

---

# 10. End-to-End Testing

Every critical customer journey must have an E2E test.

E2E tests should simulate real user behavior.

Use stable selectors such as:

`data-testid`

or semantic accessible selectors.

Avoid selectors tied to styling.

---

# 11. Smoke Tests

Every production deployment should run critical smoke tests.

Minimum:

- [ ] Application loads
- [ ] Login works
- [ ] API health works
- [ ] Database connection works
- [ ] Core dashboard loads
- [ ] Critical product action works

Product-specific smoke tests are listed later in this document.

---

# 12. Regression Tests

Every fixed production bug must add a regression test whenever technically possible.

Rule:

> A bug should ideally only be fixed once.

Process:

1. Reproduce bug
2. Write failing test
3. Fix bug
4. Verify test passes
5. Keep test permanently

---

# 13. Test Naming Convention

Use descriptive names.

Good:

`should reject ticket purchase when shared inventory is exhausted`

Bad:

`ticket test 1`

Recommended pattern:

`should [expected behavior] when [condition]`

Examples:

- should deny access when organization role lacks finance permission
- should release reserved credits when mastering job fails
- should invalidate old QR after ticket transfer
- should hide scheduled SmartLink block after end date

---

# 14. Test File Naming

Examples:

```text
feature.ts
feature.test.ts
feature.integration.test.ts
feature.e2e.ts
feature.contract.test.ts
```

Possible project structure:

```text
src/
  modules/
    tickets/
      ticket-service.ts
      ticket-service.test.ts

tests/
  integration/
  e2e/
  contract/
  performance/
```

---

# 15. Test Data Strategy

Never use production customer data in automated tests.

Create deterministic fixtures.

Required fixture types:

- user
- organization
- admin
- product
- event
- ticket
- order
- customer
- SmartLink
- LiveGuide event
- release
- mastering project

Tests should create only the data they need.

---

# 16. Test Factories

Create reusable test factories.

Examples:

```text
createTestUser()
createTestOrganization()
createTestArtist()
createTestEvent()
createTestTicketType()
createTestOrder()
createTestSmartLink()
createTestStore()
createTestLiveGuide()
createTestRelease()
createTestMasteringProject()
```

Factories should support overrides.

---

# 17. Test Environments

Required:

## Local

Developer tests.

## CI

Automated isolated environment.

## Staging

Production-like integration testing.

## Production

Only safe smoke/synthetic monitoring.

Never run destructive test suites against production.

---

# 18. CI Test Pipeline

Recommended pull request pipeline:

```text
Install
↓
Type Check
↓
Lint
↓
Unit Tests
↓
Integration Tests
↓
Contract Tests
↓
Build
↓
Component Tests
↓
E2E Critical Tests
↓
Security Checks
```

Deployment pipeline:

```text
Build
↓
Deploy Staging
↓
Staging E2E
↓
Smoke Tests
↓
Production Deployment
↓
Production Smoke Tests
↓
Monitoring
```

---

# 19. Pull Request Requirements

A PR should not be mergeable when:

- TypeScript fails
- lint fails
- required tests fail
- build fails
- critical E2E tests fail
- migration validation fails
- contract tests fail

PR checklist:

- [ ] Tests added
- [ ] Existing tests updated
- [ ] New edge cases covered
- [ ] Permissions tested
- [ ] Analytics updated
- [ ] Audit events updated
- [ ] API contracts updated
- [ ] Documentation updated

---

# 20. Coverage

Coverage must be used as a safety signal, not as a vanity metric.

Recommended minimum:

## Critical domain logic

90%+ line/branch coverage target

## General business logic

80%+

## UI

Focus on behavior rather than arbitrary line coverage.

Critical untested business logic is unacceptable even if global coverage appears high.

---

# 21. Risk-Based Testing

Classify features:

## Critical

Failure may cause:

- money loss
- duplicate orders
- overselling
- unauthorized access
- payout errors
- emergency communication failure
- audio/file loss

Testing requirements:

- unit
- integration
- E2E
- failure tests
- security tests
- monitoring

## High

Important customer-facing feature.

Require:

- unit/domain
- integration
- E2E

## Medium

Require:

- unit/component
- integration where needed

## Low

Presentation-only changes may use:

- component tests
- visual review

---

# 22. Permission Testing

Every protected resource must be tested against roles.

Test:

- owner
- admin
- manager
- editor
- viewer
- unauthorized user
- wrong organization

Critical rule:

> UI hiding is not authorization.

Backend authorization must always be tested.

---

# 23. Tenant Isolation Tests

Every multi-tenant product must include automated isolation tests.

Scenario:

Organization A owns Resource A.

Organization B attempts:

- read
- update
- delete

Expected:

- denied

This applies to:

- Stageflow
- Ticketing
- LiveGuide
- SmartLink
- Market
- SoundLaunch
- Mastering
- HQ

---

# 24. Impersonation Tests

Super Admin impersonation requires dedicated tests.

Test:

- only authorized admin can impersonate
- reason is required
- audit event is created
- impersonation banner appears
- admin can exit session
- nested impersonation fails
- sensitive actions remain blocked
- elevated impersonation requires re-authentication
- original admin identity is preserved

---

# 25. Billing Tests

Test:

- subscription creation
- upgrade
- downgrade
- cancellation
- renewal
- trial
- failed payment
- invoice
- VAT
- refund
- entitlement updates

Never rely on payment provider UI alone.

---

# 26. Entitlement Tests

Test:

- plan entitlement
- add-on entitlement
- marketplace purchase
- trial
- expired entitlement
- admin override
- revoked entitlement
- organization entitlement

---

# 27. Webhook Tests

For every webhook:

- valid signature
- invalid signature
- duplicate event
- old event
- malformed payload
- provider retry
- application retry
- idempotency
- failed processing
- successful processing

---

# 28. Background Job Tests

Test:

- job creation
- worker execution
- success
- failure
- retry
- max retries
- cancellation
- duplicate jobs
- idempotency
- dead-letter behavior

---

# 29. Migration Tests

Every database migration should be tested for:

- migration succeeds
- application builds after migration
- old data remains valid
- constraints work
- indexes exist
- backwards compatibility during rollout where needed

For critical migrations:

- rollback procedure documented
- migration tested on staging snapshot

---

# 30. Security Tests

Automate:

- dependency vulnerability scanning
- secrets scanning
- authorization tests
- authentication tests
- rate-limit tests
- input validation
- file-upload validation

Periodically perform:

- penetration testing
- privilege escalation testing
- tenant isolation review
- API security review

---

# 31. File Upload Tests

Required for products using uploads.

Test:

- allowed type
- invalid type
- oversized file
- corrupt file
- malicious file
- duplicate
- interrupted upload
- resume
- unauthorized access
- expired signed URL

---

# 32. Accessibility Tests

Target WCAG 2.2 AA.

Automated:

- accessibility scanner
- semantic form labels
- obvious contrast issues
- ARIA misuse

Manual:

- keyboard navigation
- screen reader
- focus order
- modal behavior
- error messaging
- zoom/text scaling

Critical user flows must be keyboard usable.

---

# 33. Visual Regression Tests

Use for stable visual surfaces such as:

- checkout
- ticket
- SmartLink preview
- LiveGuide home
- Market storefront
- SoundLaunch release flow
- mastering player

Do not make visual snapshots so broad that normal changes create constant noise.

---

# 34. Responsive Tests

Required breakpoints:

- small mobile
- large mobile
- tablet
- desktop
- wide desktop where relevant

Critical flows must work on mobile.

---

# 35. Browser Tests

Minimum target:

- Chrome
- Safari
- Firefox
- Edge

Mobile:

- iOS Safari
- Android Chrome

---

# 36. Performance Tests

Test:

- page performance
- API latency
- database query performance
- high concurrency
- queue throughput
- upload/download performance

Set product-specific thresholds.

---

# 37. Load Tests

Required for high-load systems.

Especially:

- Ticketing onsales
- Ticket check-in
- LiveGuide during festivals
- SmartLink campaign spikes
- Market campaigns
- SoundLaunch batch jobs
- Mastering processing queues

---

# 38. Failure Injection

Critical systems should be tested when dependencies fail.

Examples:

- payment provider unavailable
- email provider unavailable
- webhook delayed
- database slow
- queue unavailable
- external API timeout
- storage failure
- audio worker crashes

System should fail safely.

---

# 39. Observability Tests

Verify important failures create:

- structured log
- error event
- correlation ID
- alert where required
- HQ visibility where required

---

# 40. Analytics Event Tests

Test critical analytics events.

Examples:

- event viewed
- ticket checkout started
- ticket purchased
- SmartLink clicked
- Market order completed
- LiveGuide opened
- mastering completed

Validate:

- event name
- required properties
- no prohibited PII
- duplicate prevention where relevant

---

# 41. Audit Log Tests

Critical actions must generate audit events.

Examples:

- permission changes
- refunds
- payouts
- ticket cancellations
- account suspension
- impersonation
- emergency alert
- billing override
- entitlement override

---

# 42. Localization Tests

Test:

- supported languages
- missing translation fallback
- date formatting
- time formatting
- currency
- pluralization
- layout overflow

---

# 43. Timezone Tests

Especially:

- events
- ticket sale start/end
- LiveGuide schedules
- SmartLink scheduling
- release scheduling

Test DST transitions and cross-timezone users where relevant.

---

# 44. Feature Flag Tests

Test:

- disabled
- enabled
- organization override
- user override
- country override
- percentage rollout
- fallback behavior

---

# 45. Release Testing

Before production release:

- [ ] CI green
- [ ] Staging deployment successful
- [ ] Critical E2E green
- [ ] Smoke tests green
- [ ] New migrations verified
- [ ] Feature flags verified
- [ ] Monitoring ready
- [ ] Rollback path known

---

# 46. Post-Deployment Testing

Immediately after production deployment:

- [ ] Homepage loads
- [ ] Login works
- [ ] Critical API works
- [ ] Core user flow works
- [ ] Error rate normal
- [ ] Latency normal
- [ ] Background workers healthy
- [ ] External integrations healthy

---

# 47. Test Ownership

Tests belong to the team that owns the feature.

Developers are responsible for:

- unit tests
- integration tests
- API tests
- contract tests

Product/QA should define:

- acceptance cases
- E2E scenarios
- exploratory scenarios

Security-critical features require security review.

---

# 48. No Flaky Test Policy

Flaky tests must not become normal.

If a test is flaky:

1. create issue
2. identify cause
3. fix immediately where possible
4. quarantine only temporarily
5. never permanently ignore a critical test

Track flaky-test rate.

---

# 49. Test Review

Code review should ask:

- What can break?
- What happens with invalid input?
- What happens if dependency fails?
- What happens concurrently?
- Can another tenant access this?
- Is the action idempotent?
- Does this need an audit event?
- Does this require E2E coverage?

---

# PROJECT-SPECIFIC TEST PLANS

# 50. Stageflow Testing

## Critical E2E

- [ ] User registration/login
- [ ] Artist creation
- [ ] Artist claim
- [ ] Artist follow
- [ ] Event creation
- [ ] Event publishing
- [ ] Festival creation
- [ ] Venue management
- [ ] Booking request
- [ ] Fan CRM access
- [ ] Company role permissions
- [ ] Super Admin impersonation

## Critical Domain Tests

- artist ownership
- claim state transitions
- follow state
- event visibility
- booking permissions
- fan segmentation
- organization isolation

## Integration Tests

- Stageflow → Ticketing
- Stageflow → LiveGuide
- SmartLink fan signal → Stageflow
- Market commerce signals where used

## Performance

- global search
- event discovery
- large artist/fan datasets
- fan segmentation

---

# 51. Ticketing Testing

Ticketing has the strictest transactional requirements.

## Critical E2E

- [ ] Create event
- [ ] Configure ticket
- [ ] Purchase ticket
- [ ] Failed payment recovery
- [ ] Receive QR ticket
- [ ] Transfer ticket
- [ ] Official resale
- [ ] Refund
- [ ] Waiting list
- [ ] Check-in
- [ ] Offline scanning
- [ ] Organizer payout view

## Critical Concurrency Tests

- last ticket purchased simultaneously
- same seat selected by multiple users
- shared inventory pool
- payment completes after reservation timeout
- duplicate payment webhook
- duplicate order creation
- ticket transfer during resale
- duplicate scan

## Load Tests

Simulate:

- high-demand ticket launch
- virtual waiting room
- thousands of check-ins
- sudden payment traffic spike

## Security

- QR forgery
- ticket ID guessing
- account takeover
- purchase-limit bypass
- organizer data isolation
- payout authorization

---

# 52. LiveGuide Testing

## Critical E2E

- [ ] Event creation
- [ ] Schedule publishing
- [ ] Map publishing
- [ ] Visitor opens guide
- [ ] Personal schedule
- [ ] Real-time alert
- [ ] Push notification
- [ ] Vendor status update
- [ ] Queue update
- [ ] Emergency mode
- [ ] Offline mode
- [ ] Return online and sync

## Emergency Tests

Test separately:

- authorized emergency alert
- unauthorized alert rejected
- confirmation required
- full audit trail
- emergency home override
- offline safety information

## Load Tests

Simulate:

- festival opening
- headline artist schedule lookup
- emergency alert to large audience
- map traffic spike

## Poor Network Tests

- slow 3G
- intermittent connection
- offline
- background sync

---

# 53. SmartLink Testing

## Critical E2E

- [ ] Create SmartLink
- [ ] Add block
- [ ] Drag/reorder
- [ ] Save
- [ ] Preview
- [ ] Publish
- [ ] Custom domain
- [ ] Form submission
- [ ] Analytics event
- [ ] Marketplace purchase
- [ ] Install purchased block/theme
- [ ] A/B test

## Builder Tests

- undo
- redo
- duplicate block
- responsive styles
- corrupted configuration
- unsupported widget
- marketplace entitlement

## Publishing Tests

- draft
- publish
- rollback
- scheduled publish
- scheduled unpublish
- CDN/cache invalidation

## Security

- custom HTML/script sanitization
- file uploads
- custom domains
- third-party widget permissions

---

# 54. Market Testing

## Critical E2E

- [ ] Create store
- [ ] Add product
- [ ] Add variant
- [ ] Inventory
- [ ] Customer adds cart
- [ ] Checkout
- [ ] Payment
- [ ] Order
- [ ] Fulfillment
- [ ] Shipment
- [ ] Refund
- [ ] Return

## Critical Concurrency

- two customers buy last item
- reservation expiry
- stock adjustment during order
- partial fulfillment
- partial refund
- subscription renewal

## Pricing Tests

- VAT
- discounts
- customer groups
- B2B pricing
- currency
- shipping
- bundles

## Marketplace Mode

- multi-seller order split
- commission
- seller payout
- seller-specific refund

---

# 55. SoundLaunch Testing

## Critical E2E

- [ ] Create release
- [ ] Add track
- [ ] Add metadata
- [ ] Upload artwork
- [ ] Upload master
- [ ] Validate release
- [ ] Submit release
- [ ] Deliver release
- [ ] Receive DSP status
- [ ] Correct metadata
- [ ] Takedown

## Metadata Tests

- artist credits
- contributors
- identifiers
- release dates
- territories
- explicit flags
- language
- duplicate recordings

## Delivery Tests

- accepted
- rejected
- retry
- partial DSP failure
- provider timeout
- duplicate delivery prevention

## Integration

- Mastering → SoundLaunch
- SoundLaunch → SmartLink
- SoundLaunch → Stageflow artist identity

---

# 56. Mastering Testing

## Critical E2E

- [ ] Upload audio
- [ ] Analyze mix
- [ ] Generate preview
- [ ] Generate master
- [ ] A/B compare
- [ ] Adjust settings
- [ ] Generate new version
- [ ] QC
- [ ] Approve
- [ ] Export
- [ ] Send to SoundLaunch

## Audio Tests

Create reference fixtures with known properties.

Test detection of:

- clipping
- headroom
- loudness
- true peak
- silence
- stereo phase
- DC offset

## DSP Regression Tests

For fixed test audio:

- processor does not crash
- output remains finite
- no NaN/Inf samples
- peak constraints respected
- processing remains reproducible by version

Do not require bit-perfect equality across intentionally changed DSP versions.

## Worker Tests

- job queue
- worker crash
- retry
- credit reservation
- failure releases credits
- successful render captures credits

## Privacy

- source audio unauthorized access
- signed URL expiration
- admin audio access auditing

---

# 57. Musakonttori HQ Testing

## Critical E2E

- [ ] Super Admin login
- [ ] Global search
- [ ] Customer 360
- [ ] Organization 360
- [ ] Product context switch
- [ ] Support case
- [ ] Safe impersonation
- [ ] Exit impersonation
- [ ] Entitlement override
- [ ] Feature flag
- [ ] Error center
- [ ] System health

## Cross-Product Tests

Verify HQ receives data from:

- Stageflow
- Ticketing
- LiveGuide
- SmartLink
- Market
- SoundLaunch
- Mastering

## Security

HQ requires especially strong:

- MFA
- role checks
- audit tests
- impersonation restrictions
- finance permission tests
- data access boundaries

---

# 58. Shared Platform Testing

Shared platform changes have the highest blast radius.

Required:

- identity tests
- organization tests
- RBAC tests
- entitlements
- billing
- notifications
- audit
- API keys
- feature flags

Before releasing a shared platform change:

- [ ] Shared platform tests pass
- [ ] Stageflow contract tests pass
- [ ] Ticketing contract tests pass
- [ ] LiveGuide contract tests pass
- [ ] SmartLink contract tests pass
- [ ] Market contract tests pass
- [ ] SoundLaunch contract tests pass
- [ ] Mastering contract tests pass

---

# 59. Minimum Smoke Suite Per Product

## Stageflow

- login
- artist page
- event page
- search

## Ticketing

- event page
- ticket availability
- checkout initialization
- scanner API

## LiveGuide

- guide opens
- schedule loads
- map loads
- alerts load

## SmartLink

- public SmartLink loads
- editor loads
- publish endpoint works

## Market

- storefront loads
- product loads
- cart works
- checkout initializes

## SoundLaunch

- catalog loads
- release editor loads
- delivery service health

## Mastering

- upload endpoint
- analysis worker
- mastering queue
- download service

## HQ

- admin login
- search
- system health

---

# 60. Feature Test Specification Template

Create a note for significant features using this template.

```markdown
---
type: test-plan
product:
feature:
risk: high
status: draft
---

# Feature Test Plan — FEATURE NAME

## Feature

## Risk Level

Critical / High / Medium / Low

## Happy Path

- [ ]

## Validation

- [ ]

## Permissions

- [ ]

## Tenant Isolation

- [ ]

## Edge Cases

- [ ]

## Failure Cases

- [ ]

## API Tests

- [ ]

## Integration Tests

- [ ]

## E2E Tests

- [ ]

## Security

- [ ]

## Accessibility

- [ ]

## Performance

- [ ]

## Analytics

- [ ]

## Audit Logs

- [ ]

## Regression Cases

- [ ]

## Monitoring

- [ ]

## Definition of Done

- [ ] All required tests implemented
- [ ] CI green
- [ ] Staging verified
- [ ] Monitoring verified
```

---

# 61. Bug Regression Template

```markdown
---
type: regression-test
product:
bug:
status: active
---

# Regression — BUG NAME

## Original Bug

## Root Cause

## Reproduction

1.
2.
3.

## Expected

## Regression Test

## Test Level

Unit / Integration / E2E / Contract

## Related Fix

## Related Incident
```

---

# 62. Release Test Report Template

```markdown
---
type: release-test-report
product:
release:
status:
---

# Release Test Report

## Release

## Build

## Unit

PASS / FAIL

## Integration

PASS / FAIL

## Contract

PASS / FAIL

## E2E

PASS / FAIL

## Accessibility

PASS / FAIL

## Security

PASS / FAIL

## Performance

PASS / FAIL

## Smoke

PASS / FAIL

## Known Issues

-

## Rollback Verified

- [ ]

## Release Decision

APPROVED / BLOCKED
```

---

# 63. Testing Dashboard Metrics

Track at organization / HQ level:

- test pass rate
- flaky test rate
- test duration
- critical E2E pass rate
- regression count
- production bugs
- escaped defects
- coverage of critical domain logic
- failed deployments due to tests
- mean time to repair broken tests

Do not optimize for maximum number of tests.

Optimize for production confidence.

---

# 64. Final Testing Rule

Every Musakonttori project should follow this development loop:

```text
Requirement
↓
Acceptance Criteria
↓
Risk Classification
↓
Test Cases
↓
Implementation
↓
Automated Tests
↓
Code Review
↓
CI
↓
Staging
↓
E2E
↓
Release
↓
Production Smoke Test
↓
Monitoring
↓
Regression Test for Every Escaped Bug
```

## Golden Rule

A feature is not done when it works once.

A feature is done when:

- it works
- its failures are understood
- its permissions are verified
- its critical behavior is automated in tests
- it can be changed later without fear
- production problems can be detected quickly

That should be the testing standard across the complete Musakonttori ecosystem.
