
# Sprint 5: Family Model Refactor Test Cases (Revised)

## Objective: Verify correct behavior, data isolation, and hierarchical, family-grouped, read-only member view for normal users in the new Family model (Big Family, Small Family).

---

---

### I. Household Member UI & Backend: Hierarchical, Family-Grouped, Read-Only View

- **TC_UI_001:** Household Members page shows hierarchical, family-grouped list (read-only for normal users)
  - **Steps:**
    1. Log in as a normal user.
    2. Navigate to the Household Members page.
    3. Verify that members are grouped by family in a hierarchical view (Big Family > Small Families > Members).
    4. Confirm that normal users cannot add, edit, or remove members (no edit UI is visible).
    5. Ensure all member details (name, email, phone, status) are displayed, and all references use personId (not membershipId or UUIDs).
    6. Confirm that payer and category fields display human-readable names, not UUIDs, in all relevant UI and reports.

- **TC_UI_002:** Admin user can add/link household members (if feature enabled)
  - **Steps:**
    1. Log in as an admin user.
    2. Navigate to the Household Members page.
    3. Add a new member by creating a new person or linking an existing person.
    4. Verify the new member appears in the correct family group.
    5. Confirm that duplicate memberships (same person in same family) are prevented.
    6. Confirm that duplicate persons (same email/phone) are allowed (backend does not enforce uniqueness yet).

- **TC_UI_003:** Backend endpoint `/household-members/my-members-by-family` returns correct hierarchical data for current user
  - **Steps:**
    1. Call the endpoint as a normal user.
    2. Verify the response contains all families and members the user is associated with, grouped by family (Big/Small Family hierarchy).
    3. Confirm that the backend uses the user's email to look up the correct person and memberships.
    4. Ensure no UUID validation errors occur (UUID validation removed from backend).

- **TC_UI_004:** Prevent duplicate memberships, allow duplicate persons
  - **Steps:**
    1. Attempt to link the same person to the same family more than once; verify prevention and error message.
    2. Attempt to create persons with the same email/phone; verify that the backend allows it.
    3. Confirm that duplicate memberships do not result in duplicate or inconsistent data in reports or transactions.

- **TC_UI_005:** Default family assignment for new members (admin only)
  - **Steps:**
    1. As admin, add a new member (create or link person).
    2. Verify that the member is assigned to the currently selected/default family.
    3. Switch to another family (if multi-family is enabled) and repeat; verify correct assignment.
    4. Confirm that all new transactions and reports for this member are scoped to the correct family.

---

- **TC_FAM_001:** Create a Big Family (main household) and verify it appears in the system.
  - **Steps:**
    1. Create a new Big Family.
    2. Verify it appears in the family list and can be selected as a context for all operations.
    3. Confirm that all new data (members, categories, transactions) can be associated with the Big Family.

- **TC_FAM_002:** Create multiple Small Families under a Big Family and verify the parent-child relationship is correct.
  - **Steps:**
    1. Create two or more Small Families and assign them to a Big Family as parent.
    2. Verify the parent-child relationship is correct in the UI and backend.
    3. Confirm that data isolation and reporting work as expected for each family.

- **TC_FAM_003:** Attempt to create a Small Family with a non-existent Big Family as parent; expect failure.
  - **Steps:**
    1. Attempt to create a Small Family with an invalid parent Big Family ID.
    2. Verify that the operation fails with an appropriate error message.


### II. User Assignment & Access Control

- **TC_FAM_010:** User can only view members and data for families they belong to (read-only for normal users)
  - **Steps:**
    1. Assign a user to a Small Family.
    2. Log in as that user and verify only members and data from the assigned Small Family are visible.
    3. Confirm that all references use personId and display names, not UUIDs.

- **TC_FAM_011:** Users in different Small Families cannot access each other's data
  - **Steps:**
    1. Assign User A to Small Family 1 and User B to Small Family 2.
    2. Log in as each user and verify they cannot access each other's members or data.

