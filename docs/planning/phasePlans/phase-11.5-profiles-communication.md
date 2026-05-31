# Phase 11.5: Profiles & Communication

_Created: 2026-05-30 | Status: DRAFT_

## Goal

Polish the provider My Account page, expose public provider profiles to the customer/guest portal, surface customer identities to providers, and introduce in-platform messaging between providers and customers scoped to a booking context.

## Context

Phase 11 (Provider Dashboard) is complete. The provider dashboard delivers: location and time slot management, cover image upload, a bookings read-only view, provider navigation with a welcome message, and the My Account page (`ProviderAccount.tsx`) with partial profile functionality. Specifically from the post-review Session 031 fixes:

- `GET /api/provider/profile` is stable and returns `{ first_name, last_name, email, organization_name, plan, status }`.
- `PATCH /api/provider/profile` is stable and accepts `{ first_name, last_name, organization_name }`. The `updateMyProfile` API function already exists in `provider.api.ts`.
- The My Account page displays provider name, email, and org, with a permanently visible password change form and a disabled "Update Profile" button.
- The Provider Bookings page displays `end_user_id` as a raw UUID — no customer name is shown.

The customer/guest portal (Phases 10–10.4) is complete. Public-facing location browsing works for both authenticated customers and unauthenticated guests under the guest layout. The split-panel browse view and location detail pages are established patterns for this phase to extend.

The backend provider API surface being extended in this phase:

- `GET /api/provider/profile` — read own profile
- `PATCH /api/provider/profile` — update own profile fields
- `PATCH /api/auth/provider/password` (or equivalent) — password change (to be confirmed; see Step 3)
- `GET /api/provider/bookings` — provider's bookings (to be enriched with customer name in Step 7)

New backend endpoints introduced in this phase:

- `GET /api/providers/:id/public` — public provider profile + active locations (Step 5)
- `GET /api/provider/customers/:customerId` — scoped customer profile for providers (Step 8)
- `POST /api/messages` — send a message (Step 10)
- `GET /api/messages?bookingId=:id` — list messages by booking context (Step 10)
- `PATCH /api/messages/:id/read` — mark a message as read (Step 10)

---

## Steps

### Step 1: My Account page — desktop layout fix

The My Account page (`ProviderAccount.tsx`) renders at a narrow mobile width on desktop. Apply the same responsive width fix already in place on the Edit Location page: a minimum width of approximately 700px and a maximum of approximately 85% of the viewport width on desktop, collapsing to full width on mobile. No structural changes to the component — layout only.

This step has no backend dependency and can be done independently.

**Files changed:**
- `questreserve-frontend/src/pages/ProviderAccount/ProviderAccount.tsx`

---

### Step 2: My Account page — provider plan and status display

Read `plan` and `status` from the existing `GET /api/provider/profile` response (already fetched by the My Account page) and render them as display-only fields. `plan` renders one of `FREE`, `STANDARD`, `PREMIUM`; `status` renders one of `ACTIVE`, `SUSPENDED`. Style each as a labelled badge consistent with the Phase 7/8 design system (Spell Gold for active/standard states, a muted or amber tone for SUSPENDED). No edit controls — these are platform-managed fields, display only for MVP.

**Files changed:**
- `questreserve-frontend/src/pages/ProviderAccount/ProviderAccount.tsx`

---

### Step 3: My Account page — password change UX and server-side validation

**Frontend:** Replace the always-visible password fields with a "Change Password" button. When clicked, reveal three fields: Current Password, New Password, Confirm New Password. Inline validation on submit: New Password and Confirm New Password must match (Zod refinement). Show a hide/show toggle on each field, consistent with the pattern established on the registration forms in Phase 10 Step 2.

**Backend:** Confirm whether a dedicated password change endpoint exists (e.g. `PATCH /api/auth/provider/password` or handled via `PATCH /api/provider/profile`). If it does not exist, create it. The endpoint must: require the `authenticate` middleware, accept `{ currentPassword, newPassword }`, verify the current password against the stored hash, return `400` or `401` with a descriptive message if the current password is incorrect, and update `password_hash` on success. The current `PATCH /api/provider/profile` must not accept `password` — password changes are handled only through this dedicated endpoint.

