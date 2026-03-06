# Error Response Shape Audit

_Audited: 2026-03-05_
_Scope: All error-producing sites across middleware and API routers, post Phase 6 fixes_

---

## Confirmed Shape

All error responses across the backend use the following uniform shape:

```json
{ "error": "<message string>" }
```

This is the authoritative contract for frontend development. No deviations were found.

---

## Site-by-Site Record

### `src/middleware/index.ts`

| Condition | HTTP Status | Response Body |
|---|---|---|
| `authenticate`: missing or malformed Authorization header | 401 | `{ "error": "Missing or invalid Authorization header" }` |
| `authenticate`: token invalid or expired | 401 | `{ "error": "Invalid or expired token" }` |
| `requireRole`: user type not in allowed roles | 403 | `{ "error": "Forbidden" }` |
| `errorHandler`: unhandled exception | 500 | `{ "error": "Internal Server Error" }` |

Shape: uniform `{ error: string }`. Pass.

---

### `src/api/auth/index.ts` — `handleAuthError`

| Condition | HTTP Status | Response Body |
|---|---|---|
| Validation failure (missing required field, body not object) | 400 | `{ "error": "<field> is required" }` or `{ "error": "Request body must be a JSON object" }` |
| Password exceeds 72 characters | 400 | `{ "error": "password must not exceed 72 characters" }` |
| `DuplicateAccountError` | 409 | `{ "error": "An account with this email already exists" }` |
| `InvalidCredentialsError` | 401 | `{ "error": "Invalid email or password" }` |
| `SuspendedAccountError` | 403 | `{ "error": "This account has been suspended" }` |

Shape: uniform `{ error: string }`. Pass.

---

### `src/api/provider/index.ts` — `handleProviderError`

| Condition | HTTP Status | Response Body |
|---|---|---|
| Validation failure (missing required field, body not object) | 400 | `{ "error": "<field> is required" }` or `{ "error": "Request body must be a JSON object" }` |
| Invalid `difficulty` value | 400 | `{ "error": "difficulty must be one of: EASY, MEDIUM, HARD, LEGENDARY" }` |
| Invalid field type in PATCH body | 400 | `{ "error": "<field> must be a string" }` |
| Invalid `start_time` or `end_time` format | 400 | `{ "error": "start_time and end_time must be valid ISO date strings" }` |
| `LocationNotFoundError` | 404 | `{ "error": "Not found" }` |
| `LocationOwnershipError` | 404 | `{ "error": "Not found" }` |
| `SlotNotFoundError` | 404 | `{ "error": "Not found" }` |

Note: `LocationNotFoundError` and `LocationOwnershipError` both map to HTTP 404 with the generic message `"Not found"`. This is intentional — exposing a different message for ownership vs. existence would allow resource enumeration by unauthenticated (or wrong-provider) callers. Confirmed correct.

Shape: uniform `{ error: string }`. Pass.

---

### `src/api/customer/index.ts` — `handleCustomerError`

| Condition | HTTP Status | Response Body |
|---|---|---|
| Validation failure (missing `time_slot_id`) | 400 | `{ "error": "time_slot_id is required" }` |
| Invalid `difficulty` query parameter | 400 | `{ "error": "difficulty must be one of: EASY, MEDIUM, HARD, LEGENDARY" }` |
| Invalid `date` query parameter format | 400 | `{ "error": "date must be a valid ISO date string" }` |
| `SlotNotFoundError` | 404 | `{ "error": "Not found" }` |
| `BookingNotFoundError` | 404 | `{ "error": "Not found" }` |
| Location not found (inline handler in `GET /locations/:id`) | 404 | `{ "error": "Not found" }` |
| `SlotUnavailableError` | 409 | `{ "error": "Time slot is not available" }` |
| `BookingAlreadyCancelledError` | 409 | `{ "error": "Booking has already been cancelled" }` |
| `BookingOwnershipError` | 403 | `{ "error": "Booking does not belong to this user" }` |

Note on `BookingOwnershipError`: this maps to HTTP 403 with a descriptive message, in contrast to the provider router which maps ownership errors to 404. The distinction is intentional and correct: in the customer context, a customer attempting to cancel a booking that exists but belongs to another user is a meaningful authorization error (403). Returning 404 here would be misleading — the booking exists and the customer knows its ID (they retrieved it via `GET /api/customer/bookings`). The 403 with a descriptive message is appropriate.

Shape: uniform `{ error: string }`. Pass.

---

### `src/api/admin/index.ts` — `handleAdminError`

| Condition | HTTP Status | Response Body |
|---|---|---|
| Validation failure (body not object, invalid `status` value) | 400 | `{ "error": "Request body must be a JSON object" }` or `{ "error": "status must be one of: ACTIVE, SUSPENDED" }` |
| `ProviderNotFoundError` | 404 | `{ "error": "Not found" }` |

Shape: uniform `{ error: string }`. Pass.

---

## Summary

The `{ "error": "<message string>" }` shape is applied consistently at all 404, 400, 401, 403, 409, and 500 error sites across all five modules. No deviations were found. No code changes were required in this audit.

This document serves as the confirmed contract for frontend development and is the authoritative reference for the error response shapes documented in `api-contract.md`.
