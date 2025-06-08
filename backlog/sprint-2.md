
---

## **SPRINT 2: Multi-User Synchronization & Cloud Backend**

> **Goal:**
> Transform the application to support multiple users across different devices with real-time data synchronization. This involves introducing a backend service, a centralized database, and user authentication.

### **User Story 2.1: Enable Multi-User Access and Real-time Data Sync**

As a user, I want to be able to access my financial data from multiple devices, and have changes made on one device reflect in real-time on others, so that my data is always up-to-date and accessible.
As a household, we want multiple members to be able to use the app with their own data or shared data (future consideration for sharing), synchronized across their devices.

---

### **CHI TIẾT CÔNG VIỆC CHO SPRINT 2:**

**I. Backend Infrastructure & Setup**
*   [x] **Task S2.1.1:** Choose and set up backend framework & hosting.
    *   *Options: Node.js (Express/NestJS) on a PaaS (Heroku, Render), or a Backend-as-a-Service (Firebase, Supabase).* => decision: NestJS
    *   *Decision point: Simplicity vs. control.*
*   [x] **Task S2.1.2:** Design and implement centralized database schema. (Prisma setup, models defined)
    *   Adapt existing `Category` and `Transaction` models to include `userId` to associate data with users.
    *   Consider tables/collections for `Users`.
*   [x] **Task S2.1.3:** Implement User Authentication API endpoints.
    *   Endpoint for user registration (e.g., email/password).
    *   Endpoint for user login, returning a session token (e.g., JWT).
    *   Secure password hashing and storage.
*   [x] **Task S2.1.4:** Implement API middleware for authenticating requests using tokens. (Temporarily bypassed for DEV)
**II. Backend API Development for Data Sync**
*   [x] **Task S2.2.1:** Develop CRUD API endpoints for `Categories`.
    *   Ensure all operations are scoped to the authenticated `userId`.
    *   `POST /api/users/:userId/categories` or `/api/categories` (userId from token)
    *   `GET /api/users/:userId/categories`
    *   `PUT /api/users/:userId/categories/:categoryId`
    *   `DELETE /api/users/:userId/categories/:categoryId`
    *   **Note:** This task will now include handling the structured `defaultSplitRatio` for categories (see User Story 2.2).
*   [x] **Task S2.2.2:** Develop CRUD API endpoints for `Transactions`.
    *   Ensure all operations are scoped to the authenticated `userId`.
    *   `POST /api/users/:userId/transactions`
    *   `GET /api/users/:userId/transactions`
    *   `PUT /api/users/:userId/transactions/:transactionId`
    *   `DELETE /api/users/:userId/transactions/:transactionId`
    *   **Note:** This task will now include:
        *   [x] Accepting an optional structured `splitRatio` for individual transactions.
        *   [x] If no custom ratio is provided, snapshotting the category's `defaultSplitRatio` into the transaction's `splitRatio` field upon creation.
        *   [x] Validating that percentages in any provided ratio sum to 100%.
*   [ ] **Task S2.2.3:** Implement basic real-time synchronization mechanism.
    *   *Options: WebSockets, Server-Sent Events, or long polling (if simpler for a first pass). Firebase/Supabase offer this out-of-the-box.* => Decision: WebSockets with Socket.IO
    *   When data changes on the server, push updates to connected clients for the relevant user.
*   [ ] **Task S2.2.4:** Define and implement a basic conflict resolution strategy (e.g., "last write wins" is often simplest to start).

---

### **User Story 2.2: Manage Household Members and Configure Share Ratios** (Backend Complete, Frontend UI In Progress)

As a user, I want to define and manage a list of household members (e.g., "Chồng", "Vợ", "Con"). I also want to configure default, 100%-based share ratios per category using these members, and be able to customize this ratio for individual transactions. This allows me to accurately assign who paid/received and how shared expenses are split, ensuring that changes to category defaults do not affect past transactions.

**I. Backend API Development for Household Members & Share Ratios**
*   [ ] **Task S2.2.5:** Define data model for `HouseholdMember` (Backend).
    *   `id` (string, unique, e.g., UUID)
    *   `name` (string, e.g., "Chồng", "Vợ")
    *   `userId` (string, foreign key to `User` table, to scope members to a household/account)
    *   `isActive` (boolean, default: true)
    *   `order` (number, optional, for display sorting)
*   [x] **Task S2.2.6:** Develop CRUD API endpoints for `HouseholdMembers` (Backend).
    *   Ensure operations are scoped to the authenticated `userId`.
    *   `POST /api/household-members` (or `/api/users/:userId/household-members`)
    *   `GET /api/household-members`
    *   `PUT /api/household-members/:memberId`
    *   `DELETE /api/household-members/:memberId`
*   [x] **Task S2.2.7:** Update `Category` model and API (Backend - part of S2.2.1 refinement).
    *   Modify `Category.defaultSplitRatio` to store a structured array: `[{ memberId: string, percentage: number }]`.
    *   Ensure `CategoryController` can accept, validate (sum to 100%), and store this structured ratio.
*   [x] **Task S2.2.8:** Update `Transaction` model and API (Backend - part of S2.2.2 refinement).
    *   Modify `Transaction.splitRatio` to store a structured array (snapshot or custom).
    *   Implement logic in `TransactionController` to snapshot category's default ratio if no custom ratio is provided for a new transaction.

---

