---
type: architecture
status: design
priority: high
updated: 2026-08-14
---

# Musakonttori — Feature Flags

## Visio

Yksi yhteinen **Musakonttori Feature Flag Service**, jota kaikki tuotteet käyttävät. Flagien hallinta tehdään HQ:ssa, mutta itse evaluointi tapahtuu tuotteissa nopeasti paikallisella cachella/SDK:lla — jokainen request ei aiheuta kutsua HQ:hun.

```
HQ Feature Flags
        ↓
Feature Flag Service
        ↓
Shared SDK / Cache
        ↓
Stageflow
Ticketing
LiveGuide
SmartLink
Market
SoundLaunch
Mastering
Accounts
```

---

## 1. Feature Flag Service Foundation

- [ ] Create central Feature Flag Service
- [ ] Define service ownership
- [ ] Define API boundaries
- [ ] Define SDK boundaries
- [ ] Define supported environments
- [ ] Support development
- [ ] Support staging
- [ ] Support production
- [ ] Separate configuration per environment
- [ ] Add service health endpoint
- [ ] Add versioning
- [ ] Add audit logging
- [ ] Add metrics
- [ ] Add caching
- [ ] Add fail-safe behavior
- [ ] Add feature flag schema validation

---

## 2. Core Flag Model

Create: `feature_flags`

| Field | Purpose |
|-------|---------|
| `id` | primary key |
| `key` | stable flag key |
| `name` | display name |
| `description` | purpose |
| `product` | owning product |
| `category` | flag category |
| `flag_type` | boolean/string/number/json/variant |
| `default_value` | safe default |
| `status` | lifecycle status |
| `environment` | dev/staging/production |
| `created_by` | actor |
| `created_at` | timestamp |
| `updated_at` | timestamp |
| `archived_at` | soft delete |

Example:

```
key:     ticketing.dynamic_pricing
name:    Dynamic Pricing
product: ticketing
type:    boolean
default: false
```

---

## 3. Flag Types

- **Boolean** — `true / false` (esim. `mastering.ai_mastering_v2`)
- **String** — esim. `ticketing.checkout_version = "v2"`
- **Number** — esim. `smartlink.max_blocks = 50`
- **JSON** — esim. `{ "layout": "new", "maxItems": 20 }`
- **Variant** — `control / variant_a / variant_b` (A/B-testit)

---

## 4. Flag Status

Erillinen flagin elinkaari ja varsinainen arvo:

```
DRAFT
ACTIVE
PAUSED
ARCHIVED
```

Älä käytä pelkkää `enabled`, koska `ARCHIVED` ja `PAUSED` tarkoittavat eri asioita.

---

## 5. Default Value

Jokaisella flagilla on turvallinen oletusarvo. Esim. `dynamic_pricing = false`.

Jos Feature Flag Service on alhaalla, kokeelliselle toiminnalle käytetään normaalisti `false`.

Kriittinen poikkeus: osa security/compliance-ominaisuuksista vaatii `fail closed` -käytöstä. Määritellään per flag.

---

## 6. Flag Categories

```
EXPERIMENT
BETA
EARLY_ACCESS
ROLLOUT
KILL_SWITCH
OPERATIONAL
ENTITLEMENT_BRIDGE
UI
BACKEND
INTEGRATION
MIGRATION
```

Esim. `mastering.new_analysis_engine` → `ROLLOUT`.

---

## 7. Products

```
accounts
stageflow
ticketing
liveguide
smartlink
market
soundlaunch
mastering
hq
shared
```

`shared` poikkituotteelliselle toiminnolle.

---

## 8. Naming Convention

Stabiilit avaimet muotoa `product.feature`:

```
stageflow.ai_booking
ticketing.dynamic_pricing
liveguide.crowd_heatmap
smartlink.ai_builder
market.subscription_products
soundlaunch.release_v2
mastering.ai_mastering_v2
accounts.passkeys
```

Alitoiminnot: `ticketing.checkout.express`.

Vältä: `new_feature`, `test123`, `flag1`.

---

