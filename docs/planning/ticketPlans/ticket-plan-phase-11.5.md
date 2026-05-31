# Ticket Plan: Phase 11.5 — Profiles & Communication

**Purpose:** Polish the provider My Account page, expose public provider profiles, surface customer identities to providers, and introduce booking-scoped in-platform messaging on the provider side.
**Total tickets:** 12
**Prefix:** P11.5:
**Status: LOCKED**

---

## Ticket 1 of 12

**Title:** P11.5:Fix My Account page desktop layout width

**Description:**
`ProviderAccount.tsx` currently renders at a narrow mobile width on desktop. Apply the same responsive width constraint already used on the Edit Location page: a minimum width of approximately 700px and a maximum of approximately 85% of the viewport width on desktop, collapsing to full width on mobile. No structural or functional changes to the component.

**Acceptance Criteria:**
- [ ] On a desktop viewport (≥1024px), the My Account page renders at no less than ~700px wide and no more than ~85% of the viewport width
- [ ] On a mobile viewport (<768px), the My Account page renders at full width with no horizontal overflow
- [ ] The layout change is achieved via CSS only — no component structure is altered
- [ ] No other pages are affected by this change

---

## Ticket 2 of 12

**Title:** P11.5:Display provider plan and status badges on My Account page

**Description:**
Read `plan` and `status` from the existing `GET /api/provider/profile` response already fetched by `ProviderAccount.tsx` and render them as labelled, display-only badge elements. No new API calls are required. These fields are not editable — they are platform-managed and shown for informational purposes only.

**Acceptance Criteria:**
- [ ] `plan` is rendered as a labelled badge showing one of `FREE`, `STANDARD`, or `PREMIUM`
- [ ] `status` is rendered as a labelled badge showing one of `ACTIVE` or `SUSPENDED`
- [ ] `ACTIVE` and standard plan states use the Spell Gold design token; `SUSPENDED` uses a muted or amber tone distinct from Spell Gold
- [ ] The badges are display-only — no input, dropdown, or edit control is associated with these fields
- [ ] Badge styling is visually consistent with the Phase 7/8 design system (Obsidian background, surface card context, Cinzel or body font as appropriate)
- [ ] `email`, `plan`, and `status` fields do not appear in the Update Profile form

**Dependencies:** #— Ticket 1 (both changes land in the same file; desktop layout should be in place first)

---

## Ticket 3 of 12

**Title:** P11.5:Implement password change flow on My Account page

**Description:**
Replace the always-visible password fields on `ProviderAccount.tsx` with a "Change Password" toggle button. When clicked, three fields are revealed: Current Password, New Password, and Confirm New Password. Wire the form to a dedicated password change endpoint. On the backend, confirm whether the endpoint already exists; if not, create it. The `PATCH /api/provider/profile` endpoint must not accept a password field.

**Acceptance Criteria:**
- [ ] The password fields are hidden on page load; a "Change Password" button is visible in their place
- [ ] Clicking "Change Password" reveals three fields: Current Password, New Password, Confirm New Password
- [ ] Each field has a show/hide toggle consistent with the registration form pattern from Phase 10 Step 2
- [ ] Inline validation on submit: if New Password and Confirm New Password do not match, a Zod refinement error renders inline before any API call is made
- [ ] A dedicated password change endpoint exists on the backend (e.g. `PATCH /api/auth/provider/password` or equivalent); the implementer confirms or creates it — no duplicate is created if one already exists
- [ ] The endpoint requires the `authenticate` middleware, accepts `{ currentPassword, newPassword }`, verifies the current password against the stored hash, and returns `400` or `401` with a descriptive message on failure
- [ ] On success, `password_hash` is updated in the database
- [ ] `PATCH /api/provider/profile` does not accept a `password` field
- [ ] `changePassword(payload)` is added to `provider.api.ts`
- [ ] On success, the form collapses back to the "Change Password" button and an inline success message is shown
- [ ] On failure, the server error message is displayed inline below the form

---

## Ticket 4 of 12

**Title:** P11.5:Enable Update Profile form on My Account page

**Description:**
Remove the disabled state from the "Update Profile" button in `ProviderAccount.tsx` and wire it to the existing `updateMyProfile` function, which calls `PATCH /api/provider/profile`. The form allows editing `first_name`, `last_name`, and `organization_name` only. All fields pre-populate from the `GET /api/provider/profile` response on page load.