**III. Frontend Integration & Modifications** (Core Store Logic Done, UI In Progress)
*   [x] **Task S2.3.1:** Create UI components for User Login and Registration
*   [x] **Task S2.3.2:** Implement client-side authentication logic. (skip authentication for DEV mode)
    *   Store auth token (e.g., in localStorage or secure cookie).
    *   Include token in API request headers.
    *   Handle token expiration and refresh (if applicable). (Future)
*   [ ] **Task S2.3.3:** Implement routing guards to protect authenticated routes (e.g., redirect to login if not authenticated).
*   [x] **Task S2.3.4:** Modify `categoryStore.ts`:
    *   Remove direct Dexie calls for primary data operations.
    *   Actions (`loadCategories`, `addCategory`, `updateCategory`, `deleteCategory`, etc.) now make API calls to the backend.
    *   Handle the new structured `defaultSplitRatio` data for categories.
    *   Implement logic to listen for real-time updates from the backend and update the local Pinia state. (Future, depends on S2.2.3)
    *   *Decision: Keep IndexedDB (Dexie) as a local cache/offline support, or remove it entirely for this phase? Using it as a cache adds complexity but improves perceived performance and offline capability.* => Using Dexie as a mock backend's data source for now. Decision on keeping it as cache deferred.
*   [x] **Task S2.3.5:** Modify `transactionStore.ts`:
    *   Similar to `categoryStore`, replace Dexie calls with backend API calls.
    *   Handle the new structured `splitRatio` data for transactions.
    *   Implement real-time update listeners. (Future, depends on S2.2.3)

*   [ ] **Task S2.3.8 (Was S2.3.8):** Create a new Pinia store: `householdMemberStore.ts`.
    *   State: `membersList`
    *   Actions: `loadMembers`, `addMember`, `updateMember`, `deleteMember` (calling backend APIs from Task S2.2.6).
*   [ ] **Task S2.3.9 (Was S2.3.9):** Create UI components for managing household members (e.g., `HouseholdMemberManagementPage.vue` or a dialog).
    *   List current members.
    *   Form to add a new member (name).
    *   Ability to edit member name.
    *   Ability to delete/deactivate a member.
*   [ ] **Task S2.3.10 (New):** Create/Update UI for Category Default Share Ratio Configuration (e.g., `CategorySettingsPage.vue` or integrated into category management).
    *   Allow selecting household members from `householdMemberStore`.
    *   Allow inputting percentages for each selected member, ensuring total is 100%.
    *   Save the structured `defaultSplitRatio` to the category via `categoryStore`.
*   [ ] **Task S2.3.11 (Was S2.3.10):** Modify `QuickEntryForm.vue`:
    *   Remove `mockUsers`.
    *   Populate "Ai chi/nhận" (Payer) dropdown from `householdMemberStore.membersList`.
    *   Dynamically generate UI for inputting/displaying the structured `splitRatio` based on household members.
    *   When a category is selected, pre-fill the split ratio UI with the category's `defaultSplitRatio`.
    *   Allow users to customize this ratio for the current transaction.
    *   Ensure the `payer` field (if still needed separately) and the structured `splitRatio` are correctly sent to `transactionStore`.
*   [ ] **Task S2.3.6:** Update UI components to handle:
    *   Loading states during API calls.
    *   Error messages from API responses.
    *   Displaying data fetched from the server.
    *   Implement optimistic updates in Pinia stores for CUD operations to improve perceived UI responsiveness.
    *   Handle potential data conflicts displayed to the user (if not using "last write wins").
*   [ ] **Task S2.3.7:** Implement a "Logout" feature (clear token, reset Pinia stores, redirect to login). (Skipped in DEV, will be implemented when backend auth is real)

**IV. Testing & Deployment**
*   [x] **Task S2.5.1:** Test user registration and login flows. (DEV user flow tested)
*   [x] **Task S2.5.2:** Test CRUD operations for categories and transactions with multiple clients, verifying real-time sync.
*   [ ] **Task S2.5.3:** Test data isolation between different user accounts.
*   [ ] **Task S2.5.4:** Test conflict resolution strategy (if implemented).
*   [x] **Task S2.5.5:** Set up deployment for the backend service. (Docker environment setup)
*   [x] **Task S2.5.6:** Update frontend build configuration to point to the deployed backend API.

---

## **SPRINT 3: Báo Cáo, Công Nợ, Xuất Ảnh, UI Nâng Cao**

> **Goal:**
> Implement reporting features, debt management, data export, and UI enhancements.

### **User Story 3.1: Báo cáo tổng thu chi, drilldown danh mục**

```markdown
### [UI] Báo cáo tổng hợp & drilldown

+----------------------------------------------------------+
| Báo cáo tháng MM/YYYY                                   |
+----------------------------------------------------------+
| Tổng thu:   [Amount]                                    |
| Tổng chi:   [Amount]                                    |
| Số dư:      [Amount]                                    |
+----------------------------------------------------------+
| [Biểu đồ tròn/cột]                                      |
| - [Category Name]: [Amount]   ([Percentage]%)           |
| - ...                                                -> |
| (Click vào từng mục xem chi tiết danh mục nhỏ)           |
+----------------------------------------------------------+
| Báo hiệu hạn mức: Đỏ (vượt), Cam (gần), Xanh (an toàn)  |
+----------------------------------------------------------+