## 9. Feature Flag Targeting

- [ ] User
- [ ] Organization
- [ ] Product
- [ ] Subscription plan
- [ ] Organization type
- [ ] User role
- [ ] Country
- [ ] Language
- [ ] Account age
- [ ] Organization ID
- [ ] User ID
- [ ] Email domain
- [ ] Percentage rollout
- [ ] Environment
- [ ] Custom attributes

---

## 10. Organization Targeting

Tärkein Musakonttorin käyttötapaus. Kohdenna kanonisella `organization_id`:llä (Musakonttori Accounts), ei organisaation nimellä.

---

## 11. User Targeting

Mahdollista feature yksittäisille käyttäjille (`user_123`, `user_456`): sisäiset beta-käyttäjät, valitut artistit, kehittäjät, support-testaus.

---

## 12. Organization + User Rules

```
Enable for Organization A EXCEPT User X
Disabled globally BUT enabled for User X
```

Tarvitaan deterministiset precedenssi-säännöt.

---

## 13. Rule Priority

```
1. Emergency kill switch
2. Explicit user override
3. Explicit organization override
4. Explicit segment rule
5. Percentage rollout
6. Default value
```

---

## 14. Explicit Allow List

```
feature: mastering.ai_reference_engine
allowed organizations: org_1, org_2, org_3
```

---

## 15. Explicit Deny List

```
Global = true
deny: org_42
→ org_42 = false
```

---

## 16. Customer Segments

Uudelleenkäytettävät segmentit: Beta Customers, Enterprise Customers, Finnish Festivals, Internal Test Accounts, Mastering Early Access, Ticketing Pilot Customers.

---

## 17. Segment Model

Create: `feature_segments`

```
id, name, description, rules, created_at, updated_at
```

---

## 18. Dynamic Segment Rules

```
subscription_plan = PRO AND country = FI AND organization_type = FESTIVAL
```

---

## 19. Static Segments

Manuaalinen organisaatiolista (`org_123`, `org_456`, `org_789`) piloteille.

---

## 20. Percentage Rollout

`1% / 5% / 10% / 25% / 50% / 75% / 100%`

---

## 21. Deterministic Rollout

Ei randomisointia joka requestilla. Käytä stabiilia hashausta:

```
hash(flag_key + organization_id)
hash(flag_key + user_id)
```

Tulos pysyy stabiilina — ei `true/false/true/false`-vaihtelua.

---

## 22. Rollout Stickiness

Per flag: `stickiness = organization | user | session`.

SaaS-oletus: `organization` — kaikki yrityksen käyttäjät näkevät saman.

---

## 23. Scheduled Activation

```
Enable at: 2026-09-01 08:00 Europe/Helsinki
```

---

## 24. Scheduled Deactivation

```
Disable at: 2026-09-30 23:59
```

---

## 25. Start + End Schedule

```
Mastering Beta: 1 Sep → 30 Sep
```

---

## 26. Customer-Specific Schedule

```
Org A: enable 1 Sep
Org B: enable 15 Sep
Org C: never
```

---

## 27. Timezone Handling

Sisäisesti UTC, UI näyttää valitun aikavyöhykkeen.

---

## 28. Recurring Schedule

Valinnainen myöhemmin (esim. ma–pe 08–18). Arkkitehtuuri voi tukea.

---

## 29. Scheduled Rollout Plan

```
01 Sep → 5%
03 Sep → 10%
05 Sep → 25%
08 Sep → 50%
10 Sep → 100%
```

---

## 30. Automatic Rollout

Create: `feature_rollout_steps`

```
step 1: 5%, step 2: 10%, step 3: 25%, step 4: 50%, step 5: 100%
```

---

## 31. Automatic Rollout Pause

`Pause rollout` — nykyinen prosentti jää voimaan.

---

## 32. Automatic Rollback

Tulevaisuuden toiminto: jos `error rate > 5%` → palaa edelliseen prosenttiin.

---

## 33. Kill Switch

