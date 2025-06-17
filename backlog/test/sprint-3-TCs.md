# Sprint 3 - Reporting Strict Mode Test Cases

**Assumptions for Test Data:**
*   At least 3 household members: Member A, Member B, Member C.
*   Categories: Cat-Food, Cat-Utils, Cat-Personal.
*   All test transactions are within the selected report period (e.g., current month/year).
*   "Amount" refers to the total transaction amount before any splitting.
*   T1: Expense 100, Cat-Food, Payer A, **Not Shared**.
*   T2: Expense 200, Cat-Food, Payer A, Shared (A:50%, B:50%).
*   T3: Expense 300, Cat-Utils, Payer B, Shared (A:30%, B:30%, C:40%).
*   T4: Income 500, Cat-Food, Payer A (received by A), Not Shared.
*   T7: Expense 80, Cat-Food, Payer B, Shared (A:0%, B:100%).
*   T8: Expense 120, Cat-Utils, Payer C, Shared (B:60%, C:40%).

---

## Test Cases for Reports Page

### I. Default Page Load (Strict Mode OFF by default)

1.  **Test Case 1.1: Initial Page Load - No Filters Applied (Strict Mode OFF)**
    *   **Action:** Navigate to the Reports page.
    *   **Expected Result:** Should display data for the default period (e.g., current month/year), aggregating all expenses and incomes (if "Exclude Income" is OFF). Shared expenses should be distributed in Member Breakdown and full amount in Category/Trend. Matches behavior before strict mode.
    *   **Feedback:** Meet my expectation

### II. Strict Mode OFF (Checkbox Unchecked)

*   **Category Breakdown Report:**
    1.  **Test Case 2.1.1: No Members Selected**
        *   **Action:** Ensure "Strict Mode" is OFF. Do not select any specific members in the filter.
        *   **Test Data:** T1, T2, T3
        *   **Expected Result:** Cat-Food total expense: 300 (T1 + T2). Cat-Utils total expense: 300 (T3).
        *   **Feedback:** Meet my expecation
    2.  **Test Case 2.1.2: Single Member Selected (e.g., Member A)**
        *   **Action:** Ensure "Strict Mode" is OFF. Select only Member A.
        *   **Test Data:** T1, T2, T3
        *   **Expected Result:** Cat-Food: 200 (T1 + A's share of T2). Cat-Utils: 90 (A's share of T3).
        *   **Feedback:** Meet my expecation
    3.  **Test Case 2.1.3: Multiple Members Selected (e.g., Member A & Member B)**
        *   **Action:** Ensure "Strict Mode" is OFF. Select Member A and Member B.
        *   **Test Data:** T1, T2, T3
        *   **Expected Result:** Cat-Food: 300 (T1 + A's share of T2 + B's share of T2). Cat-Utils: 180 (A's share of T3 + B's share of T3).
        *   **Feedback:** Meet my expecation

*   **Member Breakdown Report:**
    1.  **Test Case 2.2.1: No Members Selected**
        *   **Action:** Ensure "Strict Mode" is OFF. Do not select any specific members.
        *   **Test Data:** T1, T2, T3, T4
        *   **Expected Result:** Member A: Exp=290 (100+100+90), Inc=500. Member B: Exp=190 (100+90). Member C: Exp=120.
        *   **Feedback:** Meet my expecation
    2.  **Test Case 2.2.2: Single Member Selected (e.g., Member A)**
        *   **Action:** Ensure "Strict Mode" is OFF. Select only Member A.
        *   **Test Data:** T1, T2, T3, T4
        *   **Expected Result:** Only Member A shown. Exp=290, Inc=500.
        *   **Feedback:** Meet my expecation
    3.  **Test Case 2.2.3: Multiple Members Selected (e.g., Member A & Member C)**
        *   **Action:** Ensure "Strict Mode" is OFF. Select Member A and Member C.
        *   **Test Data:** T1, T2, T3, T4
        *   **Expected Result:** Show Member A and Member C. Member A: Exp=290, Inc=500. Member C: Exp=120.
        *   **Feedback:** Meet my expecation

