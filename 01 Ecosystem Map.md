---
type: architecture
status: future-state
---

# Musakonttori Ecosystem Map

## Core idea

Musakonttori should become a connected music-industry operating ecosystem instead of a collection of unrelated products.

## Ecosystem

```text
                         MUSAKONTTORI
                              |
                +-------------+-------------+
                |                           |
          Shared Platform              Musakonttori HQ
                |
    +-----------+-----------+-----------+-----------+-----------+-----------+
    |           |           |           |           |           |           |
 Stageflow   Ticketing   LiveGuide   SmartLink    Market    SoundLaunch  Mastering
```

## Product roles

### [[10 Stageflow]]

Live music operating system.

Owns:

- Artists
- Fans
- Events
- Festivals
- Venues
- Booking
- Fan CRM
- Fan Intelligence
- Trip planning
- Discovery

### [[11 Ticketing]]

Ticket commerce and event access.

Owns:

- Ticket inventory
- Checkout
- Orders
- Ticket wallet
- Transfers
- Resale
- Waiting lists
- Seating
- Check-in
- Payouts

### [[12 LiveGuide]]

Real-time visitor experience during events.

Owns:

- Schedules
- Event maps
- Vendors
- Toilets
- Water
- Queues
- Real-time alerts
- Safety
- Transport
- Event operations

### [[13 SmartLink]]

Conversion-oriented link and landing-page platform.

Owns:

- SmartLink builder
- Campaign links
- Lead capture
- Analytics
- Templates
- Marketplace
- Premium widgets
- Add-ons

### [[14 Market]]

General-purpose SaaS commerce platform.

Owns:

- Products
- Stores
- Inventory
- Checkout
- Orders
- Shipping
- B2B
- Subscriptions
- Commerce APIs

### [[15 SoundLaunch]]

Music release and distribution platform.

Owns:

- Release creation
- Distribution
- Delivery to DSPs
- Release metadata
- Release status
- Royalties/reporting
- Release operations

### [[16 Mastering]]

Audio finishing platform.

Owns:

- Mix analysis
- Automatic mastering
- AI-assisted mastering
- Reference mastering
- Album mastering
- Master QC
- Master exports

## Core cross-product journeys

### Artist journey

Mastering

→ SoundLaunch

→ SmartLink

→ Stageflow

→ Ticketing

→ LiveGuide

→ Market

### Fan journey

Discover in Stageflow

→ Follow artist

→ Find event

→ Buy ticket

→ Plan trip

→ Attend

→ Use LiveGuide

→ Buy merchandise

→ Become repeat fan

### Organizer journey

Create event

→ Publish in Stageflow

→ Sell with Ticketing

→ Operate event with LiveGuide

→ Sell merchandise through Market

→ Analyze everything in Company Dashboard

## Shared data that should not be duplicated

- User identity
- Organizations
- Roles
- Permissions
- Billing identity
- Entitlements
- Consent
- Notifications
- Audit events
- Support identity
- Shared media metadata
- API client identity

## Product boundary rule

A product should own its core domain.

Other products consume the data through APIs/events instead of implementing duplicate domain logic.

Example:

Stageflow can display ticket availability.

Ticketing owns ticket inventory.

LiveGuide can display a ticket shortcut.

Ticketing owns the ticket.

## Related

- [[02 Shared Platform]]
- [[03 Product Matrix]]
