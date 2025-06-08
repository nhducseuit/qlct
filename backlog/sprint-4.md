# Sprint 4: Shared Expense Balancing & Settlements

**Sprint Goal:** Enable users to track and settle shared expenses among household members by calculating individual contributions versus actual portions, identifying debts/credits, and allowing members to record settlement payments.

**Sprint Duration:** (Define your typical sprint duration, e.g., 2 weeks)

**Sprint Owner:** (Your Name/Team Lead)

---

## Sprint Backlog:

### Backend (S4.1.x - Settlement Logic & APIs)
- **S4.1.1:** Design `Settlement` (or `DebtPayment`) entity/table.
    -   Fields: `id`, `payerMemberId`, `payeeMemberId`, `amount`, `date`, `note`, `userId`, `createdAt`, `updatedAt`.
- **S4.1.2:** Implement backend logic to calculate each household member's "actual portion" of shared expenses for a given period based on transaction `splitRatio`.
- **S4.1.3:** Implement backend logic to calculate each member's total "paid amount" towards shared expenses for a given period.
- **S4.1.4:** Implement backend logic to determine the net balance (credit/debt) for each member regarding shared expenses.
- **S4.1.5:** Create API endpoint to fetch these member balances (paid vs. portion vs. net balance) for a specified period.
- **S4.1.6:** Implement CRUD API endpoints for `Settlement` records.
- **S4.1.7:** Ensure that when a `Settlement` is recorded, it's factored into future balance calculations (or clearly marked as settling past balances).
- **S4.1.8:** Implement WebSocket events (`settlements_updated`) for real-time updates on settlement records.

### Frontend (S4.2.x - UI for Balancing & Settlements)
- **S4.2.1:** Create a new "Balancing / Settlements" page (e.g., `SettlementsPage.vue`).
- **S4.2.2:** UI Component: Display each household member's summary for shared expenses:
    -   Total amount paid by the member for shared transactions.
    -   Total actual portion owed by the member from shared transactions.
    -   Net balance (credit if paid > owed, debt if paid < owed).
    -   Allow filtering by date period.
- **S4.2.3:** UI Component/Dialog: Allow users to record a new settlement payment from one member to another.
    -   Input fields: Payer, Payee, Amount, Date, Note.
- **S4.2.4:** UI Component: List past settlement payments, with options to view details or (potentially) edit/delete.
- **S4.2.5:** Create `settlementStore.ts` in Pinia to manage settlement data and interactions with the backend API.
    -   Include actions for fetching balances, fetching settlements, adding, updating, and deleting settlements.
    -   Implement WebSocket event handling for `settlements_updated`.
- **S4.2.6:** Integrate settlement APIs and store with the new UI components.

### Testing & Refinement (S4.3.x)
- **S4.3.1:** Thoroughly test the accuracy of paid vs. portion vs. net balance calculations.
- **S4.3.2:** Test the process of recording settlements and verify its impact on displayed balances (if applicable immediately, or on subsequent calculations).
- **S4.3.3:** Test real-time updates for settlement records across multiple clients.
- **S4.3.4:** Ensure usability of the settlement recording and viewing process.

---
**Definition of Done for Sprint 4:**
- All listed tasks completed and tested.
- Users can view a clear breakdown of who owes whom based on shared expenses.
- Users can record payments made between members to settle these debts.
- Settlement records are stored and displayed correctly with real-time updates.