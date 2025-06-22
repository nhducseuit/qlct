# Sprint 6: Small Family Reporting & Expense Meter

**Sprint Goal:** Leverage the new data model to build the user-facing reporting features for a "Small Family", including the high-value "Expense Meter".

---

## Key Features & User Stories

- **As a user,** I want to view a report for my "Small Family" that shows our income, expenses, and savings, completely separate from the "Big Family" report.
- **As a user,** I want to see a visual "expense meter" for each of my family's categories that compares our current spending against our monthly budget, so I can better control our expenses.

---

## Technical Backlog

- [ ] **UI - Category Management:** Update the `CategoryFormDialog` to allow setting a `budgetLimit` for a category.
- [ ] **Backend - Category Service:** Ensure the `updateCategory` service correctly saves the `budgetLimit` to the `SmallFamilyCategoryConfig` model.
- [ ] **UI - New Component:** Create an `ExpenseMeter.vue` component to visually display budget vs. actual spending.
- [ ] **UI - Reports Page:** Integrate the `ExpenseMeter.vue` into the reports page.
- [ ] **Backend - Summaries Service:** Update the `getCategoryBreakdown` endpoint to join with `SmallFamilyCategoryConfig` and return the correct `budgetLimit` for the user's family.
- [ ] **Frontend - Reports Page:** Add logic to switch between "Big Family" and "Small Family" report views.