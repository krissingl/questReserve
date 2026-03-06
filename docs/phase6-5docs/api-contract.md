# QuestReserve API Contract

_Version: Phase 6 (post-consolidation)_
_Base URL: `/api`_
_Last updated: 2026-03-05_

All request bodies must be `Content-Type: application/json`. All authenticated routes require a Bearer token in the `Authorization` header obtained from a login endpoint.

All error responses use the shape: `{ "error": "<message>" }`.

## Contents

1. [Health](#1-health)
2. [Auth](#2-auth)
3. [Provider](#3-provider)
4. [Customer](#4-customer)
5. [Admin](#5-admin)
6. [Deprecated](#6-deprecated)

## 1. Health

### `GET /api/health`

Auth: none

**Success : 200**
```json
{ "status": "ok" }
```

## 2. Auth

### `POST /api/auth/end-user/register`

Auth: none

**Request body**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `first_name` | string | yes | non-empty |
| `last_name` | string | yes | non-empty |
| `email` | string | yes | non-empty |
| `password` | string | yes | non-empty, max 72 characters |

**Success : 201**
```json
{ "token": "<jwt>" }
```

**Errors**

| Status | Condition | Message |
|---|---|---|
| 400 | Missing or empty required field | `"<field> is required"` |
| 400 | Body is not a JSON object | `"Request body must be a JSON object"` |
| 400 | Password exceeds 72 characters | `"password must not exceed 72 characters"` |
| 409 | Email already registered | `"An account with this email already exists"` |

### `POST /api/auth/end-user/login`

Auth: none

**Request body**

| Field | Type | Required |
|---|---|---|
| `email` | string | yes |
| `password` | string | yes |

**Success : 200**
```json
{ "token": "<jwt>" }
```

**Errors**

| Status | Condition | Message |
|---|---|---|
| 400 | Missing or empty required field | `"<field> is required"` |
| 400 | Body is not a JSON object | `"Request body must be a JSON object"` |
| 401 | Email not found or password incorrect | `"Invalid email or password"` |

### `POST /api/auth/provider/register`

Auth: none

**Request body**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `first_name` | string | yes | non-empty |
| `last_name` | string | yes | non-empty |
| `email` | string | yes | non-empty |
| `password` | string | yes | non-empty, max 72 characters |
| `organization_name` | string | no | omit or empty string treated as null |

**Success : 201**
```json
{ "token": "<jwt>" }
```

**Errors**

| Status | Condition | Message |
|---|---|---|
| 400 | Missing or empty required field | `"<field> is required"` |
| 400 | Body is not a JSON object | `"Request body must be a JSON object"` |
| 400 | Password exceeds 72 characters | `"password must not exceed 72 characters"` |
| 409 | Email already registered | `"An account with this email already exists"` |

### `POST /api/auth/provider/login`

Auth: none

**Request body**

| Field | Type | Required |
|---|---|---|
| `email` | string | yes |
| `password` | string | yes |

**Success : 200**
```json
{ "token": "<jwt>" }
```

**Errors**

| Status | Condition | Message |
|---|---|---|
| 400 | Missing or empty required field | `"<field> is required"` |
| 400 | Body is not a JSON object | `"Request body must be a JSON object"` |
| 401 | Email not found or password incorrect | `"Invalid email or password"` |
| 403 | Provider account is suspended | `"This account has been suspended"` |

### `POST /api/auth/admin/login`

Auth: none

**Request body**

| Field | Type | Required |
|---|---|---|
| `email` | string | yes |
| `password` | string | yes |

**Success : 200**
```json
{ "token": "<jwt>" }
```

**Errors**

| Status | Condition | Message |
|---|---|---|
| 400 | Missing or empty required field | `"<field> is required"` |
| 400 | Body is not a JSON object | `"Request body must be a JSON object"` |
| 401 | Email not found or password incorrect | `"Invalid email or password"` |

## 3. Provider

All provider endpoints require: `Authorization: Bearer <token>` where the token was issued to a `provider` account.

Common error responses that apply to all provider endpoints:

| Status | Condition | Message |
|---|---|---|
| 401 | Missing or malformed Authorization header | `"Missing or invalid Authorization header"` |
| 401 | Token invalid or expired | `"Invalid or expired token"` |
| 401 | Auth middleware did not populate `req.user` (defensive guard in route handlers) | `"Missing or invalid Authorization header"` |
| 403 | Token is not a provider token | `"Forbidden"` |

### `POST /api/provider/locations`

Create a new booking location owned by the authenticated provider.

**Request body**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `name` | string | yes | non-empty |
| `difficulty` | string | yes | one of: `EASY`, `MEDIUM`, `HARD`, `LEGENDARY` |
| `cancellation_policy` | string | yes | non-empty |
| `description` | string | no | optional |

**Success : 201**
```json
{
  "id": "<uuid>",
  "provider_id": "<uuid>",
  "name": "string",
  "description": "string | null",
  "difficulty": "EASY | MEDIUM | HARD | LEGENDARY",
  "cancellation_policy": "string",
  "created_at": "<ISO datetime>",
  "updated_at": "<ISO datetime>"
}
```

**Errors**

| Status | Condition | Message |
|---|---|---|
| 400 | Missing required field | `"<field> is required"` |
| 400 | Body is not a JSON object | `"Request body must be a JSON object"` |
| 400 | Invalid difficulty value | `"difficulty must be one of: EASY, MEDIUM, HARD, LEGENDARY"` |

### `GET /api/provider/locations`

List all booking locations owned by the authenticated provider.

**Success : 200**

Array of `BookingLocation` objects (same shape as POST success response above).

### `GET /api/provider/locations/:id`

Get a single booking location. Returns 404 if the location does not exist or does not belong to the authenticated provider.

**Success : 200**

Single `BookingLocation` object.

**Errors**

| Status | Condition | Message |
|---|---|---|
| 404 | Location not found or not owned by this provider | `"Not found"` |

### `PATCH /api/provider/locations/:id`

Update a booking location. All fields are optional; only supplied fields are updated.

**Request body**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `name` | string | no | must be a string if present |
| `description` | string | no | must be a string if present |
| `difficulty` | string | no | one of: `EASY`, `MEDIUM`, `HARD`, `LEGENDARY` |
| `cancellation_policy` | string | no | must be a string if present |

**Success : 200**

Updated `BookingLocation` object.

**Errors**

| Status | Condition | Message |
|---|---|---|
| 400 | Body is not a JSON object | `"Request body must be a JSON object"` |
| 400 | Invalid difficulty value | `"difficulty must be one of: EASY, MEDIUM, HARD, LEGENDARY"` |
| 400 | Field present but wrong type | `"<field> must be a string"` |
| 404 | Location not found or not owned by this provider | `"Not found"` |

### `POST /api/provider/locations/:locationId/slots`

Create a time slot for a specific booking location.

**Request body**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `start_time` | string | yes | valid ISO 8601 datetime |
| `end_time` | string | yes | valid ISO 8601 datetime |

**Success : 201**
```json
{
  "id": "<uuid>",
  "booking_location_id": "<uuid>",
  "start_time": "<ISO datetime>",
  "end_time": "<ISO datetime>",
  "created_at": "<ISO datetime>",
  "updated_at": "<ISO datetime>"
}
```

**Errors**

| Status | Condition | Message |
|---|---|---|
| 400 | Missing required field | `"<field> is required"` |
| 400 | Body is not a JSON object | `"Request body must be a JSON object"` |
| 400 | Invalid datetime format | `"start_time and end_time must be valid ISO date strings"` |
| 404 | Location not found or not owned by this provider | `"Not found"` |

### `GET /api/provider/locations/:locationId/slots`

List all time slots for a specific booking location.

**Success : 200**

Array of `TimeSlot` objects (same shape as POST success response above).

**Errors**

| Status | Condition | Message |
|---|---|---|
| 404 | Location not found or not owned by this provider | `"Not found"` |

### `PATCH /api/provider/slots/:id`

Update a time slot. The slot must belong to a location owned by the authenticated provider.

**Request body**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `start_time` | string | no | valid ISO 8601 datetime if present |
| `end_time` | string | no | valid ISO 8601 datetime if present |

**Success : 200**

Updated `TimeSlot` object.

**Errors**

| Status | Condition | Message |
|---|---|---|
| 400 | Body is not a JSON object | `"Request body must be a JSON object"` |
| 400 | Field present but not a string | `"<field> must be a string"` |
| 400 | Invalid datetime format | `"<field> must be a valid ISO date string"` |
| 404 | Slot not found or not owned by this provider | `"Not found"` |

### `DELETE /api/provider/slots/:id`

Delete a time slot. The slot must belong to a location owned by the authenticated provider.

**Success : 204**

No body.

**Errors**

| Status | Condition | Message |
|---|---|---|
| 404 | Slot not found or not owned by this provider | `"Not found"` |

### `GET /api/provider/bookings`

Get all bookings across all of the authenticated provider's locations, as a joined view.

**Success : 200**

Array of `ProviderBookingView`:
```json
[
  {
    "id": "<uuid>",
    "time_slot_id": "<uuid>",
    "end_user_id": "<uuid>",
    "status": "BOOKED | CANCELLED",
    "created_at": "<ISO datetime>",
    "updated_at": "<ISO datetime>",
    "start_time": "<ISO datetime>",
    "end_time": "<ISO datetime>",
    "booking_location_id": "<uuid>",
    "location_name": "string"
  }
]
```

## 4. Customer

Three browse/availability endpoints are publicly accessible (no auth required). Three booking lifecycle endpoints require authentication as an `end_user`.

Common error responses for authenticated customer endpoints:

| Status | Condition | Message |
|---|---|---|
| 401 | Missing or malformed Authorization header | `"Missing or invalid Authorization header"` |
| 401 | Token invalid or expired | `"Invalid or expired token"` |
| 401 | Auth middleware did not populate `req.user` (defensive guard in route handlers) | `"Missing or invalid Authorization header"` |
| 403 | Token is not an end_user token | `"Forbidden"` |

### `GET /api/customer/locations`

Browse all booking locations. Auth: none.

**Query parameters**

| Parameter | Type | Required | Constraints |
|---|---|---|---|
| `difficulty` | string | no | one of: `EASY`, `MEDIUM`, `HARD`, `LEGENDARY` |

**Success : 200**

Array of `BookingLocation` objects.

**Errors**

| Status | Condition | Message |
|---|---|---|
| 400 | Invalid difficulty value | `"difficulty must be one of: EASY, MEDIUM, HARD, LEGENDARY"` |

### `GET /api/customer/locations/:id`

Get a single booking location by ID. Auth: none.

**Success : 200**

Single `BookingLocation` object.

**Errors**

| Status | Condition | Message |
|---|---|---|
| 404 | Location not found | `"Not found"` |

### `GET /api/customer/locations/:id/slots`

Get available (unbooked) time slots for a location. Auth: none.

**Query parameters**

| Parameter | Type | Required | Constraints |
|---|---|---|---|
| `date` | string | no | valid ISO 8601 date string; filters results to that calendar day |

**Success : 200**

Array of available `TimeSlot` objects. Only slots with no active `BOOKED` booking are returned.

**Errors**

| Status | Condition | Message |
|---|---|---|
| 400 | `date` present but not a string | `"date must be a string"` |
| 400 | `date` is not a valid ISO date string | `"date must be a valid ISO date string"` |

### `POST /api/customer/bookings`

Book a time slot. Auth: Bearer token (end_user).

**Request body**

| Field | Type | Required |
|---|---|---|
| `time_slot_id` | string | yes |

**Success : 201**
```json
{
  "id": "<uuid>",
  "time_slot_id": "<uuid>",
  "end_user_id": "<uuid>",
  "status": "BOOKED",
  "created_at": "<ISO datetime>",
  "updated_at": "<ISO datetime>"
}
```

**Errors**

| Status | Condition | Message |
|---|---|---|
| 400 | Missing `time_slot_id` | `"time_slot_id is required"` |
| 400 | Body is not a JSON object | `"Request body must be a JSON object"` |
| 404 | Time slot not found | `"Not found"` |
| 409 | Time slot already booked | `"Time slot is not available"` |

### `GET /api/customer/bookings`

Get the authenticated user's booking history. Auth: Bearer token (end_user).

**Success : 200**

Array of `Booking` objects (same shape as POST success above, `status` may be `BOOKED` or `CANCELLED`).

### `DELETE /api/customer/bookings/:id`

Cancel a booking. Auth: Bearer token (end_user).

**Success : 200**

The updated `Booking` object with `status: "CANCELLED"`.

**Errors**

| Status | Condition | Message |
|---|---|---|
| 403 | Booking exists but belongs to a different user | `"Booking does not belong to this user"` |
| 404 | Booking not found | `"Not found"` |
| 409 | Booking is already cancelled | `"Booking has already been cancelled"` |

## 5. Admin

All admin endpoints require: `Authorization: Bearer <token>` where the token was issued to an `admin` account.

Common error responses that apply to all admin endpoints:

| Status | Condition | Message |
|---|---|---|
| 401 | Missing or malformed Authorization header | `"Missing or invalid Authorization header"` |
| 401 | Token invalid or expired | `"Invalid or expired token"` |
| 403 | Token is not an admin token | `"Forbidden"` |

### `GET /api/admin/providers`

List all registered providers. `password_hash` is excluded from all responses.

**Success : 200**

Array of `SafeProvider`:
```json
[
  {
    "id": "<uuid>",
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "organization_name": "string | null",
    "plan": "FREE | STANDARD | PREMIUM",
    "status": "ACTIVE | SUSPENDED",
    "created_at": "<ISO datetime>",
    "updated_at": "<ISO datetime>"
  }
]
```

### `GET /api/admin/providers/:id`

Get a single provider by ID. `password_hash` is excluded.

**Success : 200**

Single `SafeProvider` object (same shape as list item above).

**Errors**

| Status | Condition | Message |
|---|---|---|
| 404 | Provider not found | `"Not found"` |

### `PATCH /api/admin/providers/:id/status`

Update a provider's account status.

**Request body**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `status` | string | yes | one of: `ACTIVE`, `SUSPENDED` |

**Success : 200**

Updated `SafeProvider` object. `password_hash` is excluded.

**Errors**

| Status | Condition | Message |
|---|---|---|
| 400 | Body is not a JSON object | `"Request body must be a JSON object"` |
| 400 | Invalid or missing `status` value | `"status must be one of: ACTIVE, SUSPENDED"` |
| 404 | Provider not found | `"Not found"` |

### `GET /api/admin/bookings`

Get all bookings across the entire platform, as a joined view including provider information.

**Success : 200**

Array of `AdminBookingView`:
```json
[
  {
    "id": "<uuid>",
    "time_slot_id": "<uuid>",
    "end_user_id": "<uuid>",
    "status": "BOOKED | CANCELLED",
    "created_at": "<ISO datetime>",
    "updated_at": "<ISO datetime>",
    "start_time": "<ISO datetime>",
    "end_time": "<ISO datetime>",
    "booking_location_id": "<uuid>",
    "location_name": "string",
    "provider_id": "<uuid>",
    "provider_name": "string"
  }
]
```

## 6. Deprecated

### `GET /api/protected/me`

**Status: Deprecated internal scaffolding endpoint. Not a production feature.**

Auth: Bearer token (any role: admin, provider, or end_user)

Returns the decoded JWT payload for the authenticated user. This endpoint was created during development scaffolding and is retained pending a dedicated profile endpoint in a future phase.

**Success : 200**
```json
{
  "sub": "<user id>",
  "type": "admin | provider | end_user",
  "iat": <unix timestamp>,
  "exp": <unix timestamp>
}
```

Do not build frontend features against this endpoint.