Kriittisellä uudella toiminnolla `KILL_SWITCH` (esim. `ticketing.new_checkout`). Vakava bugi → `Disable globally` sekunneissa.

---

## 34. Kill Switch Priority

Kill switch yliajaa users/orgs/segments/percentage. `EMERGENCY_DISABLED` → kukaan ei saa featurea.

---

## 35. Instant Disable

HQ:ssa `Disable now` + vahvistus; kriittisille `Disable globally`.

---

## 36. Rollback to Previous Configuration

Versionistus: `v12 → 50%`, `v13 → 100%`, huono v13 → `Restore v12`.

---

## 37. Version History

Create: `feature_flag_versions`

```
flag_id, version, configuration, changed_by, changed_at, change_reason
```

---

## 38. Change Reason

Pakollinen/suositus riskin mukaan. Tuotannon kill-switcheille syy pakollinen.

---

## 39. Audit Log

```
flag.created, flag.updated, flag.enabled, flag.disabled, flag.archived, flag.restored,
target.added, target.removed, schedule.created, schedule.changed, rollout.changed
```

---

## 40. Audit Information

```
actor, flag, environment, old_value, new_value, targets, timestamp, reason
```

---

## 41. Flag Removal

Ei välitöntä poistoa — ensin `ARCHIVED`.

---

## 42. Archive Flow

```
Active flag → Disable globally → Wait until code no longer uses flag → Archive
→ Remove code references → Delete flag later if desired
```

---

## 43. Stale Flag Detection

`last_evaluated_at`. Jos ei arvioitu 90 päivään → `POSSIBLY_STALE`.

---

## 44. Flag Expiration

Valinnainen `expires_at`. HQ varoittaa ennen eräpäivää.

---

## 45. Flag Owner

`owner_team`, `owner_user` (esim. Product: Ticketing → Owner: Ticketing Team).

---

## 46. Flag Documentation

Vaaditaan: purpose, expected lifetime, rollout plan, rollback plan, affected functionality, owner, dependencies.

---

## 47. HQ Feature Flag UI

```
Platform → Feature Flags
Feature Management → Flags, Segments, Rollouts, Scheduled Changes, History, Health
```

---

## 48. Feature Flags List

Sarakkeet: `Flag, Product, Environment, Type, Status, Rollout, Customers, Schedule, Owner, Updated`.

---

## 49. Flag Filters

product, environment, status, type, owner, segment, scheduled, stale.

---

## 50. Search

key, name, description, organization, owner.

---

## 51. Flag Detail Page

Tabit: Overview, Targeting, Rollout, Schedule, Dependencies, Analytics, History, Code Usage.

---

## 52. Overview

```
Dynamic Pricing
Key: ticketing.dynamic_pricing
Production
Default: OFF
Effective: 12% customers
Owner: Ticketing
```

---

## 53. Targeting UI

Osiot: Explicit Organizations, Explicit Users, Segments, Deny List.

---

## 54. Add Organization

Hae Accounts-organisaatioita, tallenna `organization_id`.

---

## 55. Bulk Organization Assignment

CSV-upload, ID-liitäntä, segmentin valinta, monivalinta.

---

## 56. Remove Organization

`Remove from flag` → evaluointi putoaa seuraavaan sääntöön/oletusarvoon.

---

## 57. Organization Detail Integration

HQ Organization 360 näyttää `Feature Access`.

---

## 58. Enable Feature from Customer Page

Organization 360 → Features → Enable feature → Immediately / Schedule / Until date.

---

## 59. Temporary Customer Enablement

`Enable from Now until 30 Sep` → automaattinen disable jälkeen.

---

## 60. Customer Beta Access

Uudelleenkäytettävä `Beta Access` -segmentti.

---

## 61. Self-Service Beta

Valinnainen: `customer_opt_in = true` → yritys voi itse kytkeä kokeellisia featureita.

---

## 62. Self-Service Opt-Out

Osassa beta-featureita organisaation omistaja voi disabloida (migraatioissa).

---

## 63. Product Plan Integration

```
Advanced Analytics → PRO plan
```

---

## 64. Do Not Replace Entitlements with Flags

