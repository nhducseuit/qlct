# Settlement Direction Rule (Permanent Reminder)

**Settlement Direction Rule (ALWAYS REMEMBER):**
- If A owes B, then A must pay B to settle the debt.
- If B pays A instead, the debt increases in the wrong direction.
- The payer/payee direction in settlements must always match the direction of the debt being settled.

**Test/Implementation Reminder (ALWAYS CHECK):**
- When applying a settlement, ensure the payer is the one who owes, and the payee is the one who is owed.
- If the settlement direction is reversed, the balance will be incorrect.

This rule must be checked and referenced in every settlement-related implementation and test.
# Sprint 5: Top Priority Incomplete Work

## [x] Implement Person Breakdown Report
- Purpose: Provide a report of expenses (vs. budget, crossing categories) for persons the user has full or partial access to, within the context of their own family.
- Full access: Persons in the same family as the user, who do not belong to any other family the user cannot access.
- Partial access: Persons who are in another family the user cannot access (e.g., brothers, sisters-in-law).
- Only show the person breakdown report for the user's own family.
- Do not show for families the user does not have full access to.
- No need to show for persons the user does not have full access to.
- The member breakdown report is insufficient because a person may have multiple memberships, making it hard to get a true person-level view.
  - The person breakdown report provides an "eagle view" for the user to see their own and their immediate family's expenses, crossing categories.
  - Expenses for categories with the same name (e.g. "food") across all families the person belongs to are now correctly aggregated and shown as a single total per category name. Only expenses are required for now.
  - [x] Đã bổ sung logic tổng hợp chi phí cho các category cùng tên trên tất cả các family mà user là thành viên, áp dụng cho cả person breakdown và person category budget compare. Báo cáo giờ đã hiển thị đúng tổng chi phí cho category cùng tên, bất kể transaction thuộc family nào.
- Minimal, isolated implementation. No unrelated code or architectural changes.
- Follow security/data integrity best practices (never trust client-supplied IDs, always use authenticated session context).
- If any out-of-scope changes are made, revert them.

### Tasks
---

## Settlements & Balances: Person-Centric Refactor (July 2025)

### ✅ Completed
- Refactored backend and API to be person-centric, returning paginated settlements and pairwise balances for all relevant persons in the family tree.
- Pinia store (`settlementStore.ts`) robustly extracts and maps paginated settlements and balances, with type safety and meta handling.
- `SettlementHistory.vue` and `BalancesView.vue` updated to display settlements and balances using person names, robust to API data shape changes, and user-friendly.
- Balances view now clearly shows who owes whom, and for how much, in a readable format.
- All major runtime and type errors in the store and components have been fixed.
- All calculations and settlement applications are now correct and match business logic.
- **[July 2025]** Fixed settlement balance sign convention: positive means personOne owes personTwo, negative means personTwo owes personOne. Updated backend logic and unit tests to match. All backend tests now pass and reflect the correct business logic for cross-family, person-to-person balances.

### ⚠️ Known Issues / Deferred
- WebSocket real-time updates for settlements and balances are not yet implemented. UI will not auto-update when a new settlement is created by another user. (Manual refresh required.)

---
- [x] Backend: Add DTOs for person breakdown query/response.
- [x] Backend: Add service logic to compute person breakdown, respecting access rules.
- [x] Backend: Add controller endpoint, sourcing family/person context from authenticated user/session only.
- [x] Frontend: Add types for person breakdown in summary.ts.
- [x] Frontend: Add API call in summaryApiService.ts.
- [x] Frontend: Add store logic in summaryStore.ts.
- [x] Frontend: Add PersonBreakdownReport.vue component.
- [x] Frontend: Integrate into ReportsPage.vue, only enable for user's own family.
- [x] Security: Ensure all backend logic sources sensitive IDs from session, not client input.
- [x] Security: Review controller/service for compliance with security checklist.
- [x] Documentation: Add analysis and requirements to the top of backlog/sprint-5.md.

---

# Sprint 5: Foundational Refactor & Family-Awareness

**Sprint Goal:** Overhaul the core data model to be person-centric and make the entire application family-aware. This foundational work is critical for enabling multi-user, multi-family functionality and ensuring data integrity.

---

## ✅ Completed Features & Fixes

### 1. Core Data Model: Person & Membership Refactor
- **[x] Schema Normalization:** Designed and implemented a new, normalized schema with `Person`, `Family`, and `HouseholdMembership` tables to serve as the single source of truth for user and family data.
- **[x] Data Migration:** Successfully migrated all existing `householdMember` data to the new structure using an automated SQL backfill script, ensuring no data loss.
- **[x] Foreign Key Updates:** Updated all foreign keys and references across the database (transactions, split ratios, etc.) to use the new `HouseholdMembership` join table.
- **[x] Backend Refactor:** Refactored all backend models, services, and APIs (CRUD for Person & Membership) to align with the new person-centric architecture.
- **[x] API Security:** Secured all new and updated endpoints with JWT authentication.
- **[x] Frontend Integration:** Updated the Household Members page to display members grouped by family, reflecting the new hierarchical data model.

