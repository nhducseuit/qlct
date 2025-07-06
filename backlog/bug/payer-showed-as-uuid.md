# Debugging Log: Payer and Category Displayed as UUID

This document summarizes the debugging process for an issue where transaction payers and categories were incorrectly displayed as UUIDs instead of human-readable names.

## Initial Report

**Problem:** In the transaction list view, the "Payer" field on a transaction card shows a UUID instead of the person's name. This was first observed in **Scenario 1: Verify Data Scoping for "My family"**.

## Investigation & Fix Attempts

### Attempt 1: Incomplete Frontend Fix

*   **Hypothesis:** The display component (`CategoryBreakdownReport.vue`) was using the wrong ID to look up the member's name.
*   **Action:** A fix was implemented in the `getMemberName` helper function to look up a member by `person.id` instead of the membership `id`.
*   **Result:** This was only a partial fix. It worked for some transactions (likely those created by the seed script) but not for transactions created through the UI. The issue was not fully resolved.

### Attempt 2: Identifying the Root Cause - Data Inconsistency

*   **Hypothesis:** The problem was deeper than just the display logic. There was a fundamental inconsistency in what the `Transaction.payer` field represented.
*   **Analysis:**
    *   The **backend services** and **seed data** correctly treated `Transaction.payer` as a `personId`.
    *   The **frontend UI** (e.g., the "Payer" dropdown in the transaction form) was built to use `HouseholdMembershipId`.
    *   When a new transaction was created, this `membershipId` was being sent to the backend and saved directly into the `payer` field, which expected a `personId`.
*   **Conclusion:** The root cause was a data model violation. The frontend was sending the wrong type of ID to the backend.

### Attempt 3: Flawed Fix - Incorrect Property Name

*   **Hypothesis:** The `transactionStore` should be responsible for converting the `membershipId` from the UI into a `personId` before sending it to the API.
*   **Action:** Logic was added to `transactionStore.ts` to perform this conversion. However, the API payload was modified to use a new property, `payerId`, instead of the existing `payer` property.
*   **Result:** This failed. The backend API, which expected a field named `payer`, ignored the `payerId` field. The `payer` field in the database was saved as `null`, and the UI fell back to displaying the transaction's own UUID as a last resort.

### Attempt 4: Corrected Frontend Logic

*   **Hypothesis:** The logic from Attempt 3 was correct, but the property name was wrong.
*   **Action:**
    1.  The API payload in `transactionApiService.ts` was corrected to use the `payer` property name.
    2.  The logic in `transactionStore.ts` was refined to ensure it correctly looked up the `personId` from the `membershipId` and placed it in the `payer` field of the payload for both `addTransaction` and `updateTransaction` actions.
    3.  A TypeScript error was fixed by handling cases where the `payer` could be `null`.
*   **Result:** This fixed the issue for newly created transactions. The correct `personId` was now being saved.

### Attempt 5: Fixing the Regression on Edit

*   **Problem:** After the previous fix, a regression appeared. When editing an existing transaction *without changing the payer*, both the **payer** and the **category** would display as UUIDs after saving.
*   **Analysis:** The `updateTransaction` logic was still flawed. It received the `personId` from the already-saved transaction but incorrectly treated it as a `membershipId` for the lookup. The lookup failed, causing the `payer` to be nulled out in the database on save. The category issue was a side-effect of this broken update payload.
*   **Final Solution:** The `updateTransaction` function in `transactionStore.ts` was made robust. It now correctly handles the `membershipId` coming from the form's dropdown and ensures that all necessary fields (including `categoryId`) are preserved in the update payload, preventing data loss. This resolved both the payer and category display issues.

### Attempt 6: Fixing Hierarchical Data Display

*   **Problem:** After all previous fixes, the payer name was still showing as a UUID, but only on the Settlements/Balances page when viewing a "big family" scope.
*   **Analysis:** The issue was not in the frontend display logic, but in the backend's `settlements.service.ts`. The `calculateBalances` function was only fetching transactions for the single selected family (`familyId`) and was not including transactions from its child families. This resulted in an incomplete set of transactions and persons, causing the name lookup to fail for members of child families.
*   **Hierarchical Solution:**
    1.  A new helper method, `getFamilyTreeIds`, was added to `family.service.ts` to recursively find all child family IDs for a given parent.
    2.  The `calculateBalances` method in `settlements.service.ts` was updated to use this helper. It now fetches shared transactions and settlements from the entire family tree (`familyId: { in: [...] }`), ensuring all relevant data is included in the balance calculation. This provides the frontend with complete data, resolving the final display issue.

### Attempt 7: Fixing Backend Dependency Injection

