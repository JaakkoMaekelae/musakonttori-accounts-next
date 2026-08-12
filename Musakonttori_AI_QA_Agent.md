---
type: ai-qa-strategy
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
---

# AI QA Agent — Autonomous Full Product Testing

## Goal

Build an AI-driven QA system that automatically explores every Musakonttori product like a real user, tests all visible functionality, detects broken or incomplete behavior, and produces a structured report.

The AI QA Agent must detect at minimum:

- broken links
- buttons that do nothing
- wrong redirects
- 404 pages
- 500 errors
- failed API requests
- JavaScript console errors
- missing images
- broken forms
- invalid validation
- dialogs that do not open
- dialogs that cannot close
- menus that do not work
- tabs that do not change content
- filters that do nothing
- sorting that does not work
- pagination errors
- duplicate submissions
- stale loading states
- empty pages
- inaccessible controls
- permission errors
- tenant isolation failures
- broken mobile layouts
- broken integrations
- incorrect state transitions
- placeholder/mock functionality
- UI-only features with no backend behavior

---

# 1. Core Architecture

Recommended stack:

- Playwright for browser automation
- TypeScript
- Chromium
- Firefox
- WebKit
- AI reasoning layer for exploratory testing
- API/network interception
- Browser console capture
- screenshot capture
- video capture for failed cases
- accessibility scanner
- structured JSON report
- Markdown report for Obsidian
- optional GitHub issue creation
- optional HQ error ingestion

Architecture:

```text
Route Discovery
      ↓
Authentication / Test Accounts
      ↓
Page Crawler
      ↓
UI Element Discovery
      ↓
AI Action Planner
      ↓
Playwright Executor
      ↓
Network / Console / DOM Monitoring
      ↓
Assertions
      ↓
Failure Classification
      ↓
Screenshot + Reproduction Steps
      ↓
Markdown / JSON Report
```

---

# 2. Products to Test

The agent must support:

- [[10 Stageflow]]
- [[11 Ticketing]]
- [[12 LiveGuide]]
- [[13 SmartLink]]
- [[14 Market]]
- [[15 SoundLaunch]]
- [[16 Mastering]]
- [[00 Musakonttori HQ]]

Each product receives its own test configuration.

---

# 3. Test Modes

## Smoke Mode

Fast verification after every deployment.

Tests:

- app opens
- login works
- dashboard loads
- critical API responds
- one critical user flow succeeds

## Full Crawl Mode

Explore all available pages and controls.

Run:

- nightly
- before major release
- after large refactor

## Role Mode

Repeat product testing using different roles.

## Critical Flow Mode

Run only business-critical flows.

## Exploratory AI Mode

AI attempts realistic actions beyond predefined scripts.

## Mobile Mode

Test mobile layout and functionality.

## Production Safe Mode

Read-only / non-destructive checks in production.

---

# 4. Route Discovery

The agent must discover pages from multiple sources.

## Sources

- Next.js app routes
- navigation menus
- sidebar
- footer
- sitemap
- internal links
- buttons that navigate
- known product configuration
- route registry
- API-provided navigation

Store discovered routes.

For every route record:

- URL
- page title
- product
- authentication requirement
- required role
- parent navigation item
- status code
- discovered links
- discovered controls

---

# 5. Broken Link Detection

For every link:

- click link
- verify destination
- verify status
- check unexpected redirects
- check infinite redirects
- check blank page
- check wrong tenant
- check wrong locale

Flag:

- HTTP 404
- HTTP 500+
- destination missing
- unexpected redirect
- dead external link
- malformed URL
- empty href
- `href="#"` without valid behavior
- `javascript:void(0)`
- broken anchor
- inaccessible linked resource

Report example:

```text
BROKEN LINK

Product: Stageflow
Page: /pro/artists
Element: "View Artist"
Destination: /artists/undefined

Severity: High

Expected:
Open selected artist.

Actual:
404 page.

Reproduction:
1. Login as Artist Manager
2. Open /pro/artists
3. Click View Artist

Screenshot:
artifacts/stageflow/view-artist-404.png
```

---

# 6. Button Discovery

Find all clickable controls:

- button
- role="button"
- links styled as buttons
- icon buttons
- menus
- dropdown triggers
- tabs
- accordion controls
- floating actions
- table row actions
- context menus

For every control:

1. record current state
2. click
3. wait for expected reaction
4. compare DOM
5. compare URL
6. inspect network
7. inspect console
8. determine whether meaningful state changed

---

# 7. Dead Button Detection

Flag a button when:

- no DOM state changes
- no URL changes
- no modal opens
- no network request occurs
- no valid client action occurs
- no feedback appears
- button remains permanently loading
- JS exception occurs

Do not flag legitimate actions such as copy-to-clipboard if clipboard state can be verified.

Classification:

- NO_ACTION
- JS_ERROR
- API_FAILURE
- PERMISSION_FAILURE
- WRONG_ACTION
- STUCK_LOADING
- MISSING_HANDLER

---

# 8. Form Testing

Discover every form.

Test:

## Empty Form

Submit with no values.

Verify validation.

## Valid Form

Enter valid values.

Verify successful submission.

## Invalid Values

Test:

- invalid email
- invalid URL
- invalid date
- negative number
- excessive value
- invalid characters

## Boundary Values

Test:

- minimum length
- maximum length
- zero
- minimum quantity
- maximum quantity

## Duplicate Submit

Double click Submit.

Verify only one resource/order/action is created.

## API Failure

Simulate or detect failure.

Verify:

- loading stops
- error appears
- data not corrupted

---

# 9. Input Interaction Testing

Test:

- text input
- textarea
- select
- multiselect
- checkbox
- radio
- toggle
- date picker
- time picker
- file upload
- rich text editor
- drag & drop
- slider
- color picker

Check keyboard interaction.

---

# 10. Modal Testing

For every modal:

- open
- verify content
- submit
- cancel
- close X
- Escape
- click outside if allowed
- focus trapping
- restore focus after close

Detect:

- modal cannot close
- background remains blocked
- duplicate modal
- missing buttons
- overflow problem

---

# 11. Dropdown / Menu Testing

Test:

- opens
- items visible
- selection works
- selection updates UI
- clicking outside closes
- Escape closes
- keyboard works
- disabled items remain disabled

---

# 12. Tabs Testing

For every tab:

- click
- content changes
- active state changes
- URL/query parameter updates where expected
- browser back works where expected
- direct tab URL works if supported

---

# 13. Filter Testing

For every filter:

1. record results before filter
2. apply filter
3. verify results change correctly
4. remove filter
5. verify original results return

Test combinations.

Detect controls that visually change but do not affect data.

---

# 14. Sorting Testing

Test:

- ascending
- descending
- numeric
- alphabetical
- date
- currency

Verify actual result ordering.

---

# 15. Search Testing

Test:

- exact term
- partial term
- case differences
- special characters
- no results
- clear search
- search after filter

Detect:

- search control does nothing
- wrong dataset searched
- stale results
- wrong empty state

---

# 16. Pagination / Infinite Scroll

Test:

- next
- previous
- first
- last
- page number
- page size
- infinite scroll
- load more

Detect:

- duplicate items
- missing items
- wrong count
- endless loading

---

# 17. CRUD Testing

For every manageable resource test:

```text
CREATE
READ
UPDATE
ARCHIVE / DELETE
RESTORE
```

Examples:

- Artist
- Event
- Ticket
- Product
- SmartLink
- LiveGuide
- Release
- Mastering project

Report missing lifecycle operations.

---

# 18. State Transition Testing

The agent should understand expected state machines.

Example Ticket:

```text
VALID
→ TRANSFERRED
→ USED
```

Forbidden:

```text
REFUNDED
→ USED
```

Test invalid state changes.

---

# 19. Network Monitoring

Capture all browser requests.

Flag:

- HTTP 400 unexpected
- HTTP 401 unexpected
- HTTP 403 unexpected
- HTTP 404
- HTTP 409 unexpected
- HTTP 422 unexpected
- HTTP 500+
- request timeout
- CORS failure
- aborted critical request

Store:

- URL
- method
- status
- page
- triggering UI action
- response excerpt when safe

---

# 20. Console Monitoring