```
Can use feature = plan entitlement AND feature flag AND permission
```

Flagit eivät korvaa laskutus-sääntöjä pysyvästi.

---

## 65. Evaluation Context

```ts
{
  userId, organizationId, product, environment,
  role, plan, country, language
}
```

---

## 66. Feature Evaluation

```ts
const enabled = await flags.isEnabled("mastering.ai_mastering_v2", context);
```

---

## 67. Shared SDK

Create: `@musakonttori/feature-flags`

```
isEnabled(), getValue(), getVariant(), getAllFlags()
```

---

## 68. React Helpers

```tsx
<FeatureFlag flag="mastering.ai_mastering_v2">
  <NewMastering />
</FeatureFlag>
```

Backendin on silti validoitava flag kun toiminto on suojattu.

---

## 69. React Hook

```ts
const enabled = useFeatureFlag("smartlink.ai_builder");
```

---

## 70. Server Helper

```ts
await requireFeatureFlag({ flag: "ticketing.dynamic_pricing", context });
```

---

## 71. API Enforcement

Älä vain piilota UI:ta. Jos flag OFF → `POST /api/dynamic-pricing` hylkää käytön.

---

## 72. Backend and Frontend Consistency

Frontend piilottaa/disabloi, backend kieltää. Molemmat evaluoivat saman flagin.

---

## 73. Flag Evaluation Cache

Ei kutsua Feature Flag Serviceen joka renderillä. Local memory cache + Redis/jakettu cache tarvittaessa.

---

## 74. Config Pull Model

Tuotteet hakevat uusimman konfiguraation määräajoin (30–60 s) ja evaluoivat lokaalisti.

---

## 75. Cache TTL

30 s; kriittisille kill-switcheille 5–10 s tai invalidointimekanismi.

---

## 76. Local Evaluation

```
Product → Local cached configuration → Evaluate flag
```
mieluummin kuin HTTP-kutsu per request.

---

## 77. Failure Strategy

Service alhaalla → `last known good configuration` jos validi, muuten safe default.

---

## 78. Flag-Specific Failure Policy

`failure_mode = DEFAULT_VALUE | FAIL_CLOSED | LAST_KNOWN_GOOD`.

---

## 79. Config Version

Jokainen payload sisältää `version` → tuote tietää käyttävänsä `v123`.

---

## 80. SDK Health

`last_config_sync`, `config_version`, `evaluation_errors`.

---

## 81. Feature Flag Service API

```
GET  /internal/feature-flags/config
POST /flags
PATCH /flags/:id
POST /flags/:id/targets
DELETE /flags/:id/targets/:target
POST /flags/:id/schedule
POST /flags/:id/archive
POST /flags/:id/restore
```

---

## 82. Config Endpoint

Tuote saa vain relevanteille flageille (product + environment):

```
GET /internal/feature-flags/config?product=mastering&environment=production
```

---

## 83. Service Authentication

Product → Feature Flags: service-to-service credentials, EI customer user tokenia.

---

## 84. Read-Only SDK Credentials

Tuotteet tarvitsevat vain `feature_flags:read`.

---

## 85. Management Permissions

```
feature_flags.view / create / update / schedule / target / rollout / archive
```

---

## 86. Sensitive Production Permission

`feature_flags.production.manage` erikseen — ei kaikille kehittäjille.

---

## 87. Approval Workflow

Riskialttiille (checkout, payments, auth, ticket inventory, emergency): Creator → Reviewer → Approve.

---

## 88. Four-Eyes Rule

P0-flageille: yksi ehdottaa, toinen hyväksyy.

---

## 89. Change Preview

Ennen tallennusta näytä Before/After (default, organisaatiot, prosentit).

---

## 90. Impact Estimation

`This change will affect approximately: 4,281 organizations, 72,300 users`.

---

## 91. Confirmation

Korkean vaikutuksen toimet vaativat vahvistuksen; kriittisille `ENABLE PRODUCTION` -kirjoitus.

---

## 92. Scheduling Worker

