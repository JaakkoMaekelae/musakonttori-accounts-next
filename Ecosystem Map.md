# Ecosystem Map

```
                         MUSAKONTTORI
                              │
                              │
                              HQ
                              │
              ┌───────────────┼───────────────┐
              │               │               │
         Identity         Billing        Analytics
              │               │               │
 ┌────────────┼────────────┬──┴───────┬───────┤
 │            │            │          │       │
Stageflow  Ticketing   LiveGuide   SmartLink Market
 │            │            │          │       │
 Artist      Tickets     Events     Campaign Commerce
 Fans        Orders      Maps       Links    Products
 Events      Payments    Alerts     Leads    Orders
```

## Core Shared Platform

- **Identity** — Unified user across all products
- **Organizations** — Shared org model
- **Billing** — Cross-product billing & entitlements
- **Analytics** — Unified analytics pipeline
- **Notifications** — Shared notification system

## Integration Map

- Stageflow → [[../02 Architecture/Integrations/Stageflow-Ticketing|Ticketing]], [[../02 Architecture/Integrations/Stageflow-LiveGuide|LiveGuide]], [[../02 Architecture/Integrations/Stageflow-SmartLink|SmartLink]]
- Ticketing → [[../02 Architecture/Integrations/Ticketing-LiveGuide|LiveGuide]], [[../02 Architecture/Integrations/Ticketing-Market|Market]]
- SmartLink → [[../02 Architecture/Integrations/SmartLink-Market|Market]], Stageflow CRM
- Market → Ticketing, SmartLink
- LiveGuide → Ticketing, Stageflow

## See Also

- [[Product Matrix]]
- [[Shared Platform]]
- [[Cross Product Integrations]]
