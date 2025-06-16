# Sprint 4: Shared Expense Balancing & Settlements

**Sprint Goal:** To empower users to easily track, calculate, and manage financial balances and settlements arising from shared expenses within the household. This means providing clarity on who owes whom and facilitating the process of settling these debts.

---

## Key Objectives & Features:

### 1. Backend API Development:
    - [x] **Calculate Balances API:**
        *   Endpoint: `GET /settlements/balances` (or similar)
        *   Objective: Calculate the net financial balance for each household member against every other member, considering all shared transactions and their `splitRatio`.
        *   Considerations: Filter by date range? "All-time" balances?
        *   DTOs: `GetBalancesQueryDto` (if filters are needed), `MemberBalanceDto`, `BalancesResponseDto`.
    - [x] **Record Settlement API:**
        *   Endpoint: `POST /settlements` (or similar)
        *   Objective: Allow users to record a settlement action (e.g., Member A paid Member B $X).
        *   This will likely involve creating a new `Settlement` entity/table.
        *   DTOs: `CreateSettlementDto`, `SettlementDto`.
    - [ ] **Settlement History API:** (Next)
        *   Endpoint: `GET /settlements/history` (or similar)
        *   Objective: Retrieve a list of past settlement transactions.
        *   DTOs: `GetSettlementHistoryQueryDto`, `SettlementHistoryResponseDto`.
    - [x] **Data Model (Prisma):**
        *   [x] Define a new `Settlement` model (columns: `id`, `payerId`, `payeeId`, `amount`, `date`, `note`, `userId`).
        *   [ ] Ensure `Transaction` and `HouseholdMember` models adequately support balancing logic.

### 2. Frontend UI/UX (New "Settlements" or "Balances" Page):
    - [ ] **Display Balances View:**
        *   Clearly show who owes whom and the respective amounts (e.g., "You owe Member X: $Y", "Member Z owes you: $W").
        *   Consider how to present a summary of all interpersonal debts.
    - [ ] **Record Settlement UI:**
        *   A form/dialog to input settlement details (payer, payee, amount, date, note).
        *   This UI will interact with the `POST /settlements` API.
    - [ ] **Settlement History View:**
        *   Display a chronological list of recorded settlements.
    - [ ] **Store Logic (Pinia - `settlementStore.ts`):**
        *   Create a new store to manage settlement-related state and API calls.

### 3. Core Logic:
    - [ ] **Balance Calculation Algorithm:**
        *   Implement the core logic (likely in a backend service) to accurately calculate balances from shared transactions.
    - [ ] **Debt Simplification/Minimization (Stretch Goal):**
        *   Investigate and potentially implement logic to simplify complex debt networks into the minimum number of transactions required to settle all debts (e.g., if A owes B, and B owes C, can A pay C directly under certain conditions?).

---

## Potential Challenges:

*   **Complex Balancing Logic:** Ensuring the accuracy of the balance calculation algorithm, especially with various split ratios and numerous transactions.
*   **Debt Simplification:** If pursued, the algorithm for minimizing settlement transactions can be non-trivial.
*   **User Experience:** Presenting financial balances and the settlement process in an intuitive, trustworthy, and easy-to-understand manner.
*   **Concurrency:** Handling potential race conditions if multiple users attempt to record settlements simultaneously (though less likely for a household app, still good to consider).
*   **Performance:** Efficiently calculating balances, especially if the transaction history is extensive.
*   **Edge Cases:** Handling scenarios like inactive members with outstanding balances, or changes in household composition.

---

**Next Steps:** Start by defining the `Settlement` data model and the basic API endpoints for calculating balances and recording settlements.