Create: `scheduled_feature_flag_changes`

```
id, flag_id, action, target, scheduled_at, status, created_by
```

---

## 93. Schedule Status

`PENDING / EXECUTING / COMPLETED / FAILED / CANCELLED`.

---

## 94. Scheduled Task Runner

Ajaa minuutin välein: `scheduled_at <= now AND status = PENDING` → idempotentti suoritus.

---

## 95. Scheduled Change Idempotency

Tuplasuoritus ei tee muutosta kahdesti: schedule ID + transaktio.

---

## 96. Schedule Cancellation

`Cancel scheduled change` ennen suoritusta.

---

## 97. Schedule Editing

Aika/target/arvo muokattavissa → audit-eventti.

---

## 98. Schedule Preview

HQ:n `Upcoming Changes` -näkymä.

---

## 99. Calendar View

Valinnainen `Feature Rollout Calendar`.

---

## 100. Dependencies

```
mastering.ai_mastering_v2 requires mastering.new_analysis_engine
```

---

## 101. Dependency Validation

Estä `child = ON` kun `parent = OFF` (ellei eksplisiittisesti tuettu).

---

## 102. Mutually Exclusive Flags

`checkout_v1` vs `checkout_v2` → mieluummin variant-flag, mutta konfliktit voi havaita.

---

## 103. Flag Prerequisites

`prerequisites`-kenttä: AI Reference vaatii AI Masteringin.

---

## 104. Analytics

Mittaa evaluaatiot (enabled/disabled/variant/product/organization) — harkiten, sampling riittää.

---

## 105. Exposure Events

A/B-kokeissa `feature_exposed` kun käyttäjä oikeasti näkee/käyttää kokeen — ei pelkästään evaluoinnista.

---

## 106. A/B Experiments

`control = 50%, variant_a = 25%, variant_b = 25%`.

---

## 107. Experiment Stickiness

Deterministinen jako; varianttia ei vaihdeta kokeen aikana.

---

## 108. Experiment Analytics

Yhdistä exposure konversioon/käyttöön/virheisiin/tuottoon — pidä analytiikka erillään evaluoinnista.

---

## 109. Product Health Integration

HQ korreloi: `Feature enabled → error rate increased` (control 0.8% vs V2 4.3%).

---

## 110. Automatic Warning

Jos flagattu feature korreloi korkeiden virheiden kanssa → `Potential rollout problem`.

---

## 111. Error Logging Context

Virheet voivat sisältää aktiiviset flagit (payload-koko huomioiden).

---

## 112. Support Integration

Support-thread näyttää `Customer Feature Flags`.

---

## 113. Customer 360 Integration

Organization page: Features → inherited/explicit/scheduled/rollout/experimental.

---

## 114. Why Feature Is Enabled

`Reason: Organization override` / `Enterprise Beta segment`.

---

## 115. Evaluation Debugger

HQ-työkalu: syötä User/Organization/Product/Flag → `ENABLED, Reason: Organization explicit override, Rule: rule_123`.

---

## 116. Debug Trace

```
Kill switch: no
User override: none
Org override: ENABLE
→ result TRUE
```

---

## 117. Flag Testing Environment

dev/staging/production erikseen; muutokset eivät automaattisesti kopioidu tuotantoon.

---

## 118. Promote Flag Configuration

Valinnainen `Copy staging configuration to production` + preview.

---

## 119. Environment Safety

Tuotanto vaatii vahvemmat oikeudet/vahvistuksen.

---

## 120. Feature Flag Tests

Unit: evaluation precedence, percentage hashing, segment matching, schedule evaluation, dependency evaluation.

---

## 121. Organization Override Tests

`default OFF, org A override ON → A=ON, B=OFF`.

---

## 122. Deny Override Test

`default ON, org B deny → A=ON, B=OFF`.

---

## 123. Schedule Tests

`before start / at start / during / at end / after end`.

---

## 124. Timezone Tests

DST/aikavyöhykerajat; sisäisesti UTC.

---

## 125. Percentage Rollout Tests

