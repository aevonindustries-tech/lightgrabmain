# Lightgrabmain

Build a serious, production-minded web application called LightGrab for Aevon Industries. This is an original product, not a generic marketplace template. The business starts in Oron, Akwa Ibom, Nigeria. Customers submit shopping lists and quantities for goods sold in local markets; trusted partner sellers fulfil requests, market runners purchase/prepare items, and couriers deliver them. Also support participating restaurants, bakeries, factories, and other local businesses.

NON-NEGOTIABLE PRODUCT AND DESIGN DIRECTION
- Do not produce a generic AI-looking SaaS dashboard, generic shadcn starter, or one giant dashboard containing every role. Avoid repetitive rounded cards, gratuitous gradients, oversized hero typography, stock illustrations, fake charts, fake activity, placeholder buttons, and template-like layouts.
- Create a distinctive, restrained, premium Nigerian commerce/delivery product identity. Strong editorial hierarchy, deliberate spacing, crisp typography, purposeful color, practical mobile-first layouts, real product photography only where useful, and coherent responsive behavior. Make it feel art-directed by a human product designer.
- Separate role experiences and navigation. Customer, Seller, Runner, Courier, Operations, Admin, and Super Admin are distinct roles with distinct permissions, routes, screens, and workflows. Never expose another role's dashboard or controls to unauthorized users.
- Every visible interactive control must work. No dead buttons, fake actions, inert forms, decorative controls that imply functionality, or success messages without persisted state. If a feature is not implemented, do not present it as working.
- Build the actual application, not just a marketing landing page or static mockup. Use realistic empty states and clear onboarding where data is absent. Do not invent users, orders, sellers, reviews, metrics, or traction.
- Do not publish/deploy, connect GitHub, or enable paid services without explicit approval.

CORE CUSTOMER EXPERIENCE
- Public storefront/landing experience explains the service simply and credibly for Oron.
- Customer can register/sign in, create a shopping request by entering item names, quantities, optional target prices and notes (list-first, not catalogue-first), provide delivery location/address details, review and submit the request, see its status and history, and manage account details.
- Support alternate delivery location and clear delivery instructions.
- Include restaurants, bakeries, factories and other participating businesses as service categories without pretending a catalogue exists when it does not.
- Order lifecycle must be explicit and understandable: submitted, reviewed/quoted, accepted/confirmed, sourcing/in progress, ready, out for delivery, delivered, cancelled/issue where appropriate. Only allow valid state transitions.

SELLER EXPERIENCE
- Dedicated seller portal. Sellers can manage their business profile, service area, operating hours/availability, and incoming requests assigned or offered to them; accept/decline with reasons, confirm item availability/substitutions and fulfilment status. Sellers must not see unrelated customer/admin data.

RUNNER EXPERIENCE
- Dedicated runner portal showing assigned market-purchase tasks, item lists, quantities, notes, progress and handoff status. Record unavailable items and substitutions for approval. Do not mix runner functions into courier screens.

COURIER EXPERIENCE
- Dedicated courier portal showing assigned deliveries, pickup/drop-off details, delivery instructions, status updates and proof-of-delivery workflow. Include an in-app arrival/contact concept in the architecture, but do not fake live calling or maps if not actually integrated.

OPERATIONS EXPERIENCE
- Dedicated operations workspace for coordinating orders, sellers, runners and couriers, assignment, exceptions, customer communication records and order progression. Provide useful operational queues rather than vanity analytics.

ADMINISTRATION AND SECURITY
- Private admin area at /admin with no public navigation link and no public admin self-signup.
- Super Admin creates administrators, assigns roles/permissions, suspends/reactivates accounts, and controls platform-wide settings.
- Admin roles must be permission-scoped. Admins cannot edit another administrator's personal profile or password. Preserve this privacy rule strictly.
- Include audit logging for sensitive administrative actions.
- Launch-control toggle and editable countdown/settings belong to authorized admin controls; public prelaunch state must be controllable from there.
- Enforce authorization server-side/database-side, not merely by hiding frontend links. Use secure authentication, validation, and row-level access controls.

PAYMENTS AND WALLET
- Plan for Paystack integration, but do not invent live payment processing or request/store card details. Use a clearly labelled test/disabled state until credentials and explicit approval are supplied.
- A stored-value wallet/funding feature must remain disabled pending review. Do not implement live stored-value balances or claim funds are held.
- Show transparent order cost/quote states and payment status only when actually supported.

TECHNICAL EXPECTATIONS
- Use Lovable's supported full-stack TypeScript stack. Use a proper relational data model and real persistence, not hardcoded arrays as the application source of truth.
- Use the platform's backend/database capabilities where appropriate; establish clear schema, constraints, role model, and row-level security before building sensitive workflows.
- Build reusable components without collapsing distinct role experiences into one universal dashboard.
- Include loading, empty, validation, success, and error states. Validate inputs and handle failures honestly.
- Keep accessibility, keyboard navigation, semantic controls, responsive behavior, and performance in scope.
- Add tests for critical business logic and role/permission boundaries where supported.
- Work in deliberate phases: first establish the visual system, information architecture, role boundaries, schema and core customer-to-order workflow; then implement role portals and operational workflows. Do not claim completion when only scaffolding exists.

FIRST DELIVERABLE
Start by producing the application shell and a coherent, distinctive customer-facing experience plus the foundational authenticated role architecture and data model. Make the initial screen feel like a real local commerce service for Oron, not a generic AI-generated template. Then continue implementing the core customer request-to-fulfilment workflow with real persistence and functional controls. Keep a clear list of what is genuinely implemented versus pending integrations.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://lightgrabmain.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6c882f1f-d5d8-417d-90d7-0eec20b79b6a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
