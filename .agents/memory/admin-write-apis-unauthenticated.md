---
name: Admin-write APIs are protected by bearer-token auth
description: How server-side admin authorization works in api-server and what new admin-write routes must do.
---

# Admin-write API endpoints require a bearer token

In `@workspace/api-server`, admin/write mutations (products, discounts, order-status PATCH, customer delete, campaign, wholesale delete, quote-whatsapps replace) are protected server-side by a `requireAdmin` middleware. Unauthenticated writes get `401 {"error":"No autorizado"}`.

**How it works:**
- Login at `POST /api/admin/login` validates a plaintext password against the `ADMIN_PASSWORD` secret and returns an HMAC-signed token (7-day expiry). The token signing key is *derived from* `ADMIN_PASSWORD` (HMAC), so changing the password invalidates all existing tokens and no second secret is needed.
- The frontend stores the token in localStorage (`gtr_admin_token`) and registers it via `setAuthTokenGetter` from `@workspace/api-client-react`; the `customFetch` mutator auto-attaches `Authorization: Bearer <token>` to every request when the getter returns non-null.
- The admin UI auth gate is token-presence based (no more hardcoded `RIVERO123`/`gtr_admin_auth` flag).

**Scope (intentional):** Only WRITES are protected. Public-by-design routes stay open: storefront `POST /orders`, customer/wholesale registration, storage upload URL requests, and admin-read GETs (orders list/export, customers, dashboard). FinanceGate (`CESIA123`) is a separate, untouched client-side gate.

**How to apply:** New admin-write routes must add `requireAdmin` and `security: [{bearerAuth: []}]` in the OpenAPI spec. Public storefront/registration writes stay open.

**Gotcha (Express 5 typing):** Adding a middleware before a route handler degrades Express 5's path-based `req.params` inference (params become `string | string[]`). Fix by passing the route params generic explicitly, e.g. `router.patch<{ id: string }>("/products/:id", requireAdmin, handler)`.
