## Sprint 2 Feedbacks Backlog

This document captures feedback and tasks identified during or immediately after Sprint 2, to be addressed before or early in Sprint 3.

### 1. Transaction Type (Income/Expense)

- **Feedback:** Make it possible to add an income, separate with an expense.
- **Status:** Completed in `QuickEntryForm.vue` by adding a type selection control.
- **Tasks:**
    - [x] Implement UI control (e.g., radio group, toggle) in `QuickEntryForm.vue` to select transaction type ('income' or 'expense').
    - [x] Ensure the selected type is included in the payload sent to the backend via `addTransactionAPI`.

### 2. Optional Category Default Share Ratio

- **Feedback:** Make share ratio configuration of category optional.
- **Status:** Verified that the backend model (`defaultSplitRatio?: SplitRatioItem[] | null;`) and frontend data handling in `CategoryFormDialog.vue` already treat `defaultSplitRatio` as optional (nullable). If no percentages are entered or they are all zero, `null` is sent to the backend.
- **Tasks:**
    - [x] Verify backend `Category` model allows `defaultSplitRatio` to be null.
    - [x] Verify frontend `CategoryFormDialog.vue` correctly sends `null` for `defaultSplitRatio` if no percentages are configured.
    - [ ] **(Moved to Sprint 5)** (Optional/Future) Add a UI toggle in `CategoryFormDialog.vue` for clarity.

### 3. Predefined Share Ratios

- **Feedback:** Provide functionality to configure some set of predefined share ratio, which could be reused easily by add/update transaction form, as well as add/update category form (less prioritized). Allow naming the predefined ratio.
- **Status:** Backend CRUD and WebSocket integration complete. Frontend API service and store complete. Integration into Transaction Quick Entry Form complete.
- **Tasks:**
    - [x] Define `PredefinedSplitRatio` model in Prisma schema.
    - [x] Create backend module, service, controller, DTOs for `PredefinedSplitRatio`.
    - [x] Implement CRUD APIs and WebSocket notifications for `PredefinedSplitRatio`.
    - [x] Create frontend API service for `PredefinedSplitRatio`.
    - [x] Create frontend Pinia store for `PredefinedSplitRatio` with API integration and WebSocket handling.
    - [x] **(Higher Priority)** Integrate predefined ratio selection into `QuickEntryForm.vue`.
    - [ ] **(Moved to Sprint 5)** Create UI page/dialogs for managing predefined split ratios.
    - [ ] **(Moved to Sprint 5)** Integrate predefined ratio selection into `CategoryFormDialog.vue`.

### 4. Household Member Ordering

- **Feedback:** Enable configuration of household member ordering.
- **Status:** Backend model supports `order`, frontend store sorts by `order`, and basic reordering logic with UI controls has been added.
- **Tasks:**
    - [x] Verify backend `HouseholdMember` model includes an `order` field.
    - [x] Implement frontend store action (`reorderMember`) to handle the logic of swapping orders between members.
    - [x] Add UI controls (e.g., Up/Down buttons) in `HouseholdMembersPage.vue` to trigger the `reorderMember` action.
    - [x] Ensure the `householdMemberStore` sorts members by the `order` field (and name as a secondary sort).
    - [ ] **(Moved to Sprint 5)** (Verification) Confirm WebSocket updates for member order changes.
    - [ ] **(Moved to Sprint 5)** (Optional/Future) Consider drag-and-drop reordering.
    - [ ] **(Moved to Sprint 5)** (Optional/Future) Auto-assign initial order for new members.

---

*Note: Tasks marked with [x] are considered completed based on recent discussions and code changes.*