### 2. Multi-Family Scoping & Real-Time State
- **[x] Family-Aware Data Access:** Enhanced backend access control to allow users to view/manage data from their own family and any parent families in their hierarchy.
- **[x] Family-Aware Stores:** Created a new `familyStore.ts` and refactored all other Pinia stores (`categoryStore`, `transactionStore`, etc.) to be fully aware of the selected family context.
- **[x] Family-Aware API Calls:** Modified all frontend API service calls to work with the new family-scoped endpoints.
- **[x] Family Switching UI:** Implemented a UI element to allow users to switch between different family views (e.g., "Small Family" vs. "Big Family").
- **[x] Real-Time Sync Fixes:** Diagnosed and fixed critical WebSocket bugs, ensuring real-time events are correctly routed to user-specific rooms for consistent data synchronization.
- **[x] State Retention:** Improved the "Add Transaction" page to retain the last selected family, payer, and date, improving user workflow.

### 3. Quick Entry Form: Family-Aware Refactor
- **[x] Family-Aware Dropdowns:** The "Quick Select" and main category dropdowns now correctly filter to show only categories from the selected family.
- **[x] Family-Aware Member Lists:** The list of members for cost-splitting (`splitRatio`) is now correctly filtered based on the selected family.
- **[x] Payer Display Fix:** Corrected a critical bug to ensure the payer's name is always displayed instead of their UUID.
- **[x] Context Reset Logic:** Implemented logic to automatically reset dependent fields (Payer, Category, Split Ratios) when the selected family is changed, preventing data inconsistencies.

### 4. UI/UX Consistency & Bug Fixes
- **[x] Unified Family Grouping:** Harmonized the UI for family-based grouping on the `CategoriesPage` and `HouseholdMembersPage`, ensuring a consistent look and feel.
- **[x] Clean Group Headers:** Removed redundant annotations (e.g., "(Nhóm con)") from all family group headers for a cleaner, more professional appearance.
- **[x] Consistent Sorting:** Implemented and verified consistent sorting logic for family groups across all relevant Pinia stores.
- **[x] Family-Aware Forms:** Refactored the `TransactionFormDialog` to ensure category and member selection dropdowns are correctly filtered by the transaction's `familyId`.
- **[x] Dialog Usability:** Fixed an interaction bug by removing the `persistent` property from dialogs, allowing them to be closed via the ESC key or by clicking the backdrop.
- **[x] Build & Runtime Fixes:** Resolved Vue SFC compiler errors by correctly scoping computed properties and fixed all related TypeScript type errors.

### 5. Documentation & Testing
- **[x] Migration Testing:** Wrote and executed migration and integration tests for the new schema to ensure data integrity.
- **[x] Knowledge Capture:** Documented all major changes, root causes for bugs, and key architectural decisions in `Lesson_Learn.txt` and sprint backlogs to prevent regressions and build a knowledge base.

### 6. Reports Page: Family-Aware Refactor & Stabilization
- **[x] Family-Aware Reports:** Refactored the `ReportsPage` and all related backend endpoints to fully support the new family model (Big/Small Family, memberships).
- **[x] Correct Aggregations:** Ensured all report queries, filters, and aggregations are correct for the selected family context.
- **[x] Comprehensive Testing:** Tested all report features for both legacy and new data to confirm stability and correctness.

---

## 🔥 Most Important Unfinished Work (Work on These Next)


### [Progress Log]
- **[x] Backend: Settlement logic and unit tests refactored and fixed (July 2025).**
  - Refactored backend to aggregate balances globally between two persons, across all families the user can access, enforcing access control.
  - Pairwise calculation logic is now symmetric and applies settlements correctly.
  - Sign convention clarified and enforced: positive means personOne is owed by personTwo, negative means personOne owes personTwo. All backend tests updated and passing.
  - Ready to proceed to frontend settlement creation, validation, and error handling tasks as outlined below.




### 1. Person-Centric Settlement Page Refactor (Clarified July 2025)


#### New Feature: Person-to-Person Balances with Year/Month and Explicit Add (Planned)

##### ✅ Completed
- **Backend: API Adjustments**
  - Update balances API to accept `personOneId`, `personTwoId`, `year`, and `month` as query params. If not set, default to current date and require both persons. (Done July 2025)
  - Return only the balance between the two specified persons for the given period. (Done July 2025)
  - Ensure the calculation logic and returned sign matches the UI explanation (positive: person 1 lends person 2, negative: person 1 owes person 2). (Done July 2025)
  - Add clear API documentation and error messages if either person is not set or not accessible. (Done July 2025)
- **Validation & Guidance**
  - Add backend validation: both persons must be selected, and they must be different. (Done July 2025)
  - If no balance exists for the selected period/persons, show a friendly message: "Không có số dư giữa hai người trong thời gian này." (Backend done July 2025)
