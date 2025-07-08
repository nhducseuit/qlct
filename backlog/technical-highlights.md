# Technical Highlights

- User and Person mapping is currently done via email matching. When a user logs in, their email is used to find the corresponding Person entity. This mapping is used for permissions and real-time event routing.

---


## Sprint 5–7: Person Breakdown Report, Access Control, and Robust State Management (2025-07-09)

### Person Breakdown Report & Access Control
- Implemented a robust Person Breakdown report, visible only for the user's own family, with strict backend access control (controller and service both source `familyId` from session, never from client input).
- Validated that the report is never shown for families the user does not have full access to, both in backend and frontend logic.
- Used a computed property (`isUserFamily`) in the frontend to control feature visibility, ensuring no accidental exposure.

### Vue SFC Hygiene & Error Resolution
- Refactored `ReportsPage.vue` to use a single `<template>` and `<script setup>`, eliminating duplicate/malformed blocks and resolving all "x-invalid-end-tag" parsing errors.
- Fixed all TypeScript, ESLint, and prop type errors in the new components and store logic.

### Contract Discipline & State Management
- Kept frontend models, Pinia stores, and API services in sync with backend DTOs for all new features.
- Used Pinia stores for all shared state, ensuring robust, type-safe state transitions.

### Documentation & Debugging
- Documented all root causes, solutions, and impacts for bugs and features in `Lesson_Learn.txt` and this file.
- Updated documentation after each sprint to capture key takeaways and technical highlights.

---

## Sprint 5: Multi-Family, Real-Time, and State Retention Lessons (2025-07-08)

### Real-Time Updates & WebSocket Event Routing
- Transactions page stopped receiving real-time updates because backend was emitting to personId rooms, but clients joined userId rooms. Fixed by mapping person.email to userId and emitting to userId rooms for transaction events.
- Categories and household members pages worked because their backend emits to userId rooms. Consistency in event emission logic is critical for real-time features.
- Added logging to backend transaction service to confirm correct userId emission for WebSocket events.

### DTO & Validation Changes
- Removed/disarmed UUID validation for `categoryId` and `payer` in `CreateTransactionDto` to support new ID formats (string, not just UUID).
- Ensured backend and frontend logic support new ID mapping and access rules (family tree access, not just direct family match).

### Access Control & Family Tree Logic
- Updated category and household member service access logic to allow access if the resource's familyId is in the user's family tree (self or ancestor), not just a direct match.
- Added technical note: Never trust client-supplied values for sensitive identifiers such as `familyId`, `userId`, etc. Always use the authenticated user's/session's value from the server context in all controller and service logic.

### Frontend State Retention & Pinia Store
- Add Transaction page now retains last selected family, payer, and date using Pinia store (`transactionStore`).
- Added `lastSelectedFamilyId`, `lastSelectedPayer`, `lastSelectedDate` to `transactionStore` and wired up watchers and initialization logic in `QuickEntryForm.vue`.
- Watchers only update last selected values if the value is not null/empty and has changed, to avoid unnecessary state churn.
- Exported `loadTransactions` and `loadTransactionsForCategoryPeriod` from `transactionStore` to resolve missing method errors in components.

### Debugging & Lessons Learned
- Diagnosed and explained why payer was showing as ID instead of name (frontend not refreshing household members or mismatch in IDs).
- Identified and explained missing method errors in transactionStore and provided solution to export them from the store.
- Documented all changes and lessons in this file and in the sprint backlog for future reference.

---

## Sprint 5 Addendum: UI/UX Consistency & Component Logic (2025-07-08)

### UI/UX Consistency & Centralized Store Logic
- **Harmonized Family Grouping:** Refactored `CategoriesPage` to use the same `q-list` with group headers as `HouseholdMembersPage`. This unified the UI and removed inconsistent nested list structures.
- **Centralized Business Logic:** Ensured sorting and display logic for family groups is handled consistently within the Pinia stores (`categoryStore`, `householdMemberStore`). Removed UI-specific text like "(Nhóm con)" from store getters to keep components clean and logic centralized.
- **Lesson:** UI patterns for similar data representations should be consistent across the application. Centralizing data transformation and business logic in stores makes components simpler, more predictable, and easier to maintain.

### Component-Level Context vs. Global State
- **Family-Aware Forms:** The `TransactionFormDialog` was updated to filter category and member dropdowns based on the `familyId` of the transaction being edited, not the globally selected family.
- **Lesson:** It's critical to distinguish between global state (the user's current view context) and component-level context (the data associated with a specific item). Components should receive context via props to ensure they are reusable and behave correctly regardless of the global state.

### Vue & TypeScript Best Practices
- **SFC & Composition API:** Fixed build errors by moving `computed` properties inside the `<script setup>` block in Vue Single File Components, aligning with modern Composition API standards.
- **Dialog Interaction:** Improved usability by removing the `persistent` prop from dialogs, allowing users to close them with the ESC key or by clicking the backdrop. This is a better default behavior unless a modal action is strictly required.
- **Type Safety:** Resolved multiple TypeScript errors by updating interfaces (e.g., adding `familyId` to `Transaction`) and ensuring all related component and store logic was type-safe. This prevents runtime errors and improves code reliability.

---

**Key Principle:**
- Always ensure backend and frontend event logic, access rules, and state retention are consistent and robust. Document all changes and lessons to prevent regressions and knowledge loss.