Deterministinen hash: sama org → aina sama tulos.

---

## 126. Cache Tests

initial fetch, refresh, stale config, service failure, last-known-good, version change.

---

## 127. Kill Switch Tests

`explicit org ON + kill switch OFF → OFF`.

---

## 128. API Security Tests

Normaalit käyttäjät eivät voi muokata flag-konfiguraatiota.

---

## 129. Product API Tests

Flag OFF → endpoint kieltää; ON → toimii.

---

## 130. Organization Isolation

Käyttäjä ei voi enableta featurea toiselle organisaatiolle. Hallinta sisäinen HQ-toiminto.

---

## 131. Scheduled Worker Tests

due task, future task, cancelled task, duplicate execution, failure/retry.

---

## 132. Audit Tests

Jokainen mutaatio generoi audit-eventin.

---

## 133. Rollback Tests

Palauta edellinen versio ja varmista konfiguraatio.

---

## 134. Flag Lifecycle

```
CREATE → DRAFT → STAGING TEST → PILOT CUSTOMERS → 5% → 25% → 50% → 100%
→ PERMANENT FEATURE → REMOVE FLAG FROM CODE → ARCHIVE FLAG
```

---

## 135. Do Not Leave Permanent Flags

Kun feature on pysyvästi ON → poista flag-ehto koodista.

---

## 136. Flag Cleanup Workflow

`100% enabled for 90 days` → ehdota `Remove flag`.

---

## 137. Code Reference Tracking

Tunnetut viitteet (`stageflow/src/...`); CI raportoi tuntemattomat/stalet flagit.

---

## 138. Flag Registry

```ts
export const FeatureFlags = {
  TICKETING_DYNAMIC_PRICING: "ticketing.dynamic_pricing",
  MASTERING_AI_V2: "mastering.ai_mastering_v2",
};
```

---

## 139. Type Safety

Generoi TS-tyypit (keys, value type, variants): `getBooleanFlag(FeatureFlags.MASTERING_AI_V2)`.

---

## 140. Unknown Flag

Koodi pyytää tuntematonta flagia → safe default + log warning + monitorointi; testiympäristössä voi failata.

---

## 141. Delete Protection

Ei poistoa flagilta jota sovellukset evaluoivat, ilman varoitusta.

---

## 142. Archive Instead of Delete

Oletus: `Archive`. Hard delete rajattu.

---

## 143. Orphan Detection

Service flag ilman koodiviitettä → `ORPHANED`. Koodi viittaa flagiin jota service ei tunne → `UNKNOWN_FLAG`.

---

## 144. Migration Flags

`market.new_inventory_model` — varo flageja jotka vaikuttavat DB-skeemaan.

---

## 145. Backend Migration Strategy

```
read old + new → write both → backfill → enable new reads → disable old
```
Flagit ohjaavat migraation vaiheita.

---

## 146. Security Feature Flags

`accounts.passkeys`, `accounts.microsoft_login`. Älä anna flageja jotka vahingossa disabloivat core security -kontrollit (esim. server-side authorization).

---

## 147. Do Not Flag Fundamental Authorization

Älä rakenna `tenant_isolation_enabled`-flagia joka voidaan disabloida. Core security ei riipu valinnaisista flageista.

---

## 148. Flag Access Rules

View flags, Edit staging, Edit production, Manage rollout, Manage schedules, Emergency disable, Archive.

---

## 149. Emergency Role

`feature_flags.emergency_disable` ilman flagien luontioikeutta — incident response.

---

## 150. HQ Dashboard

```
Active flags 42 · Production flags 29 · Experiments 7
Scheduled changes 5 · Stale flags 9 · Rollouts at risk 2
```

---

## 151. Scheduled Changes Widget

Näytä seuraavat muutokset.

---

## 152. Risk Widget

`Ticketing Checkout V2: 50% rollout, Errors +230%`.

---

## 153. Product View

Mastering: AI Mastering V2 25%, Reference Engine Pilot, Stem Mastering OFF, New Export Engine 100%.

---

## 154. Customer View

