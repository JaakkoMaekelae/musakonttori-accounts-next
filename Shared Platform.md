---
type: architecture
updated: 2026-08-12
---

# Shared Platform

## Current State

| Capability | Current | Target |
|-----------|---------|--------|
| Identity | Unified via accounts (consumer) + Clerk/HQ (admin) | Unified via accounts + social login + MFA |
| Organizations | Per-product | Shared org model |
| Roles | Per-product | Cross-product RBAC |
| Permissions | Per-product | Central entitlement engine |
| Billing | Per-product (Stripe) | Shared billing service |
| Entitlements | N/A | Cross-product feature flags |
| Customers | Per-product | Customer 360 |
| CRM | Stageflow + SmartLink | Shared CRM |
| Notifications | Per-product | Unified notification hub |
| Email | Per-product | Shared email service |
| Media | Per-product (S3) | Shared media library (R2) |
| Search | Per-product | Unified search |
| Analytics | Stageflow + Ticketing | Shared analytics pipeline |
| Audit | Per-product | Central audit log |
| Feature Flags | N/A | [[MUSAKONTTORI_FEATURE_FLAGS]] - shared feature flag system |
| API | Per-product | Unified API gateway |
| Webhooks | Per-product | Central webhook hub |
| Admin | Clerk + HQ-authz (checkAdminAccess) | Unified Super Admin |

## Priority Order

1. Identity → one user across all products
2. Organizations → one org across all products
3. Billing → one subscription, cross-product entitlements
4. Notifications → one place to manage all notifications
5. Analytics → one view of all product data

## Decisions

- [[../10 Decisions/ADR-001 Shared Organization Model]]
- [[../10 Decisions/ADR-002 Unified Authentication]]
- [[../10 Decisions/ADR-003 Product Entitlement System]]