*   **Budget Trend Report:** (Assuming "Exclude Income" is ON)
    1.  **Test Case 2.3.1: No Members Selected**
        *   **Action:** Ensure "Strict Mode" is OFF. No members selected.
        *   **Test Data:** T1, T2, T3
        *   **Expected Result:** Total actual expenses for the period = 600 (T1 + T2 + T3).
        *   **Feedback:** Meet my expecation
    2.  **Test Case 2.3.2: Single Member Selected (e.g., Member A)**
        *   **Action:** Ensure "Strict Mode" is OFF. Select Member A.
        *   **Test Data:** T1, T2, T3
        *   **Expected Result:** Total actual expenses attributed to Member A = 290 (T1 + A's share of T2 + A's share of T3).
        *   **Feedback:** Meet my expecation
    3.  **Test Case 2.3.3: Multiple Members Selected (e.g., Member A & B)**
        *   **Action:** Ensure "Strict Mode" is OFF. Select Member A & B.
        *   **Test Data:** T1, T2, T3
        *   **Expected Result:** Total actual expenses attributed to Member A & B = 480 (T1 + A's share T2 + B's share T2 + A's share T3 + B's share T3).
        *   **Feedback:** Meet my expecation

### III. Strict Mode ON (Checkbox Checked)

*   **General Behavior:** Income transactions and non-shared expense transactions should be excluded. Only shared expenses where *ALL* selected members participated are counted. The amount counted is the sum of shares pertaining *only* to the selected members.

*   **Category Breakdown Report:**
    1.  **Test Case 3.1.1: No Members Selected**
        *   **Action:** Turn "Strict Mode" ON. Do not select any members.
        *   **Test Data:** T1, T2, T3
        *   **Expected Result:** Cat-Food total expense: 0. Cat-Utils total expense: 0.
        *   **Feedback:** Meet my expecation
    2.  **Test Case 3.1.2: Single Member Selected (e.g., Member A)**
        *   **Action:** Turn "Strict Mode" ON. Select Member A.
        *   **Test Data:** T1, T2, T3, T8
        *   **Expected Result:** Cat-Food: 100 (A's share of T2). Cat-Utils: 90 (A's share of T3). (T1 and T8 excluded).
        *   **Feedback:** No count T1 into A's result (Correct - T1 is non-shared and excluded in strict mode).
    3.  **Test Case 3.1.3: Multiple Members Selected (e.g., Member A & Member B)**
        *   **Action:** Turn "Strict Mode" ON. Select Member A and Member B.
        *   **Test Data:** T1, T2, T3, T8
        *   **Expected Result:** Cat-Food: 200 (A+B shares of T2). Cat-Utils: 180 (A+B shares of T3). (T1 and T8 excluded).
        *   **Feedback:** Meet my expecation
    4.  **Test Case 3.1.4: Multiple Members Selected, Not All Participate (e.g., Member A & Member D)**
        *   **Action:** Turn "Strict Mode" ON. Select Member A and Member D (assume D is not in T2 or T3 split).
        *   **Test Data:** T1, T2, T3
        *   **Expected Result:** Cat-Food: 0. Cat-Utils: 0. (T2 and T3 excluded as D is not in split).
        *   **Feedback:** Meet my expecation

*   **Member Breakdown Report:**
    1.  **Test Case 3.2.1: No Members Selected**
        *   **Action:** Turn "Strict Mode" ON. No members selected.
        *   **Expected Result:** All members show 0 expense.
        *   **Feedback:** Meet my expecation
    2.  **Test Case 3.2.2: Single Member Selected (e.g., Member A)**
        *   **Action:** Turn "Strict Mode" ON. Select Member A.
        *   **Test Data:** T1, T2, T3, T4, T8
        *   **Expected Result:** Only Member A shown. Expense = 190 (A's share T2 + A's share T3). Income = 0. Net = -190. (T1, T4, T8 excluded).
        *   **Feedback:** No count T1 into A's result (Correct - T1 is non-shared and excluded in strict mode).
    3.  **Test Case 3.2.3: Multiple Members Selected (e.g., Member A & Member B)**
        *   **Action:** Turn "Strict Mode" ON. Select Member A and Member B.
        *   **Test Data:** T1, T2, T3, T4, T8
        *   **Expected Result:** Show Member A and Member B. Member A: Exp=190. Member B: Exp=190. Income=0 for both. (T1, T4, T8 excluded).
        *   **Feedback:** Meet my expecation
    4.  **Test Case 3.2.4: Multiple Members Selected (e.g., Member A & Member C)**
        *   **Action:** Turn "Strict Mode" ON. Select Member A and Member C.
        *   **Test Data:** T1, T2, T3, T4, T8
        *   **Expected Result:** Show Member A and Member C. Member A: Exp=90 (A's share T3). Member C: Exp=120 (C's share T3). Income=0 for both. (T1, T2, T4, T8 excluded as A+C are not ALL in T2 split, and A+C are not ALL in T8 split).
        *   **Feedback:** Meet my expecation (This confirms the "ALL selected members" rule is working as intended for shared expenses).