*   **Problem:** After adding `FamilyService` to the `SettlementsService` constructor, the NestJS application failed to start with an `UnknownDependenciesException`.
*   **Analysis:** The issue was not in the frontend display logic, but in the backend's `settlements.service.ts`. The `calculateBalances` function was only fetching transactions for the single selected family (`familyId`) and was not including transactions from its child families. This resulted in an incomplete set of transactions and persons, causing the name lookup to fail for members of child families.
*   **Final Hierarchical Solution:**
    1.  A new helper method, `getFamilyTreeIds`, was added to `family.service.ts` to recursively find all child family IDs for a given parent.
    2.  The `calculateBalances` method in `settlements.service.ts` was updated to use this helper. It now fetches shared transactions from the entire family tree (`familyId: { in: [...] }`), ensuring all relevant data is included in the balance calculation. This provides the frontend with complete data, resolving the final display issue.
    2.  The `calculateBalances` method in `settlements.service.ts` was updated to use this helper. It now fetches shared transactions and settlements from the entire family tree (`familyId: { in: [...] }`), ensuring all relevant data is included in the balance calculation. This provides the frontend with complete data, resolving the final display issue.
*   **Solution:**
    1.  In `family.module.ts`, `FamilyService` was added to the `exports` array to make it available to other modules.
    2.  In `settlements.module.ts`, `FamilyModule` was added to the `imports` array. This makes all exported providers from `FamilyModule` (including `FamilyService`) available for injection within `SettlementsModule`, resolving the dependency error.

### Attempt 8: Resolving Backend Build Errors After Schema Changes

*   **Problem:** After refactoring the database schema to normalize `User`, `Person`, and `Family` relationships, the backend build failed with multiple TypeScript errors in `auth.service.ts`.
*   **Analysis:** The errors indicated a deep desynchronization between the Prisma schema, the generated Prisma Client, and the service logic trying to use it.
    1.  **Invalid Query:** The code was trying to find a `Person` by `email`, but `email` was not defined as a unique field in the `Person` model, making the query invalid.
    2.  **Incorrect Relation Name:** The code tried to access `person.householdMemberships`, but the relation in the schema was actually named `memberships`.
    3.  **Incorrect User Creation:** The `register` function attempted to create a `User` without linking it to a `Family`, which violated a new database constraint. The logic for creating a user, person, and family in a single transaction was flawed.
*   **Final Solution:**
    1.  **Schema Correction (`prisma/schema.prisma`):** The `email` field on the `Person` model was marked with `@unique`. The relation to `HouseholdMembership` was correctly named `memberships`.
    2.  **Auth Service Correction (`auth.service.ts`):** The `login` and `register` functions were rewritten. The registration logic now correctly creates a `Family`, `User`, `Person`, and `HouseholdMembership` in a single atomic transaction, ensuring all relations are established correctly from the start.
    3.  **Client Generation:** After correcting the schema and service logic, `npx prisma migrate dev` was run to apply the changes to a new migration, followed by `npx prisma generate` to update the Prisma Client. This brought the application code, the client library, and the database schema into alignment, resolving all build errors.

### Attempt 9: Database Reset and Final Verification

*   **Problem:** After multiple schema changes and failed migrations, the development database was in an inconsistent state, causing data loss and preventing the application from running correctly. The `User` table was missing the `name` column, and other data was lost.
*   **Analysis:** The `dev` database had drifted from the schema defined in the migrations. A destructive migration had been applied, dropping columns. The easiest way to ensure a clean state for testing was to completely reset the database to match the full migration history.
*   **Solution:**
    1.  **Database Reset:** The command `npx prisma migrate reset` was used. This command drops the database, re-applies all migrations from the beginning, and runs the seed script. This ensures the database schema is perfectly in sync with `prisma/schema.prisma` and populated with fresh test data.
    2.  **Verification:** After the reset, the backend server is started and the application is tested to confirm that the payer's name (and all other related data) displays correctly, and that all functionality works as expected.

---

**Update (2025-07-06):**
The issue with the payer and category being displayed as UUIDs instead of names has been fully resolved.

- The root cause was a mismatch between the frontend and backend: the frontend was sending a membershipId as the payer, but the backend expected a personId.
- The fix involved correcting the data transformation in the frontend store, ensuring the correct property (`payer`) and value (personId) were sent to the backend.
- Additional backend and schema adjustments were made to ensure all relationships and lookups worked as intended.
- The final verification step (after a database reset and full migration) confirmed that the payer and category now display correctly in all views and data scopes.

**Status:** The issue was solved as of 2025-07-05 and remains resolved after further verification.