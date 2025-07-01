# Sprint 5: Family Model Refactor Test Cases

## Objective: Verify correct behavior and data isolation for the new hierarchical Family model (Big Family, Small Family).

---

### I. Family Creation & Hierarchy

- **TC_FAM_001:** Create a Big Family (main household) and verify it appears in the system.
- **TC_FAM_002:** Create multiple Small Families under a Big Family and verify the parent-child relationship is correct.
- **TC_FAM_003:** Attempt to create a Small Family with a non-existent Big Family as parent; expect failure.

### II. User Assignment & Access Control

- **TC_FAM_010:** Assign a user to a Small Family and verify their data (categories, transactions) is scoped to that Small Family.
- **TC_FAM_011:** Assign multiple users to different Small Families; verify they cannot access each other's data.
- **TC_FAM_012:** Assign a user to the Big Family (admin role) and verify they can view all Small Families and their data.
- **TC_FAM_013:** Attempt to access or modify data in a Family the user does not belong to; expect forbidden error.

### III. Data Ownership & CRUD

- **TC_FAM_020:** Create a category/transaction in a Small Family; verify it is not visible in other Small Families.
- **TC_FAM_021:** Create a shared category at the Big Family level; verify it is visible to all Small Families.
- **TC_FAM_022:** Move a user from one Small Family to another; verify their new data scope.
- **TC_FAM_023:** Delete a Small Family; verify all its data is removed and not accessible.

### IV. Reporting & Summaries

- **TC_FAM_030:** Generate a report for a Small Family; verify only that family's data is included.
- **TC_FAM_031:** Generate a report for the Big Family; verify it aggregates data from all Small Families.
- **TC_FAM_032:** Generate a report for a user who belongs to both a Small Family and the Big Family (admin); verify correct data scoping.

### V. Settlements & Shared Expenses

- **TC_FAM_040:** Record a settlement between members of the same Small Family; verify it does not affect other families.
- **TC_FAM_041:** Record a shared expense at the Big Family level; verify it is split among all Small Families as configured.

### VI. Edge Cases & Security

- **TC_FAM_050:** Attempt to create a transaction with an invalid familyId; expect error.
- **TC_FAM_051:** Attempt to access a deleted Family; expect not found or forbidden error.
- **TC_FAM_052:** Attempt to assign a user to multiple Small Families simultaneously; expect error or correct handling.

---

These test cases ensure the new Family model enforces correct data isolation, access control, and reporting for both Big and Small Families, and that all CRUD and reporting features respect the new hierarchy.
