# Sprint 1: Project Foundation & Core Local Functionality

**Sprint Goal:** To establish the foundational architecture of the frontend application and build the core UI components with local, in-memory state management. This sprint focuses on creating a functional, single-user prototype without a persistent backend.

---

## Key Features & User Stories

- **As a user,** I want a clear and intuitive layout to navigate the application's main features.
- **As a user,** I want to add new expense and income transactions.
- **As a user,** I want to view a list of my past transactions.
- **As a user,** I want to create and manage categories for my transactions.
- **As a user,** I want to define the members of my household.

---

## Technical Backlog

### Frontend

- [x] **Project Setup:** Initialize Vue 3 + Quasar project.
- [x] **State Management:** Set up Pinia stores (`transactionStore`, `categoryStore`, `householdMemberStore`) with initial in-memory data structures.
- [x] **UI - Layout:** Create `MainLayout.vue` with a header, footer, and navigation drawer.
- [x] **UI - Components:**
    - [x] Develop `QuickEntryForm.vue` for adding new transactions.
    - [x] Develop `TransactionsPage.vue` to list all transactions.
    - [x] Develop basic UI for managing categories and household members.
- [x] **Initial Data Models:** Define frontend-only interfaces for `Transaction`, `Category`, and `HouseholdMember`.