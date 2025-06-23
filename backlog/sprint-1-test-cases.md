# Sprint 1: Test Cases

## Objective: Verify core local functionality of the application prototype.

---

### TC1.1: Add a New Transaction
1.  **Given** I am on the "Thêm chi tiêu / thu nhập" page.
2.  **When** I fill in the amount, select a category, choose a payer, and enter a note.
3.  **And** I click the "Thêm" button.
4.  **Then** the transaction should appear in the "Danh sách ghi chú thu/chi" page.

### TC1.2: Create a New Category
1.  **Given** I am on the "Quản lý Danh mục" page.
2.  **When** I enter a name for a new category and save it.
3.  **Then** the new category should be available for selection in the `QuickEntryForm`.

### TC1.3: View Transaction List
1.  **Given** I have added several transactions.
2.  **When** I navigate to the "Danh sách ghi chú thu/chi" page.
3.  **Then** I should see a list of all my transactions, correctly displaying their details.