Wire the frontend form to this endpoint. On success, collapse the form back to the "Change Password" button and show an inline success message. On failure, show the server error message inline below the form.

**Files changed:**
- `questreserve-frontend/src/pages/ProviderAccount/ProviderAccount.tsx`
- `questreserve-frontend/src/api/provider.api.ts` (add `changePassword` function)
- Backend: password change endpoint (new or confirmed existing)

---

### Step 4: My Account page — enable Update Profile form

Remove the disabled state from the "Update Profile" button and wire it to the existing `updateMyProfile` / `PATCH /api/provider/profile` call. The form must allow editing `first_name`, `last_name`, and `organization_name`. Validate fields before submission: `first_name` and `last_name` required, `organization_name` optional. Show inline success feedback ("Profile updated") on success. Show an inline error message on failure. The form fields must pre-populate from the existing profile fetch (`GET /api/provider/profile`) on page load.

`email`, `plan`, and `status` are not editable in this form.

**Files changed:**
- `questreserve-frontend/src/pages/ProviderAccount/ProviderAccount.tsx`

---

### Step 5: Backend — public provider profile endpoint

Create `GET /api/providers/:id/public`. This endpoint requires no authentication and must be accessible to guests. It returns:

```
{
  id: number,
  first_name: string,
  last_name: string,
  organization_name: string | null,
  locations: [
    {
      id: number,
      name: string,
      description: string,
      difficulty: "EASY" | "MEDIUM" | "HARD" | "LEGENDARY",
      image_url: string | null
    }
  ]
}
```

`password_hash`, `plan`, `status`, and `email` must never be included in this response. `locations` is filtered to active (non-suspended) booking locations owned by this provider — specifically those with at least one available future time slot, or all locations if availability filtering is too complex for MVP (document which is chosen). Return `404` if the provider does not exist. Implement following the repository/service/controller pattern established in Phase 4.

**Files changed/created:**
- `questreserve-backend/src/repositories/` (extend `ProviderRepository` or add a query method)
- `questreserve-backend/src/services/` (new method on `ProviderService` or a dedicated `PublicProviderService`)
- `questreserve-backend/src/api/` (new public route — not behind the `authenticate` middleware)

---

### Step 6: Frontend — public provider profile page

Create `questreserve-frontend/src/pages/PublicProviderProfile/PublicProviderProfile.tsx`, rendered at `/providers/:providerId/profile` within the guest layout (same layout used for unauthenticated location browsing in Phase 10.2). The page must:

- Read `:providerId` from the URL and call `GET /api/providers/:id/public`.
- Display provider name (first + last) and organization name (if present).
- Display a list of their active booking locations. Each entry shows: location name, difficulty badge, cover image (or placeholder), and a "Book This Adventure" link to the location detail page (`/locations/:id` for guests, or `/customer/locations/:id` for authenticated customers — use the guest path as the universal link since the guest layout handles both).
- Show a loading state while fetching.
- Show a `404` / "Provider not found" state if the endpoint returns 404.
- Apply design tokens consistent with the Phase 7/8 design system.
- This page is accessible to both unauthenticated guests and authenticated customers. No provider auth is required.

Add the corresponding API function to a public or guest API module (not `provider.api.ts`, which is provider-dashboard-only). If a `guest.api.ts` or `public.api.ts` module exists from Phase 10.2, add it there; otherwise create one.

Register the route in the guest/public route group.

**Files created/changed:**
- `questreserve-frontend/src/pages/PublicProviderProfile/PublicProviderProfile.tsx`
- `questreserve-frontend/src/api/` (add `getPublicProviderProfile(id)` to the appropriate public API module)
- `questreserve-frontend/src/routes/` (register `/providers/:providerId/profile`)

---

### Step 7: Enrich Provider Bookings with customer name

**Backend:** Update the `GET /api/provider/bookings` query (in `ProviderRepository` or equivalent) to join `end_user` on `end_user_id` and include `end_user_first_name` and `end_user_last_name` in the response alongside the existing booking fields. No new endpoint — this is an additive change to the existing response shape.