- **Testing & Documentation**
  - Update or add backend tests for the new API and calculation logic. (Done July 2025)
  - Update user documentation and in-app help to reflect the new balances workflow. (Backend/API docs done July 2025)
- **Balances View:**
  - User must select a person (from accessible persons) before balances are shown.
  - On selection, fetch `/settlements/balances?personId={id}` and display net balances with all other accessible persons.
  - If no person is selected, prompt the user to select one.
- **Settlement History:**
  - Show all settlements the user can access (not just between two persons).
  - Columns: Payer, Payee, Amount, Date, Note.
  - Optionally allow filtering/searching by payer/payee (using accessible persons).
- **Access Control:**
  - Only show persons/settlements the user can access.

##### 🔥 Next Up
- [x] **UI/UX: Settlement Balances Redesign**
  - Replace the single month filter with two dropdowns: **Year** and **Month** (same style as Reports page). If unset, default to current year/month.
  - Replace the single person filter with two dropdowns: **Person 1** and **Person 2**. User must select both to view a balance.
  - Add an **"Add"** button. Only when clicked, the balance between the two selected persons (for the selected year/month) is added to the balances list below.
  - In the balances list, show: "Person 1 nợ Person 2 Số tiền" if positive, or "Person 2 nợ Person 1 Số tiền" if negative (the field is netAmountPersonOneOwesPersonTwo). Show both persons' names clearly.
  - Add a clear explanation above the filters: "Chọn hai người và thời gian để xem số dư giữa họ. Số dương: Người 1 nợ Người 2. Số âm: Người 2 nợ Người 1."
  - Make the UI consistent with the Reports page for date selection and dropdowns.

- [ ] **Settlement Creation:**
  - User can create a new settlement.
  - User must select payer and payee (from accessible persons), enter amount and note.
  - Validate both payer and payee are accessible.
  - On submit, call `POST /settlements` with `{ payerId, payeeId, amount, note }`.
  - Refresh balances and settlement history after creation.

- [ ] **Transparency & Education**
  - Add a help/info tooltip or section explaining how balances are calculated, with a link to documentation or FAQ if available.

- [ ] Validation & Error Handling: Add/Update validation and error handling for all settlement actions.
- [ ] Tests: Add/Update frontend tests for all settlement flows and edge cases.

#### Calculation Approach (Approved)
For a given person, calculate their net balance with every other accessible person, aggregating across all memberships and families:
1. Gather all transactions involving the selected person (as payer, payee, or participant in split ratio), across all families the user can access.
2. For each transaction, determine the share of each person (using split ratios). For each pair (A, B), calculate: Amount A paid on behalf of B (A is payer, B is in split ratio), Amount B paid on behalf of A (B is payer, A is in split ratio).
3. Fetch all settlements between the selected person and each other person. Subtract the settled amounts from the running balance.
4. For each other person, net balance = (A paid for B) - (B paid for A) - (settlements). Positive: A is owed by B. Negative: A owes B.
5. Only show pairs where the net balance is non-zero.

### 2. Transaction Update Issue (To Resolve After Settlement Page Refactor)
- [ ] Investigate and resolve the current issue where users cannot update a transaction. Ensure this is addressed after the settlement page and logic are updated.

### 3. Production Readiness & Deployment

### 2. Production Readiness & Deployment
- [ ] Finalize and test all UI/UX consistency fixes to ensure they are stable and regression-free before deployment.
- [ ] Perform production deployment of all updates (family model, real-time, state retention, UI/UX fixes).
- [ ] Migrate and verify legacy data in the production environment to ensure compatibility with the new schema and features.
- [ ] Test all critical user flows in production with real/legacy data to confirm stability and correctness.

---

## 🟡 Lower Priority / Remaining Work

### Backend
- [ ] Implement logic to prevent duplicate persons (e.g., by email/phone).
- [ ] Update `JwtAuthGuard` or create a new `FamilyGuard` to inject family information or perform checks.
- [ ] Create CRUD endpoints for managing families (`/families`).
- [ ] Add tests for family-aware category permissions.

### Frontend
- [ ] Implement person search/autocomplete when adding a member to a family.
- [ ] Show all families a person belongs to in their profile.
- [ ] Ensure person-level reports aggregate across all memberships.
- [ ] Create a new page for Family Management (`FamilyManagementPage.vue`).
- [ ] Add/expand frontend tests for family-aware category management.

### Security & Permissions
- [ ] Update permissions to use `personId` for access control.
- [ ] Ensure users can only view/manage their own data or data they have rights to.

### Automation & Self-Service
- [ ] Implement logic for users to request to join families or for admins to invite persons by email.
- [ ] Automate linking of persons during data import or seeding.

---

**Key Principle:**
- Every time a bug is fixed or a feature is changed, document the root cause, the solution, and the impact on other features. Test all related features to prevent regressions. Never assume a change is isolated—always verify and document.