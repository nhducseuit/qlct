# Feature Vision: Multi-Level Family Financial Management

**Objective:** Evolve the application from a single-household model to a hierarchical system that supports a "Big Family" containing multiple "Small Family" units. This allows for granular tracking of personal/internal finances while also managing shared household expenses.

---

## Core Concepts & User Stories

### 1. Hierarchical Grouping
- **As a family administrator,** I want to define a "Big Family" that represents my entire household.
- **As a user,** I want to belong to a "Small Family" (e.g., my spouse and I, my single sister, my brother's family) which is a sub-unit of the "Big Family".

### 2. Granular Data Ownership & Access Control
- **As a user,** when I enter a transaction, it should belong to my "Small Family".
- **As a user,** I want to view reports that ONLY show data for my "Small Family" and the shared expenses of the "Big Family". I should not see the private data of other "Small Family" units.
- **As a user,** I want to see a settlement sheet that only includes balances relevant to me and the members of the "Big Family".

### 3. Configurable Shared Resources
- **As a family administrator,** I want to define shared expense categories (e.g., "Food", "Electricity") at the "Big Family" level.
- **As a member of a "Small Family",** I want to set my own unique monthly `budgetLimit` for these shared categories, as well as for my personal categories.

### 4. Role-Based Access & Delegation
- **As a family administrator,** I need the ability to manage the "Big Family" settings and potentially enter transactions on behalf of other "Small Family" units (e.g., for my single sister).
- **As a regular user,** my access should be limited to my own "Small Family" data and shared "Big Family" data.

---

## High-Level Design Principles

1.  **New Entities:** Introduce `BigFamily` and `SmallFamily` models.
2.  **Data Ownership:** All primary data models (`Transaction`, `Category`, `HouseholdMember`, `Settlement`, etc.) will be owned by a `SmallFamily`.
3.  **Shared Category Templates:** A `BigFamilyCategoryTemplate` will define the concept of a shared category (e.g., "Food").
4.  **Per-Family Configuration:** A `SmallFamilyCategoryConfig` model will link a `SmallFamily` to a category (either personal or a shared template) and store family-specific settings like `budgetLimit`.
5.  **Authorization Logic:** Backend services will be updated to filter all data queries based on the authenticated user's `smallFamilyId` and their parent `bigFamilyId`.
6.  **Phased Rollout:**
    *   **Phase 1:** Implement the core data model and refactor the backend.
    *   **Phase 2:** Build the "Small Family" reporting UI and the "Expense Meter" feature.
    *   **Phase 3:** Implement user management, invitations, and formal RBAC.