**Frontend:** Update `ProviderBookings.tsx` and the relevant TypeScript types to consume `end_user_first_name` / `end_user_last_name`. Replace the raw UUID display with the customer's full name. The customer name is rendered as a clickable link that navigates to `/provider/customers/:customerId` (introduced in Step 8). If the name fields are absent (defensive case), fall back to displaying the UUID.

**Files changed:**
- `questreserve-backend/src/repositories/` (extend booking query with join)
- `questreserve-backend/src/services/` (update return type if typed)
- `questreserve-frontend/src/pages/ProviderBookings/ProviderBookings.tsx`
- `questreserve-frontend/src/api/provider.api.ts` (update `Booking` type)

---

### Step 8: Backend and frontend — customer profile view for providers

**Backend:** Create `GET /api/provider/customers/:customerId`. This endpoint requires provider authentication. It returns:

```
{
  id: string,
  first_name: string,
  last_name: string,
  email: string,
  bookings: [
    {
      id: string,
      location_name: string,
      start_time: string,
      end_time: string,
      status: "BOOKED" | "CANCELLED"
    }
  ]
}
```

`bookings` is scoped to only the bookings at this provider's own locations — a provider cannot view a customer's bookings at other providers. Return `404` if the customer does not exist or has no bookings with this provider (document which behavior is chosen). Implement following the repository/service/controller pattern.

**Frontend:** Create `questreserve-frontend/src/pages/ProviderCustomerProfile/ProviderCustomerProfile.tsx`, rendered at `/provider/customers/:customerId` within `ProviderLayout`. The page must:

- Read `:customerId` from the URL and call `GET /api/provider/customers/:customerId`.
- Display customer name and email.
- Display a read-only list of their bookings at this provider's locations: location name, time range, status badge.
- Show a loading state and error/empty states.
- Include a back link to `/provider/bookings`.
- Apply design tokens consistent with the Phase 7/8 design system.

Add `getProviderCustomer(customerId)` to `provider.api.ts`. Register the route within `ProviderLayout`.

**Files created/changed:**
- `questreserve-backend/src/repositories/` (new customer-scoped query)
- `questreserve-backend/src/services/` (new method or service)
- `questreserve-backend/src/api/` (new route handler)
- `questreserve-frontend/src/pages/ProviderCustomerProfile/ProviderCustomerProfile.tsx`
- `questreserve-frontend/src/api/provider.api.ts` (add `getProviderCustomer`)
- `questreserve-frontend/src/routes/` (register `/provider/customers/:customerId`)

---

### Step 9: Avatar/initials icon component

Create a reusable `AvatarIcon` component at `questreserve-frontend/src/components/AvatarIcon/AvatarIcon.tsx`. Props: `firstName: string`, `lastName: string`, `size?: "sm" | "md"`. The component renders a small circular element displaying the user's initials (first letter of first name + first letter of last name), styled with Obsidian background, Spell Gold text, and Cinzel or a fallback monospace font. No image upload — this is an initials placeholder for MVP. Image upload is deferred pending image hosting infrastructure (see Notes).

Apply the component in the following locations:

1. **Provider nav welcome message** — Alongside "Welcome, [Name]" in `ProviderLayout`'s nav bar. The name/icon area must be a clickable link to `/provider/account`. This replaces or wraps the existing plain-text welcome message.
2. **Provider Bookings page** — Alongside each customer name in the bookings list (introduced in Step 7). The icon + name together form the clickable link to `/provider/customers/:customerId` (Step 8).
3. **Customer profile view** (Step 8) — Display the customer's avatar at the top of the `ProviderCustomerProfile` page alongside their name.

`AvatarIcon` must not contain any navigation logic — links are managed by the consuming page or layout.

**Files created/changed:**
- `questreserve-frontend/src/components/AvatarIcon/AvatarIcon.tsx`
- `questreserve-frontend/src/layouts/ProviderLayout/ProviderLayout.tsx`
- `questreserve-frontend/src/pages/ProviderBookings/ProviderBookings.tsx`
- `questreserve-frontend/src/pages/ProviderCustomerProfile/ProviderCustomerProfile.tsx`

