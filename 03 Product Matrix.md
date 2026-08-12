---
type: matrix
status: future-state
---

# Product Matrix

Legend:

- **Own** = product owns the domain
- **Use** = product consumes the capability
- **Shared** = shared platform capability
- **Optional** = supported when needed

| Capability | Stageflow | Ticketing | LiveGuide | SmartLink | Market | SoundLaunch | Mastering |
|---|---|---|---|---|---|---|---|
| User Identity | Shared | Shared | Shared | Shared | Shared | Shared | Shared |
| Organizations | Shared | Shared | Shared | Shared | Shared | Shared | Shared |
| Permissions | Shared | Shared | Shared | Shared | Shared | Shared | Shared |
| Billing | Shared | Shared | Shared | Shared | Shared | Shared | Shared |
| Artists | Own | Use | Use | Use | Optional | Use | Use |
| Fans | Own | Use | Use | Lead source | Customer | Optional | Optional |
| Events | Own | Use | Use | Use | Optional | Optional | Optional |
| Tickets | Use | Own | Use | Link | Optional | No | No |
| Event Schedule | Use | Optional | Own | No | No | No | No |
| Event Map | Use | No | Own | No | No | No | No |
| Smart Links | Use | Use | Use | Own | Use | Use | Use |
| Store Commerce | Use | Add-ons | Vendor links | Add-ons | Own | Optional | Optional |
| Music Distribution | No | No | No | Campaign | No | Own | Handoff |
| Mastering | No | No | No | Campaign | No | Handoff | Own |
| Fan CRM | Own | Signal | Signal | Signal | Signal | Signal | Signal |
| Analytics | Own + Shared | Own + Shared | Own + Shared | Own + Shared | Own + Shared | Own + Shared | Own + Shared |
| Admin | Shared shell | Shared shell | Shared shell | Shared shell | Shared shell | Shared shell | Shared shell |
| API | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| AI | Yes | Yes | Yes | Yes | Yes | Yes | Yes |

## Architecture principle

Do not let convenience create duplicate ownership.

Examples:

- Stageflow displays ticket sales, Ticketing owns ticket sales.
- LiveGuide displays merch, Market owns commerce.
- SmartLink captures fan signals, Stageflow owns fan intelligence.
- SoundLaunch consumes final masters, Mastering owns mastering history.