**Acceptance Criteria:**
- [ ] The "Update Profile" button is no longer disabled — it submits the form on click
- [ ] The form fields (`first_name`, `last_name`, `organization_name`) are pre-populated with the values from `GET /api/provider/profile` on page load
- [ ] `first_name` and `last_name` are required; submitting with either field empty shows an inline validation error
- [ ] `organization_name` is optional; it may be submitted as an empty string or omitted
- [ ] On success, an inline "Profile updated" message is shown
- [ ] On failure, the server error message is shown inline
- [ ] `email`, `plan`, and `status` are not present in the submitted payload and are not editable via this form
- [ ] The existing `updateMyProfile` function in `provider.api.ts` is used — no new API function is created for this ticket

---

## Ticket 5 of 12

**Title:** P11.5:Create public provider profile backend endpoint

**Description:**
Implement `GET /api/providers/:id/public`. This endpoint requires no authentication and must be accessible to unauthenticated guests. It returns the provider's public identity and their active booking locations. Sensitive fields (`password_hash`, `email`, `plan`, `status`) must never appear in the response.

**Acceptance Criteria:**
- [ ] `GET /api/providers/:id/public` is registered on a public router not behind the `authenticate` middleware
- [ ] The response shape is: `{ id: number, first_name: string, last_name: string, organization_name: string | null, locations: [{ id: number, name: string, description: string, difficulty: "EASY" | "MEDIUM" | "HARD" | "LEGENDARY", image_url: string | null }] }`
- [ ] `password_hash`, `email`, `plan`, and `status` are not present in the response under any circumstances
- [ ] `locations` contains only active (non-suspended) booking locations owned by the specified provider; the implementer documents whether locations are additionally filtered to those with at least one future time slot, or whether all active locations are returned
- [ ] Returns `404` if no provider exists with the given `id`
- [ ] Implemented following the repository/service/controller pattern established in Phase 4 (query in `ProviderRepository` or equivalent, logic in `ProviderService` or a dedicated service, controller registered on a public router)

---

## Ticket 6 of 12

**Title:** P11.5:Build public provider profile frontend page

**Description:**
Create `questreserve-frontend/src/pages/PublicProviderProfile/PublicProviderProfile.tsx`, rendered at `/providers/:providerId/profile` within the guest layout. The page is accessible to both unauthenticated guests and authenticated customers. It displays the provider's identity and their active locations, each linking to the location detail page.

**Acceptance Criteria:**
- [ ] The page reads `:providerId` from the URL and calls `GET /api/providers/:id/public` via a `getPublicProviderProfile(id)` function
- [ ] `getPublicProviderProfile` is added to the public/guest API module (e.g. `guest.api.ts` or `public.api.ts` from Phase 10.2); if no such module exists, one is created — this function must not be added to `provider.api.ts`
- [ ] Provider name (first + last) is displayed; organization name is displayed if present
- [ ] Each active location is displayed with: location name, difficulty badge, cover image (or layout-stable placeholder if `image_url` is null), and a "Book This Adventure" link to `/locations/:id`
- [ ] A loading state renders while the fetch is in progress
- [ ] If the endpoint returns `404`, a "Provider not found" state renders
- [ ] The route `/providers/:providerId/profile` is registered in the guest/public route group and does not require authentication
- [ ] Design tokens are consistent with the Phase 7/8 design system

**Dependencies:** #— Ticket 5 (backend endpoint must exist before the frontend can call it)

---

## Ticket 7 of 12

**Title:** P11.5:Enrich Provider Bookings with customer name

**Description:**
Update the `GET /api/provider/bookings` backend query to join the `end_user` table on `end_user_id` and include `end_user_first_name` and `end_user_last_name` in the response. Update `ProviderBookings.tsx` and the `Booking` type in `provider.api.ts` to consume these fields, replacing the raw UUID display with the customer's full name rendered as a clickable link.

**Acceptance Criteria:**
- [ ] The `GET /api/provider/bookings` query (in `ProviderRepository` or equivalent) joins `end_user` and returns `end_user_first_name` and `end_user_last_name` alongside all existing booking fields
- [ ] The backend service return type is updated if the response shape is explicitly typed
- [ ] The `Booking` type in `provider.api.ts` includes `end_user_first_name: string` and `end_user_last_name: string`
- [ ] `ProviderBookings.tsx` renders the customer's full name in place of the raw `end_user_id` UUID
- [ ] The customer's full name is rendered as a clickable link navigating to `/provider/customers/:customerId`
- [ ] If `end_user_first_name` or `end_user_last_name` is absent (defensive case), the raw UUID is shown as a fallback
- [ ] Existing booking fields (location name, time slot, status) continue to render correctly

