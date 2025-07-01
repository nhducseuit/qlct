# Sprint 4: Shared Expense Balancing & Settlements

**Sprint Goal:** Implement a complete feature set for users to calculate outstanding balances between household members, record settlements, and view a history of these settlements. This will provide a clear and actionable way to resolve shared expenses.

---

## Key Features & User Stories

- **As a user,** I want to see a clear summary of who owes whom and how much, so I can easily understand the financial state of the household.
- **As a user,** I want to record a payment (settlement) from one member to another to clear their debts.
- **As a user,** I want to view a history of all past settlements so I can track who has paid what and when.

---

## Technical Backlog

### Backend

- [x] **Data Model:** Define `Settlement` model in Prisma schema with relationships to `User` and `HouseholdMember`.
- [x] **API:** Implement `GET /settlements/balances` to calculate and return net balances between members.
- [x] **API:** Implement `POST /settlements` to record a new settlement transaction.
- [x] **API:** Implement `GET /settlements` to retrieve a paginated history of settlements.
- [x] **DTOs:** Create all necessary Data Transfer Objects for settlement operations.

### Frontend

- [x] **State Management:** Create `settlementStore.ts` to manage API calls and state for balances and history.
- [x] **UI Component:** Develop `BalancesView.vue` to display the calculated balances.
- [x] **UI Component:** Implement `RecordSettlementDialog.vue` to capture and submit new settlements.
- [x] **UI Component:** Create `SettlementHistory.vue` to display a paginated list of past settlements.
- [x] **Integration:** Fully integrate `SettlementHistory.vue` into the `SettlementsPage.vue`.
- [x] **UX/UI:** Refine the settlement flow, including user feedback and edge case handling.

### Other Tasks Completed During Sprint

- **`fix(reports)`:** Aligned the transaction detail table's filtering on the Reports page with the global `isStrictMode`, `memberIds`, and `transactionType` filters. This involved updating the `GET /transactions` API and fixing a request serialization issue in the frontend.