Capture:

- console.error
- uncaught exception
- unhandled promise rejection
- React hydration errors
- React warnings
- failed resource loads

Severity:

- Critical
- High
- Medium
- Low
- Warning

---

# 21. Visual Failure Detection

Detect:

- overlapping elements
- off-screen actions
- horizontal scrolling
- clipped text
- invisible buttons
- empty cards
- broken images
- missing icons
- huge whitespace
- layout collapse

Capture screenshots.

---

# 22. Responsive Testing

Run key flows using:

- 375x667
- 390x844
- 768x1024
- 1440x900
- 1920x1080

Test touch-like flows on mobile.

---

# 23. Accessibility Testing

Automated checks:

- missing labels
- inaccessible buttons
- duplicate IDs
- invalid ARIA
- heading structure
- contrast issues where detectable
- image alt text

AI/manual simulation:

- keyboard-only navigation
- focus visibility
- modal focus
- tab order

---

# 24. Authentication Testing

Test:

- login
- logout
- expired session
- invalid password
- password reset
- account disabled
- direct protected route
- session refresh

---

# 25. Role Testing

Create test users for:

- Owner
- Admin
- Manager
- Editor
- Viewer
- Customer/Fan
- Support
- Super Admin

For each page/control verify:

- visible when allowed
- hidden/disabled when not allowed
- backend rejects unauthorized request

---

# 26. Tenant Isolation Testing

Create:

- Organization A
- Organization B

AI attempts to:

- modify URL IDs
- modify query parameters
- access API resource IDs
- reuse IDs discovered from Organization B

Expected:

DENIED.

Severity if breached:

CRITICAL.

---

# 27. Super Admin Testing

Test:

- Super Admin login
- global search
- organization view
- user view
- safe impersonation
- impersonation reason
- exit impersonation
- audit trail
- sensitive actions blocked
- elevated mode
- support case context

---

# 28. Mock / Placeholder Detection

AI should inspect page content and behavior for signs of unfinished implementation.

Search code/runtime/UI for:

- TODO
- FIXME
- mock
- fake
- dummy
- placeholder
- sample
- lorem ipsum
- coming soon
- not implemented
- hardcoded data

Runtime detection:

- same analytics value never changes
- static fake charts
- fake delays with setTimeout
- button displays success but no backend change
- localStorage used where persistent server state is expected

Report:

`POSSIBLE_MOCK_IMPLEMENTATION`

---

# 29. Persistence Testing

After creating or changing data:

1. refresh page
2. navigate away
3. return
4. logout/login if appropriate

Verify data persists.

Detect UI-only state.

---

# 30. Browser Back / Forward Testing

Critical navigation flows should survive:

- Back
- Forward
- Refresh
- direct URL
- duplicated tab

---

# 31. Error State Testing

Force or observe failures.

Verify:

- understandable error message
- no infinite spinner
- retry available where appropriate
- state remains consistent
- sensitive data not exposed

---

# 32. Loading State Testing

Detect:

- missing loading state
- loading never ends
- duplicate loaders
- action remains disabled after completion
- stale loading overlay

---

# 33. Empty State Testing

Test resources with zero data.

Verify:

- page does not crash
- understandable empty state
- correct CTA
- CTA works

---

# 34. File Upload Testing

Test:

- valid file
- invalid format
- oversized file
- corrupt file
- duplicate file
- network interruption
- retry
- cancel

Products:

- SmartLink
- Market
- SoundLaunch
- Mastering
- Stageflow media

---

# 35. Download Testing

Verify:

- link works
- file exists
- correct MIME type
- non-zero file size
- authorized user only
- expired URLs handled

---

# 36. Payment / Financial Safe Testing

Use sandbox/test providers.

Never perform uncontrolled real financial actions.

Test:

- success
- declined
- timeout
- duplicate webhook
- duplicate click
- refund
- partial refund
- retry

Products:

- Ticketing
- Market
- SmartLink Marketplace
- Mastering credits
- subscriptions

---

# 37. Product-Specific AI QA

## Stageflow

Must test:

- artist pages
- event pages
- festivals
- venues
- follow
- favorites
- search
- organization dashboards
- artist management
- booking
- fan CRM
- admin