---

## Ticket 8 of 12

**Title:** P11.5:Build customer profile view for providers

**Description:**
Create `GET /api/provider/customers/:customerId` on the backend and `ProviderCustomerProfile.tsx` on the frontend. The endpoint is provider-authenticated and returns a customer's identity plus their bookings scoped to this provider's locations only. The frontend page renders at `/provider/customers/:customerId` within `ProviderLayout`.

**Acceptance Criteria:**
- [ ] `GET /api/provider/customers/:customerId` is implemented behind the `authenticate` middleware with provider role
- [ ] The response shape is: `{ id: string, first_name: string, last_name: string, email: string, bookings: [{ id: string, location_name: string, start_time: string, end_time: string, status: "BOOKED" | "CANCELLED" }] }`
- [ ] `bookings` contains only bookings at this provider's own locations — bookings at other providers are excluded
- [ ] If `customerId` does not match any `end_user` record, the endpoint returns `404`
- [ ] If the customer exists but has no bookings with this provider, the endpoint returns `200` with an empty `bookings` array
- [ ] Implemented following the repository/service/controller pattern (new query method, new service method or service, new route handler)
- [ ] `getProviderCustomer(customerId)` is added to `provider.api.ts`
- [ ] `ProviderCustomerProfile.tsx` exists at `questreserve-frontend/src/pages/ProviderCustomerProfile/ProviderCustomerProfile.tsx`
- [ ] The page reads `:customerId` from the URL, calls `getProviderCustomer`, and displays the customer's name and email
- [ ] A read-only list of the customer's bookings at this provider's locations is shown, with location name, time range, and a status badge
- [ ] A loading state and error/empty states are handled
- [ ] A back link to `/provider/bookings` is present
- [ ] The route `/provider/customers/:customerId` is registered within `ProviderLayout`
- [ ] Design tokens are consistent with the Phase 7/8 design system

**Dependencies:** #— Ticket 7 (the bookings page customer name links point to this route)

---

## Ticket 9 of 12

**Title:** P11.5:Create AvatarIcon component and apply it across provider UI

**Description:**
Create a reusable `AvatarIcon` component that renders a circular initials badge from a first and last name. Apply it in three locations: the provider nav welcome message (as a link to `/provider/account`), alongside each customer name on the Provider Bookings page, and at the top of the Provider Customer Profile page. The component contains no navigation logic.

**Acceptance Criteria:**
- [ ] `questreserve-frontend/src/components/AvatarIcon/AvatarIcon.tsx` exists and accepts props: `firstName: string`, `lastName: string`, `size?: "sm" | "md"`
- [ ] The component renders a circular element displaying the first letter of `firstName` and the first letter of `lastName`
- [ ] Styling uses Obsidian background, Spell Gold text, and Cinzel or a fallback monospace font
- [ ] No image upload logic is present — the component renders initials only
- [ ] `ProviderLayout.tsx` renders `AvatarIcon` alongside the "Welcome, [Name]" message; the name/icon area is a clickable link to `/provider/account`
- [ ] `ProviderBookings.tsx` renders `AvatarIcon` alongside each customer's full name; the icon and name together form the clickable link to `/provider/customers/:customerId`
- [ ] `ProviderCustomerProfile.tsx` renders `AvatarIcon` at the top of the page alongside the customer's name
- [ ] `AvatarIcon` does not contain any `Link`, `useNavigate`, or routing logic — all navigation is managed by the consuming component

**Dependencies:** #— Ticket 7 (bookings page customer name links must exist before the icon is applied there), #— Ticket 8 (customer profile page must exist before the icon is applied there)

---

## Ticket 10 of 12

**Title:** P11.5:Implement messaging backend — schema, repository, service, and API

**Description:**
Introduce a `message` table via a new Knex migration and implement the full backend messaging API: send a message, list messages by booking, and mark a message as read. All endpoints require authentication. Access is validated so only parties to the booking (the customer who made it and the provider who owns the location) can send or read its messages.