- **TC_FAM_012:** Admin user in Big Family can view all Small Families and their members
  - **Steps:**
    1. Assign a user as admin to the Big Family.
    2. Log in as that user and verify they can view all Small Families and their members in the hierarchical view.

- **TC_FAM_013:** Access control enforced for all endpoints and UI
  - **Steps:**
    1. As a user, attempt to access or modify data in a Family you are not assigned to (via UI or direct API call).
    2. Verify that the operation is forbidden and an appropriate error is shown.


### III. Data Ownership & CRUD

- **TC_FAM_020:** Data isolation for categories/transactions by family
  - **Steps:**
    1. Create a category and transaction in Small Family 1.
    2. Switch to Small Family 2 and verify the data is not visible.
    3. Confirm that all CRUD operations respect family boundaries and hierarchy.

- **TC_FAM_021:** Shared categories at Big Family level are visible in all Small Families
  - **Steps:**
    1. Create a category at the Big Family level.
    2. Verify that it is visible and usable in all Small Families under that Big Family.

- **TC_FAM_022:** Moving a user between families updates their data scope
  - **Steps:**
    1. Move a user from Small Family 1 to Small Family 2.
    2. Verify that their data scope updates accordingly.
    3. Confirm that all new transactions and reports are now scoped to the new family.

- **TC_FAM_023:** Deleting a Small Family removes all associated data
  - **Steps:**
    1. Delete a Small Family.
    2. Verify that all associated data (members, categories, transactions) is removed.
    3. Confirm that no data from the deleted family is accessible in the UI or backend.


### IV. Reporting & Summaries

- **TC_FAM_030:** Reports for Small Family include only that family's data
  - **Steps:**
    1. Generate a report for a Small Family.
    2. Verify that only data from that family is included in the report.
    3. Confirm that payer and category fields display names, not UUIDs.

- **TC_FAM_031:** Reports for Big Family aggregate data from all Small Families
  - **Steps:**
    1. Generate a report for the Big Family.
    2. Verify that the report aggregates data from all Small Families under it.
    3. Confirm correct aggregation and display of all relevant fields.

- **TC_FAM_032:** User in both Small and Big Family sees correct data per context
  - **Steps:**
    1. As a user who belongs to both a Small Family and the Big Family, generate reports for each context.
    2. Verify that each report includes only the correct data for the selected context.


### V. Settlements & Shared Expenses

- **TC_FAM_040:** Settlements within a Small Family do not affect other families
  - **Steps:**
    1. Record a settlement between two members of a Small Family.
    2. Verify that the settlement is only visible and affects balances within that family.

- **TC_FAM_041:** Shared expenses at Big Family level are split among all Small Families
  - **Steps:**
    1. Record a shared expense at the Big Family level.
    2. Verify that the expense is split among all Small Families according to the configured rules.
    3. Confirm correct calculation and display in all reports.


### VI. Edge Cases & Security

- **TC_FAM_050:** Creating a transaction with invalid familyId returns error
  - **Steps:**
    1. Attempt to create a transaction with an invalid or non-existent familyId.
    2. Verify that the operation fails with an appropriate error message.

- **TC_FAM_051:** Accessing a deleted Family returns not found or forbidden error
  - **Steps:**
    1. Attempt to access a Family that has been deleted.
    2. Verify that the operation fails with a not found or forbidden error.

- **TC_FAM_052:** Assigning a user to multiple Small Families is handled per business rules
  - **Steps:**
    1. Attempt to assign a user to multiple Small Families at the same time.
    2. Verify that the system either prevents this or handles it according to business rules.

---

---

These revised test cases ensure the new Family model enforces correct data isolation, access control, hierarchical member grouping, and reporting for both Big and Small Families, and that all CRUD and reporting features respect the new hierarchy and access rules. They also reflect the new backend logic, frontend UI, and removal of UUID validation.
