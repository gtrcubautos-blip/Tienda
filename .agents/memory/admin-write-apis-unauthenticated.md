---
name: Admin-write APIs are unauthenticated by design
description: Why the api-server has no server-side authz on admin/write endpoints, and what that implies for new routes.
---

# Admin-write API endpoints have no server-side auth

In `@workspace/api-server`, admin/write mutations (orders, products, discounts, quote-whatsapps, etc.) have **no backend authentication or authorization**. Admin access is gated **client-side only** (localStorage passwords: admin RIVERO123, finance CESIA123). The OpenAPI spec defines no security schemes; routes are mounted openly.

**Why:** This is the established app convention — the storefront creates orders unauthenticated, and the admin UI is a thin client-side gate. New write routes follow this same pattern intentionally to stay consistent.

**How to apply:** When adding a new admin-write endpoint, do NOT bolt server-side auth onto just that one route — it would be inconsistent and provide little real protection while the rest stay open. If real auth is needed, it must be an app-wide decision (middleware + spec security) made with the user. Architect reviews will flag this as "broken access control"; it is a known, accepted, whole-app gap, not a per-route defect.
