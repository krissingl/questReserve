# User Stories

## Adventure Party Leaders (Customer)
This user type is the end user. They are either an individual, one of a pair, or lead a group of adventurers. This user type will be referred to as "Customer" throughout this document.

### Discovery & Booking (MVP Core)
**US-AP-01**  
As a Customer, I want to browse available dungeon raids by location, difficulty, and date so that I can find a raid suitable for my party.

**US-AP-02**  
As a Customer, I want to view detailed dungeon information (ruleset, difficulty rating, loot type, party size limits) so that I can decide whether to book.

**US-AP-03**  
As a Customer, I want to see real-time availability for raid slots so that I do not attempt to book unavailable times.

**US-AP-04**  
As a Customer, I want to book a dungeon raid for a specific date and time so that my party is reserved.

**US-AP-05**  
As a Customer, I want to pay for a booking during checkout so that my reservation is confirmed.  
Acceptance notes:
   * Payment success confirms booking
   * Payment failure does not block slot availability indefinitely

### Account & Booking Management (MVP)
**US-AP-06**  
As a Customer, I want to create an account so that I can manage my bookings.

**US-AP-07**  
As a Customer, I want to view my upcoming and past bookings so that I can track my raid history.

**US-AP-08**  
As a Customer, I want to cancel or reschedule a booking according to the dungeon’s ruleset so that I can adjust plans.

### AI Assistance (Lightweight / Stretch MVP)

**US-AP-09**  
As a Customer, I want to ask an AI assistant questions about dungeon difficulty, rules, or availability so that I can make informed booking decisions.

**US-AP-10**  
As a Customer, I want the AI assistant to recommend dungeons based on my party size and experience so that I can quickly find suitable options.

## Dungeon Owners (Provider)
This user type represents B2B Users. These Users provide the venue and experience to Customers. This user type will be referred to as a "Provider" in this document.

### Dungeon & Schedule Management (MVP Core)

**US-DO-01**  
As a Provider, I want to create and manage dungeon listings so that adventure parties can book raids.

**US-DO-02**  
As a Provider, I want to define available raid schedules and time slots so that bookings align with my capacity.

**US-DO-03**  
As a Provider, I want to block off unavailable dates or times so that bookings reflect real-world constraints.

### Rulesets & Policies (MVP)

**US-DO-04**  
As a Provider, I want to define rulesets (party size, level requirements, cancellation policy) so that bookings follow my dungeon’s constraints.

**US-DO-05**  
As a Provider, I want rulesets enforced automatically during booking so that invalid reservations cannot be made.

### Booking & Revenue Management (MVP)

**US-DO-06**  
As a Provider, I want to view upcoming and past bookings so that I can prepare for raids.

**US-DO-07**  
As a Provider, I want to see revenue generated from bookings so that I can track dungeon performance.

**US-DO-08**  
As a Provider, I want to manage payout details so that I can receive payments through the platform.

### Analytics & Marketing (Post-MVP / Stretch)

**US-DO-09**  
As a Provider, I want to view analytics on booking frequency and occupancy rates so that I can optimize my schedule.

**US-DO-10**  
As a Provider, I want to opt into marketing features provided by WizardsTowerCorp so that my dungeon gains more visibility.

## WizardsTowerCorp Admins (Client)
This user type represents our Internal users and our client. These Users belong to the WizardTowerCorp that will be our direct client. Our client uses the app to provide a service for the Providers. This user type will be referred to as a "Client" in this document.

### Platform Administration (MVP Core)
**US-WT-01** : As a Client, I want to manage dungeon owner accounts so that I can onboard, suspend, or assist clients.

**US-WT-02** : As a Client, I want to view platform-wide booking activity so that I can monitor system health and usage.

### Analytics & Insights (MVP → Post-MVP)
**US-WT-03** : As a Client, I want to view aggregated booking and revenue analytics so that I can understand regional demand.

**US-WT-04** : As a Client, I want to identify high-performing and underperforming dungeons so that I can target marketing efforts.

### Configuration & Governance (Post-MVP)
**US-WT-05** : As a Client, I want to configure global rules (fees, commission rates, default policies) so that the platform remains consistent.

**US-WT-06** : As a Client, I want audit logs of critical actions so that I can investigate disputes or system issues.

## Platform & System Responsibilities
Stories to keep in mind from a platform perspective.  

**US-SYS-01** : As the platform, I want to support multiple dungeon owners as isolated tenants so that data remains secure and scalable.

**US-SYS-02** : As the platform, I want booking availability to be consistent under concurrent access so that double-bookings cannot occur.

**US-SYS-03** : As the platform, I want payment processing to be idempotent so that users are not charged multiple times for the same booking.

**US-SYS-04** : As the platform, I want core services to be observable (logging, metrics, tracing) so that system issues can be diagnosed.


