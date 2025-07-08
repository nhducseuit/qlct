# Sprint 5 Backlog (Prioritized, as of 2025-07-08)

## ✅ Completed (Most Important, Placed First)

### 1. Person & Membership Refactor
- [x] Design and add a `Person` table (unique `personId`, name, email, etc.).
- [x] Create a join table (`HouseholdMembership`) linking `personId` and `familyId`, with membership-specific fields.
- [x] Migrate existing `householdMember` data to use the new structure (via automated SQL backfill migration).
- [x] Update all foreign keys and references in transactions, split ratios, etc., to use the join table.
- [x] Refactor backend models and services to use `Person` and `HouseholdMembership`.
- [x] Update APIs for creating, updating, and querying persons and memberships.
- [x] Add migration scripts for existing data.
- [x] Write migration and integration tests for the new schema.
- [x] Update documentation for the new person/membership model and workflows.
- [x] Normalize schema: Family, Person, HouseholdMembership.
- [x] Migrate and seed baseline data.
- [x] Implement Person API (CRUD, deduplication by name, auth).
- [x] Implement Membership API (link person to family, prevent duplicates).
- [x] Secure APIs with JWT.
- [x] Test all flows.
- [x] Update frontend: Household Member page (grouped by family, read-only for normal users, show person details).

### 2. Multi-Family, Real-Time, and State Retention Fixes
- [x] Diagnosed and fixed real-time update issues for transactions (WebSocket events now consistently routed to userId rooms; added backend logging for event emission).
- [x] Removed UUID validation for categoryId and payer in CreateTransactionDto to support new ID formats.
- [x] Updated backend and frontend logic for new ID mapping and family tree access rules.
- [x] Enhanced access control: category and household member services now allow access if resource's familyId is in user's family tree (self or ancestor).
- [x] Add Transaction page now retains last selected family, payer, and date using Pinia store; improved watcher logic for state retention.
- [x] Exported missing Pinia store methods to resolve frontend errors.
- [x] Diagnosed and fixed payer name display and state retention bugs.
- [x] Documented all changes, root causes, and lessons in technical-highlights.md and sprint-5.md to prevent regressions and knowledge loss.

---

## 🔥 Most Important Unfinished Work (Work on These Next)

### 1. Update and Test Report Page for Family Model
- [ ] Refactor the ReportsPage and all related backend endpoints to fully support the new family model (Big/Small Family, memberships).
- [ ] Ensure all report queries, filters, and aggregations are correct for the selected family context.
- [ ] Test all report features for both legacy and new data.

### 2. Update and Test Settlement Page for Family Model
- [ ] Refactor the Settlement page and backend logic to work with the new family/membership structure.
- [ ] Ensure all settlement calculations, balances, and UI reflect the correct family context.
- [ ] Test all settlement flows for both legacy and new data.

### 3. Production Deployment and Legacy Data Migration
- [ ] Perform production deployment of all updates (family model, real-time, state retention, etc.).
- [ ] Migrate and verify legacy data to ensure compatibility with the new schema and features.
- [ ] Test all critical user flows in production with real/legacy data to confirm stability and correctness.

---

## 🟡 Lower Priority / Remaining Work

### Backend
- [ ] Implement logic to prevent duplicate persons (e.g., by email/phone).
- [ ] Refactor all services (`category.service`, `transaction.service`, etc.) to enforce data access rules based on the user's `familyId`.
- [ ] A user should only be able to read/write data belonging to their own `Family` or a parent `Family` they are part of.
- [ ] Update `JwtAuthGuard` or create a new `FamilyGuard` to inject family information or perform checks.
- [ ] Create CRUD endpoints for managing families (`/families`).
- [ ] Update all existing `GET` endpoints to filter by the user's `familyId`.
- [ ] Update all `POST`/`PATCH`/`DELETE` endpoints to validate ownership via `familyId`.
- [ ] Update backend: Ensure all category endpoints require and check `familyId` for all CRUD operations.
- [ ] Add/Update: Only allow creation/edit for categories in the current family context.
- [ ] Delete: Only allow deletion for categories in the current family context.
- [ ] List: Only return categories for the current family (and/or subfamilies, if required).
- [ ] Enforce access control so only family members can manage their family's categories.
- [ ] Add tests for family-aware category permissions.
- [ ] Update backend: Add tests for family-aware category permissions.
- [ ] Update documentation: Document new family-aware category logic and usage.

### Frontend
- [ ] Update UI to be person-centric when adding household members.
- [ ] Implement person search/autocomplete when adding a member to a family.
- [ ] Show all families a person belongs to in their profile.
- [ ] Allow admins to add new persons or link existing ones when creating memberships.
- [ ] Ensure person-level reports aggregate across all memberships.
- [ ] Create a `familyStore.ts` to manage family data.
- [ ] Update all other stores (`categoryStore`, `transactionStore`, etc.) to be aware of the current family context.
- [ ] Modify API service calls to work with the new family-scoped endpoints.
- [ ] Create a new page for Family Management (`FamilyManagementPage.vue`).
- [ ] Add a UI element (e.g., a dropdown in the layout) to allow users to switch between their "Small Family" view and the "Big Family" view.
- [ ] Update all existing pages (`ReportsPage`, `TransactionsPage`, etc.) to reflect the currently selected family scope.
- [ ] Update CategoriesPage.vue: Hide or disable actions for categories outside the user's family.
- [ ] Add/expand frontend tests for family-aware category management.

### Quick Entry Form: Family-Aware Refactor
- [ ] Update Family Dropdown: Only list families the current user is a member of.
- [ ] Fix Payer Field: Ensure the payer's name is displayed instead of their UUID.
- [ ] Update Category Lists: Filter "Quick Select" and the main category dropdown to show only categories from the selected family.
- [ ] Update Split Ratio Members: Filter the list of members for cost splitting based on the selected family.
- [ ] Implement Reset Logic: When the selected family changes, reset all dependent fields (Payer, Category, Split Ratios).
- [ ] Ensure Correct Initialization: On component mount, correctly initialize all family-dependent data based on the default selected family.

### Security & Permissions
- [ ] Update permissions to use `personId` for access control.
- [ ] Ensure users can only view/manage their own data or data they have rights to.

### Automation & Self-Service
- [ ] Implement logic for users to request to join families or for admins to invite persons by email.
- [ ] Automate linking of persons during data import or seeding.

---

**Key Principle:**
- Every time a bug is fixed or a feature is changed, document the root cause, the solution, and the impact on other features. Test all related features to prevent regressions. Never assume a change is isolated—always verify and document.