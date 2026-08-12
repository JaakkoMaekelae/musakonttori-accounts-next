---
type: product
status: active
owner: Musakonttori
platform: web
stack:
  - Next.js
  - TypeScript
  - PostgreSQL
  - Prisma
  - Clerk
---

# Accounts

Account management service for Musakonttori. Handles user profiles, authentication flows, and cross-product account settings.

## Main Users
- All Musakonttori users
- Admins (user management)

## Core Modules
- User profile management
- Account settings
- Organization membership management
- Notification preferences
- Privacy & data settings
- Connected accounts

## Connected Products
- All Musakonttori products

## Sub-Projects
- `musakonttori-accounts` — Core account service
- `musakonttori-accounts-client` — Client SDK for account management
- `musakonttori-accounts-next` — Next.js specific account integration

## Current Status

### Building
- User profile CRUD
- Account settings page
- Clerk integration

### Next
- Cross-product preferences sync
- Data export / GDPR tools
- Account merge

## Important Links
- [[Accounts Architecture]]
- [[Accounts Roadmap]]
- [[Accounts Current State]]