## Ticketing

Must test:

- event creation
- ticket inventory
- checkout
- payment
- ticket generation
- transfer
- resale
- refund
- waiting list
- scanning
- offline scanning
- payout view

## LiveGuide

Must test:

- guide home
- schedule
- map
- vendors
- water
- toilets
- alerts
- personal schedule
- offline
- emergency mode
- organizer dashboard

## SmartLink

Must test:

- builder
- every block
- DnD
- responsive settings
- preview
- publish
- custom domains
- forms
- analytics
- QR
- marketplace purchase
- installed assets

## Market

Must test:

- storefront
- product
- variants
- filters
- cart
- checkout
- orders
- inventory
- shipping
- returns
- refunds
- discounts
- customer account

## SoundLaunch

Must test:

- release creation
- metadata
- track upload
- artwork
- validation
- submission
- delivery state
- correction
- takedown
- catalog
- admin

## Mastering

Must test:

- upload
- analysis
- player
- mastering
- progress
- A/B
- controls
- versions
- QC
- export
- credits
- SoundLaunch handoff

## Musakonttori HQ

Must test:

- dashboards
- global search
- Customer 360
- Organization 360
- support
- errors
- system health
- feature flags
- impersonation
- billing overrides

---

# 38. AI Exploratory Testing

After deterministic tests, AI receives a task:

> Explore this page as a real user. Attempt every reasonable action and identify anything confusing, broken, incomplete or inconsistent.

AI should:

- identify UI controls
- infer purpose
- attempt action
- compare result to expected behavior
- classify uncertainty
- never perform destructive production actions

---

# 39. Page Completion Score

Every page receives:

```text
Page Health: 84/100
```

Categories:

- Navigation
- Functional controls
- API health
- Forms
- Error handling
- Accessibility
- Mobile
- Permissions

---

# 40. Feature Completion Score

Example:

```text
Ticket Transfer

UI                 ✅
API                ✅
Database           ✅
Permissions        ✅
Audit Log          ❌
Error Handling     ⚠️
Automated Test     ❌

Status:
PARTIAL

Completion:
71%
```

---

# 41. Product Health Score

Example:

```text
Stageflow

Routes tested:        143 / 143
Links tested:         821
Buttons tested:       1,204
Forms tested:         97

Working:              91%
Warnings:             5%
Broken:               4%

Critical:             2
High:                 9
Medium:               31
Low:                  44
```

---

# 42. Severity Classification

## Critical

- data leak
- tenant isolation failure
- payment duplication
- overselling
- destructive unauthorized action
- payout problem
- emergency alert failure

## High

- core feature broken
- checkout broken
- publishing broken
- login broken
- data loss
- critical integration failure

## Medium

- non-critical button broken
- filter failure
- bad validation
- navigation problem

## Low

- visual issue
- typo
- minor accessibility problem
- minor inconsistency

---

# 43. Required Failure Report

Every defect must contain:

```markdown
# BUG-XXXX — Short title

## Product

## Environment

## Severity

Critical / High / Medium / Low

## URL

## User Role

## Element

## Expected Behavior

## Actual Behavior

## Reproduction Steps

1.
2.
3.

## Network Errors

## Console Errors

## Screenshot

## Video

## Related API

## AI Confidence

High / Medium / Low
```

---

# 44. Broken UI Report

Create automatically:

`AI QA - Broken UI.md`

Sections:

- broken links
- dead buttons
- failed forms
- broken dropdowns
- broken tabs
- broken filters
- stuck loaders
- empty pages
- console errors
- network errors
- accessibility
- mobile

---

# 45. Machine-Readable Report

Also output:

`qa-results.json`

Example:

```json
{
  "product": "Stageflow",
  "runId": "...",
  "summary": {
    "pages": 143,
    "links": 821,
    "buttons": 1204,
    "failures": 46
  },
  "issues": []
}
```

This allows Musakonttori HQ to ingest results.

---

# 46. Screenshots

Capture automatically:

- before action when useful
- after failed action
- full-page screenshot
- element screenshot

Path:

```text
qa-artifacts/
  stageflow/
    run-id/
      screenshots/
      videos/
      traces/
```

---

# 47. Playwright Trace

Enable trace for failed tests.

Store:

- DOM snapshots
- network calls
- console
- screenshots
- actions

This makes bugs reproducible.

---

# 48. Test Accounts

Maintain seeded accounts:

```text
qa-owner@
qa-admin@
qa-manager@
qa-editor@
qa-viewer@
qa-customer@
qa-superadmin@
```

Never use real customer accounts.

---

# 49. Seeded QA Organizations

Maintain:

```text
QA Organization A
QA Organization B
```

Use these specifically for tenant isolation testing.

---

# 50. Test Data Reset

Before a full QA run:

1. reset QA database
2. apply migrations
3. seed known dataset
4. run tests
5. preserve failure artifacts

Tests must be repeatable.

---

# 51. Test Scheduling

## Pull Request

Run:

- unit
- integration
- critical E2E

## Staging Deploy

Run:

- smoke
- critical flows
- changed-module AI crawl

## Nightly

Run:

- full route crawl
- all links
- all buttons
- all forms
- console/network scan

## Weekly

Run:

- every role
- mobile
- cross-browser
- accessibility
- cross-product integrations

## Before Major Release

Run:

- complete full suite
- load tests
- security suite
- AI exploratory testing

---

# 52. AI Change-Aware Testing

When a pull request changes:

```text
src/modules/ticketing/
```

AI should prioritize:

- Ticketing routes
- Ticketing API
- Ticketing E2E
- Stageflow → Ticketing contracts
- LiveGuide → Ticketing contracts

Use Git diff to determine affected test scope.

---

# 53. Self-Learning Regression Suite

When AI discovers a confirmed bug:

1. create bug report
2. developer confirms
3. create deterministic automated regression test
4. add test permanently
5. close issue only after regression passes

The AI crawler discovers problems.

Deterministic tests ensure they never return.

---

# 54. AI QA Prompt

Use the following system-level instruction for the QA agent:

```text
You are the autonomous QA engineer for the Musakonttori platform.

Your goal is to discover broken, incomplete, misleading or insecure functionality.

For every accessible page:

1. identify all interactive controls
2. determine their expected purpose from UI context
3. exercise each control safely
4. validate visible result
5. validate URL/navigation
6. validate network requests
7. inspect browser console
8. verify persisted state when appropriate
9. test error and empty states where practical
10. report every unexpected result

Never assume a feature works because the UI exists.

A button is considered working only when its expected behavior can be verified.

A form is considered working only when data is validated, submitted, persisted and displayed correctly.

A link is considered working only when its destination loads successfully and matches its intended purpose.

For every defect produce:

- product
- page URL
- user role
- severity
- expected behavior
- actual behavior
- exact reproduction steps
- console errors
- failed network requests
- screenshot
- confidence

Do not perform destructive production actions.

Use dedicated QA accounts and QA environments for destructive tests.

Prioritize:
1. security
2. money
3. data integrity
4. core user flows
5. broken functionality
6. accessibility
7. visual defects
```

---

# 55. Definition of Done

The AI QA system is ready when it can automatically:

- [ ] discover application routes
- [ ] login using test users
- [ ] switch user roles
- [ ] crawl pages
- [ ] discover links
- [ ] verify all links
- [ ] discover buttons
- [ ] test button behavior
- [ ] discover forms
- [ ] test forms
- [ ] detect API failures
- [ ] detect console errors
- [ ] capture screenshots
- [ ] record traces
- [ ] test permissions
- [ ] test tenant isolation
- [ ] run critical product flows
- [ ] generate Markdown report
- [ ] generate JSON report
- [ ] compare current run to previous run
- [ ] flag new regressions
- [ ] create regression tests from confirmed defects

---

# 56. Final Principle

Do not ask AI only:

> Does the page work?

Make the AI prove it.

The testing loop should be:

```text
Discover
↓
Interact
↓
Observe
↓
Verify
↓
Break
↓
Retry
↓
Report
↓
Create Regression Test
```

The end goal is that every Musakonttori product has a continuously running virtual QA team that checks the system after every meaningful change.