Example Records Oy: Mastering AI V2 Explicit ON, Reference Engine Beta Segment, Stem Mastering OFF.

---

## 155. Flag Usage Analytics

Organizations exposed, Users exposed, Last evaluated, Evaluation count.

---

## 156. Flag Health

`HEALTHY / WARNING / ERROR / STALE`.

---

## 157. Configuration Sync Monitoring

Per tuote: `Stageflow — Config version 128, Updated 12 sec ago`.

---

## 158. Outdated Product Warning

`Ticketing config stale — Last update 14 min ago`.

---

## 159. Change Propagation Target

Normaalit muutokset `< 60 s`, kill switch `< 10–30 s`.

---

## 160. SDK Bootstrap

```
load last config → fetch newest config → start periodic refresh
```

---

## 161. Serverless Consideration

Local memory cache ei jaettu → config endpoint + CDN / Redis / edge cache / lyhyt TTL.

---

## 162. Config CDN

Palvelu julkaisee immutablen konfiguraation: `/config/mastering/production/v128.json`.

---

## 163. No Heavy HQ Dependency

Tuotteet toimivat vaikka HQ UI olisi alhaalla. Read-path pysyy itsenäisesti saatavilla tai cachettuna.

---

## 164. Separate Control Plane and Data Plane

```
Control Plane: HQ management UI, Flag editing, Scheduling
Data Plane:    Fast read/evaluation config, SDK/cache
```

---

## 165. Final Architecture

```
                    MUSAKONTTORI HQ
                         │
                  Feature Flags UI
                         │
                 CONTROL PLANE
                         │
          ┌──────────────┴──────────────┐
          │                             │
     Flag Database                Scheduler
          │                             │
          └──────────────┬──────────────┘
                         │
                  Config Publisher
                         │
                   DATA PLANE
                         │
        ┌────────────────┼────────────────┐
        │                │                │
    Stageflow        Ticketing        Mastering
       SDK              SDK              SDK
        │                │                │
    Local Cache      Local Cache      Local Cache
        │                │                │
    Evaluate          Evaluate         Evaluate
```

---

## Tärkein toteutusperiaate

```
Request → Accounts context (organization_id, user_id, product, plan, role)
→ local Feature Flag SDK → cached rules → evaluation → ON / OFF / variant
```

Ei `HTTP HQ → HTTP HQ → HTTP HQ` jokaisella requestilla.

---

## Suositeltu ensimmäinen MVP

1. `feature_flags`
2. boolean flags
3. development/staging/production
4. product ownership
5. default value
6. explicit organization enable/disable
7. explicit user enable/disable
8. start/end scheduling
9. percentage rollout
10. deterministic organization hashing
11. kill switch
12. HQ Flag list
13. Flag detail
14. Customer targeting
15. scheduled changes
16. audit history
17. shared TypeScript SDK
18. local configuration cache
19. backend flag checks
20. React feature flag helper
21. Accounts organization integration
22. Customer 360 feature view
23. last-known-good fallback
24. rollback to previous version
25. automated evaluation tests

Sen jälkeen: reusable segments, staged rollouts, A/B variants, approval workflows, error correlation, automatic rollback, stale-flag cleanup, code-reference detection, advanced analytics.

---

## Rajaus: Flag ≠ Entitlement ≠ Permission

> **Yksi erittäin tärkeä rajaus:** Feature Flag ja Entitlement eivät saa olla sama asia.

- **Entitlement** — asiakas on ostanut Mastering Pro -ominaisuuden → hänellä on oikeus tuotteeseen.
- **Feature flag** — hän saa käyttää uutta Mastering Engine V2 -versiota pilotissa.
- **Permission** — saako juuri kyseinen käyttäjä sitä käyttää.

```
Entitlement + Permission + Feature Flag = feature available
```

HQ palvelusta säädetään flagit (ohjaa tuotteen oman ylläpidon adminin asetuksia).

---

Related: [[Shared Platform]] · [[MUSAKONTTORI_ARCHITECTURE]] · [[00 Musakonttori HQ]]
