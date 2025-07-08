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
- Minimal, isolated implementation. No unrelated code or architectural changes.
- Follow security/data integrity best practices (never trust client-supplied IDs, always use authenticated session context).
- If any out-of-scope changes are made, revert them.

### Tasks
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

### 1. Update and Test Settlement Page for Family Model
- [ ] Refactor the Settlement page and backend logic to work with the new family/membership structure.
- [ ] Ensure all settlement calculations, balances, and UI reflect the correct family context.
- [ ] Test all settlement flows for both legacy and new data.

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