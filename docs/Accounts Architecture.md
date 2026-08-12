---
type: architecture
product: Accounts
---

# Accounts Architecture

## Tech Stack
- Next.js 16+ (App Router)
- TypeScript
- PostgreSQL + Prisma
- Clerk Authentication

## Packages
- `musakonttori-accounts` — Core account service
- `musakonttori-accounts-client` — Client SDK
- `musakonttori-accounts-next` — Next.js integration

## Purpose
Centralized account management that all products use. Single user profile across all Musakonttori services.

## Key Features
- Profile CRUD
- Organization membership views
- Notification preferences
- Privacy settings
- Data export
- Account deletion (GDPR)
