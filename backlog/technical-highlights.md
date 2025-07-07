# Technical Highlights

- User and Person mapping is currently done via email matching. When a user logs in, their email is used to find the corresponding Person entity. This mapping is used for permissions and real-time event routing.

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

**Key Principle:**
- Always ensure backend and frontend event logic, access rules, and state retention are consistent and robust. Document all changes and lessons to prevent regressions and knowledge loss.