*   **Budget Trend Report:** (Assuming "Exclude Income" is ON)
    1.  **Test Case 3.3.1: No Members Selected**
        *   **Action:** Turn "Strict Mode" ON. No members selected.
        *   **Test Data:** T1, T2, T3
        *   **Expected Result:** Total actual expenses = 0.
        *   **Feedback:** Meet my expecation
    2.  **Test Case 3.3.2: Single Member Selected (e.g., Member A)**
        *   **Action:** Turn "Strict Mode" ON. Select Member A.
        *   **Test Data:** T1, T2, T3
        *   **Expected Result:** Total actual expenses = 190 (A's share T2 + A's share T3). (T1 excluded).
        *   **Feedback:** No count T1 into A's result (Correct - T1 is non-shared and excluded in strict mode).
    3.  **Test Case 3.3.3: Multiple Members Selected (e.g., Member A & Member B)**
        *   **Action:** Turn "Strict Mode" ON. Select Member A & B.
        *   **Test Data:** T1, T2, T3
        *   **Expected Result:** Total actual expenses = 380 (A+B shares T2 + A+B shares T3). (T1 excluded).
        *   **Feedback:** Meet my expecation
    4.  **Test Case 3.3.4: Multiple Members Selected (e.g., Member A & Member C)**
        *   **Action:** Turn "Strict Mode" ON. Select Member A & C.
        *   **Test Data:** T1, T2, T3
        *   **Expected Result:** Total actual expenses = 210 (A+C shares T3). (T1, T2 excluded).
        *   **Feedback:** Meet my expecation

### IV. Interaction with Other Filters

1.  **Test Case 4.1: Strict Mode ON + Category Filter**
    *   **Action:** Turn "Strict Mode" ON. Select Member A. Select Category: Cat-Food.
    *   **Test Data:** T1, T2, T3
    *   **Expected Result (Category Breakdown):** Only Cat-Food shown. Total expense = 100 (A's share of T2). (T1 excluded).
    *   **Expected Result (Member Breakdown):** Member A shown. Expense = 100. (T1 excluded).
    *   **Expected Result (Budget Trend):** Total actual expenses = 100. (T1 excluded).
    *   **Feedback:** All result must count T1 (Expected T1 to be included?)
    *   **Updated Feedback:** T1 is not counted (Correct - T1 is non-shared and excluded in strict mode).
2.  **Test Case 4.2: Strict Mode OFF + "Exclude Income" OFF**
    *   **Action:** Turn "Strict Mode" OFF. Turn "Exclude Income" OFF. No members selected.
    *   **Test Data:** T1, T5
    *   **Expected Result (Category Breakdown):** Cat-Food: Income = 500, Expense = 100.
    *   **Expected Result (Member Breakdown):** Member A: Income = 500, Expense = 100.
    *   **Expected Result (Budget Trend):** Actual expenses line should still only reflect expenses (100).
    *   **Feedback:** Meet my expecation

### V. Edge Cases for `splitRatio`

1.  **Test Case 5.1: Strict Mode ON - Shared Expense, Selected Member has 0%**
    *   **Action:** Turn "Strict Mode" ON. Select Member A.
    *   **Test Data:** T7 (Expense 80, Cat-Food, Payer B, Shared (A:0%, B:100%)).
    *   **Expected Result (Category Breakdown):** Cat-Food total expense = 0 (A's share is 0).
    *   **Expected Result (Member Breakdown):** Member A expense = 0.
    *   **Feedback:** Can behave like no data available to report, share 0% means no share at all (Confirms current behavior is acceptable).
2.  **Test Case 5.2: Strict Mode ON - Shared Expense, Invalid/Null `splitRatio`**
    *   **Action:** Turn "Strict Mode" ON. Select Member A.
    *   **Test Data:** Transaction: Expense 100, Cat-Food, Payer A, Shared, `splitRatio: null` or invalid JSON.
    *   **Expected Result:** This transaction should be excluded from strict mode calculations. Cat-Food total expense = 0.
    *   **Feedback:** Meet my expecation
3.  **Test Case 5.3: Strict Mode OFF - Shared Expense, Invalid/Null `splitRatio`**
    *   **Action:** Turn "Strict Mode" OFF. Select Member A.
    *   **Test Data:** (Same as 5.2)
    *   **Expected Result:** Behavior should be graceful. The transaction should be excluded from member-specific calculations.
    *   **Feedback:** Meet my expecation