---

### Step 10: In-platform messaging — backend schema and API

Introduce a `message` table and backend messaging API. This step is backend-only; the frontend UI is built in Step 11.

**Schema — new Knex migration:**

```
message
  id           uuid primary key default gen_random_uuid()
  booking_id   uuid not null references booking(id)
  sender_id    uuid not null
  sender_type  text not null check (sender_type in ('provider', 'customer'))
  body         text not null
  created_at   timestamptz not null default now()
  read_at      timestamptz
```

Messages are scoped to a booking. `booking_id` is the only context field for MVP — location-level messaging is deferred (see Notes). `sender_id` references either a `provider.id` or `end_user.id` depending on `sender_type`; a polymorphic FK is not enforced at the DB level for MVP but must be validated at the service layer.

**Backend endpoints:**

- `POST /api/messages` — Send a message. Requires authentication (provider or customer). Body: `{ bookingId, body }`. The service resolves `sender_id` and `sender_type` from the auth token. Validates that the authenticated user is a party to the booking (the customer who made it, or the provider who owns the location). Returns the created message.
- `GET /api/messages?bookingId=:id` — List all messages for a booking, ordered by `created_at` ascending. Requires authentication. Validates that the requesting user is a party to the booking. Returns the full message list.
- `PATCH /api/messages/:id/read` — Mark a message as read (`read_at = now()`). Requires authentication. Validates that the requesting user is the recipient of the message (i.e. did not send it). Returns `204`.

Implement following the repository/service/controller pattern. Create `MessageRepository`, `MessageService`, and register routes on an `/api/messages` router. Leave the service layer's notification hook as a documented stub comment (`// TODO: trigger email/push notification`) — no actual notification delivery in this phase.

**Files created:**
- `questreserve-backend/migrations/` (new migration for `message` table)
- `questreserve-backend/src/repositories/message.repository.ts`
- `questreserve-backend/src/services/message.service.ts`
- `questreserve-backend/src/api/messages/` (controller + router)

---

### Step 11: In-platform messaging — frontend UI

Build messaging UI accessible from the provider bookings side. This is the MVP messaging surface; customer-side messaging UI is deferred (see Notes).

**Provider side — booking message thread:**

Create `questreserve-frontend/src/components/MessageThread/MessageThread.tsx`. Props: `bookingId: string`. The component:

- Calls `GET /api/messages?bookingId=:id` on mount and renders the message list. Each message shows: sender type label ("You" or "Customer"), message body, and `created_at` timestamp.
- Provides a textarea and "Send" button. On submit, calls `POST /api/messages` with `{ bookingId, body }` and appends the new message to the thread.
- Calls `PATCH /api/messages/:id/read` for any unread messages where `sender_type !== 'provider'` after the thread loads (i.e. marks customer messages as read when the provider views the thread).
- Shows a loading state and an empty state ("No messages yet — start the conversation").
- Applies design tokens consistent with the Phase 7/8 design system.

Embed `MessageThread` on `ProviderCustomerProfile.tsx` (Step 8) below the booking history, passing the most relevant `bookingId`. If a customer has multiple bookings, render a thread per booking or allow the provider to select a booking — document which approach is taken.

Add API functions `sendMessage`, `getMessages`, `markMessageRead` to `provider.api.ts`.

**Files created/changed:**
- `questreserve-frontend/src/components/MessageThread/MessageThread.tsx`
- `questreserve-frontend/src/pages/ProviderCustomerProfile/ProviderCustomerProfile.tsx`
- `questreserve-frontend/src/api/provider.api.ts`

---

### Step 12: End-to-end verification

Verify all Phase 11.5 deliverables against a running backend with seeded data. No new source code is written in this step. Any failures discovered must be fixed before the phase is closed.

**Test paths:**

