---
type: architecture
status: future-state
priority: critical
---

# Shared Platform

## Vision

Build shared capabilities once and allow all Musakonttori products to consume them.

The goal is to avoid five or seven separate implementations of authentication, organizations, billing, permissions, notifications and support.

> **Status 2026-08-14:** Identity and authentication are now realized across all products — consumer login via accounts (social login included), admin via Clerk + HQ-authz, impersonation via the shared @musakonttori/auth JWT. See MUSAKONTTORI_ARCHITECTURE.md §7.3.

## Shared Identity

- User ID
- Email
- Authentication providers
- User profile
- Language
- Country
- Timezone
- Security settings
- MFA
- Sessions

## Shared Organizations

- Organization ID
- Legal company data
- Display name
- Brand
- Billing identity
- Members
- Roles
- Products enabled
- Organization ownership

## Shared Permissions

Support:

- Product-level access
- Organization-level access
- Resource-level access
- Custom roles
- Read / create / edit / publish / delete permissions
- Finance permissions
- Developer permissions
- Support permissions

## Shared Billing

- Billing customer
- Payment methods
- Subscriptions
- Product plans
- Add-ons
- Credits
- Invoices
- Usage billing
- Discounts
- VAT information

## Entitlements

Central capability:

`canUseFeature(subject, feature, context)`

Entitlements can originate from:

- Subscription
- Add-on
- Marketplace purchase
- Trial
- Promotion
- Super Admin override
- Enterprise contract

## Shared Customer Identity

Where consent and product rules allow:

- Customer ID
- Fan ID
- Ticket buyer identity
- Store customer identity
- SmartLink lead identity

Do not merge identities in ways that violate privacy or consent boundaries.

## Shared Notifications

Channels:

- In-app
- Email
- Push
- SMS where appropriate

Shared features:

- Preferences
- Templates
- Delivery logging
- Retry
- Localization

## Shared Media

Common media system for:

- Images
- Video
- Documents
- Logos
- Audio metadata
- Brand assets

Sensitive audio in Mastering should use stricter access rules.

## Shared Search

Cross-product internal search:

- Users
- Organizations
- Artists
- Events
- Orders
- SmartLinks
- Stores
- Tickets
- Projects

## Shared Analytics

Common event taxonomy.

Examples:

- user.created
- organization.created
- event.viewed
- ticket.purchased
- smartlink.clicked
- order.completed
- liveguide.opened
- mastering.completed

## Shared Audit Log

Track:

- Actor
- Organization
- Product
- Action
- Target
- Previous value
- New value
- Timestamp
- Security metadata

## Shared Support

- Support case identity
- Product
- User
- Organization
- Context
- SLA
- Assignee
- Internal notes
- Impersonation link

## Shared Super Admin

See [[00 Musakonttori HQ]].

## Shared API Foundation

- API keys
- OAuth applications
- Scopes
- Rate limits
- Usage
- Webhooks
- Signing secrets
- Delivery logs

## Shared Feature Flags

See [[MUSAKONTTORI_FEATURE_FLAGS]] for the full design.

Target:

- Environment
- Product
- Country
- User
- Organization
- Role
- Beta group
- Percentage

## Shared Security

- RBAC
- Tenant isolation
- Secure sessions
- Secrets
- Audit logs
- Encryption
- File validation
- Security monitoring

## Shared GDPR

- Consent
- Data access
- Data correction
- Data export
- Data deletion
- Retention
- EU data residency
- Processor documentation

## Target architecture

Products should depend on shared platform services through stable internal APIs/events rather than direct database coupling.

## Definition of Done

A company using Stageflow, Ticketing and LiveGuide should not need three different accounts, three team configurations, three billing identities and three security settings.