**Acceptance Criteria:**
- [ ] A new Knex migration creates the `message` table with columns: `id` (uuid, PK, default `gen_random_uuid()`), `booking_id` (uuid, not null, FK to `booking.id`), `sender_id` (uuid, not null), `sender_type` (text, not null, check constraint: `'provider'` or `'customer'`), `body` (text, not null), `created_at` (timestamptz, not null, default `now()`), `read_at` (timestamptz, nullable)
- [ ] `MessageRepository` is created with methods for insert, list-by-booking, and mark-read
- [ ] `MessageService` is created; it resolves `sender_id` and `sender_type` from the auth token and validates that the authenticated user is a party to the booking before allowing send or list
- [ ] A stub comment `// TODO: trigger email/push notification` is present in the service at the point where a notification would be dispatched — no actual notification delivery is implemented
- [ ] `POST /api/messages` accepts `{ bookingId, body }`, requires authentication, and returns the created message
- [ ] `GET /api/messages?bookingId=:id` requires authentication, validates party membership, and returns all messages for the booking ordered by `created_at` ascending
- [ ] `PATCH /api/messages/:id/read` requires authentication, validates that the requesting user did not send the message, sets `read_at = now()`, and returns `204`
- [ ] All three endpoints are registered on an `/api/messages` router following the Phase 4 controller/router pattern
- [ ] No frontend changes are made in this ticket

---

## Ticket 11 of 12

**Title:** P11.5:Build MessageThread component and embed on Provider Customer Profile page

**Description:**
Create `MessageThread.tsx`, a self-contained component that renders and sends messages for a single booking. Embed it on `ProviderCustomerProfile.tsx` below the booking history. Add the three messaging API functions to `provider.api.ts`. The component automatically marks incoming customer messages as read when the provider views the thread.

**Acceptance Criteria:**
- [ ] `questreserve-frontend/src/components/MessageThread/MessageThread.tsx` exists and accepts `bookingId: string` as its only prop
- [ ] On mount, the component calls `GET /api/messages?bookingId=:id` and renders the message list; each message shows sender type label ("You" or "Customer"), message body, and `created_at` timestamp
- [ ] A textarea and "Send" button are present; on submit, `POST /api/messages` is called with `{ bookingId, body }` and the new message is appended to the thread on success
- [ ] After the thread loads, `PATCH /api/messages/:id/read` is called for each message where `sender_type` is `'customer'` and `read_at` is null (i.e. unread customer messages are marked read when the provider views the thread)
- [ ] A loading state renders while the initial fetch is in progress
- [ ] An empty state renders with the text "No messages yet — start the conversation" when the message list is empty
- [ ] `sendMessage`, `getMessages`, and `markMessageRead` are added to `provider.api.ts`
- [ ] `MessageThread` is embedded in `ProviderCustomerProfile.tsx` below the booking history section
- [ ] If a customer has multiple bookings with this provider, the implementer documents whether a thread is rendered per booking or the provider selects a booking — either approach is acceptable for MVP
- [ ] Design tokens are consistent with the Phase 7/8 design system

**Dependencies:** #— Ticket 10 (backend messaging API must exist), #— Ticket 8 (embedded in `ProviderCustomerProfile.tsx`)

---

## Ticket 12 of 12

**Title:** P11.5:Verify end-to-end Phase 11.5 feature set

**Description:**
Run a structured end-to-end verification of all Phase 11.5 deliverables against a running backend with seeded data. No new source code is written in this step. Any failures discovered must be fixed before the phase is closed.

**Acceptance Criteria:**
- [ ] My Account layout: on a desktop viewport, the page renders at ~85% width with a minimum of ~700px — not clipped at mobile width
- [ ] Plan and status: `plan` and `status` values appear as labelled badges on My Account; values match the seeded provider record
- [ ] Password change: the password fields are hidden by default behind "Change Password"; entering an incorrect current password shows a `400`/`401` inline error; entering the correct current password with a new password shows inline success and collapses the form
- [ ] Update Profile: editing `first_name` or `organization_name` and submitting reflects the updated value immediately and persists on page reload
- [ ] Public provider profile: navigating to `/providers/:id/profile` as an unauthenticated guest displays provider name, org, and active locations with difficulty badges; `password_hash`, `email`, `plan`, and `status` are absent from the rendered data
- [ ] Customer name on bookings: `/provider/bookings` displays customer full names in place of raw UUIDs; each name is a clickable link to the customer profile page
- [ ] Customer profile view: clicking a customer name loads the customer profile page with name, email, and their booking history at this provider's locations; bookings from other providers are not shown
- [ ] Avatar icons: initials avatars appear in the provider nav (linked to `/provider/account`) and alongside each customer name on the bookings page and at the top of the customer profile page
- [ ] Messaging — send and receive: from the customer profile page, sending a message appends it to the thread; customer messages that were unread have `read_at` set after the provider views the thread
- [ ] Messaging — access control: requesting messages for a booking the authenticated provider does not own returns `403` or `404`

**Dependencies:** #— Tickets 1–11 (all implementation tickets must be complete before verification)