1. **My Account layout** — Log in as a provider on a desktop viewport. Confirm My Account renders at ~85% width with appropriate minimum, not clipped at mobile width.
2. **Plan and status display** — Confirm `plan` and `status` values appear as labelled badges on My Account. Confirm they match the seeded provider record.
3. **Password change** — Confirm the password form is hidden by default behind a "Change Password" button. Enter an incorrect current password — confirm a `400`/`401` error is shown inline. Enter the correct current password with a new password — confirm success feedback and form collapse.
4. **Update Profile** — Edit `first_name` or `organization_name` and submit. Confirm the updated value is reflected immediately and persists on page reload.
5. **Public provider profile** — Navigate to `/providers/:id/profile` as a guest (unauthenticated). Confirm provider name, org, and their active locations are displayed with difficulty badges. Confirm `password_hash`, `email`, `plan`, and `status` are absent from the rendered data.
6. **Customer name on bookings** — Navigate to `/provider/bookings`. Confirm customer names appear in place of raw UUIDs. Confirm each name is a clickable link.
7. **Customer profile view** — Click a customer name from the bookings list. Confirm the customer profile page loads with name, email, and scoped booking history. Confirm bookings from other providers are not shown.
8. **Avatar icons** — Confirm initials avatars appear in the provider nav (linked to `/provider/account`) and alongside each customer name on the bookings page.
9. **Messaging — send and receive** — From the customer profile page, send a message to a customer's booking. Confirm it appears in the thread. Confirm `read_at` is set on customer messages after the provider views the thread.
10. **Messaging — access control** — Attempt to fetch messages for a booking the authenticated provider does not own. Confirm the endpoint returns `403` or `404`.

---

## Notes

- **Messaging scope decision.** In-platform messaging (Steps 10–11) is included in this phase rather than deferred, but is scoped to the provider-facing surface only. Customer-side messaging UI (a customer viewing and sending messages about their own booking) is deferred to a follow-on phase or post-MVP. The backend API (Step 10) is symmetric — both sides can send — but only the provider UI is built in this phase.
- **Message context is booking-scoped only.** The `location_id` context field mentioned in the scope brief is deferred. All MVP messages attach to a `booking_id`. Location-level messaging (e.g. pre-booking enquiries) is a post-MVP feature; the schema can be extended with a nullable `location_id` column at that point without a breaking migration.
- **`sender_id` FK enforcement.** A single-column FK cannot reference two tables. For MVP, the `sender_id` / `sender_type` pair is validated at the service layer only. A future migration can introduce a proper polymorphic pattern or a union table if needed.
- **Avatar image upload is deferred.** Profile image upload for providers and customers requires a file hosting strategy (S3 or equivalent) that is not in scope for this phase. The `AvatarIcon` component (Step 9) renders initials only. Image upload is listed as a stretch goal in `mvp-implementation-phases.md` and remains there.
- **Public provider profile — location availability filter.** Step 5 notes that filtering locations to those with at least one future time slot is preferred but may be complex. If the join is straightforward, include it. If it requires a subquery that significantly complicates the endpoint, return all active locations for the provider and document that availability is not pre-filtered. The implementer documents which was done.
- **`GET /api/provider/customers/:customerId` — 404 behavior.** If a valid customer exists but has no bookings with this provider, return an empty `bookings` array rather than `404`. Reserve `404` for the case where `customerId` does not match any `end_user` record.
- **Password change endpoint.** If `PATCH /api/auth/provider/password` or an equivalent already exists from a prior phase or session fix, confirm its contract matches what Step 3 requires before creating a duplicate. Check the backend route files before implementing.
- **Step sequence.** Steps 1–4 (My Account polish) are independent and can be done in any order or in parallel. Step 5 (backend public profile) must precede Step 6 (frontend public profile page). Step 7 (bookings enrichment) must precede Step 9's bookings-page avatar work. Step 8 (customer profile) must precede Step 11 (message thread embed). Step 10 (messaging backend) must precede Step 11 (messaging frontend). Step 9 (AvatarIcon) can be built in parallel with Steps 7–8 and applied once both are ready.
- **Phase 12 is unaffected.** The Admin Panel (Phase 12) has no dependency on this phase and can proceed independently once Phase 11 is closed.
