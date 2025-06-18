# Sprint 3: Financial Summaries & Analytics

**Sprint Goal:** Implement comprehensive financial reporting and analytical capabilities, providing users with insightful views into their income, expenses, and budget adherence.

---

## Key Objectives & Features:

### 1. Backend API Development:
    - [x] **Total Income/Expense Summaries:** API to provide aggregated totals for income, expenses, and net change, filterable by period (monthly, quarterly, yearly) and year.
        *   Endpoint: `GET /summaries/totals`
        *   DTOs: `GetTotalsSummaryQueryDto`, `PeriodSummaryDto`, `TotalsSummaryResponseDto`
    - [x] **Category Breakdown:** API to detail income/expense distribution per category for a specified period, filterable by specific category IDs, and including budget limits.
        *   Endpoint: `GET /summaries/category-breakdown`
        *   DTOs: `GetCategoryBreakdownQueryDto`, `CategoryBreakdownItemDto`, `CategoryBreakdownResponseDto`
    - [x] **Member Breakdown:** API to show income/expense contributions or allocations per household member for a specified period.
        *   Endpoint: `GET /summaries/member-breakdown`
        *   DTOs: `GetMemberBreakdownQueryDto`, `MemberBreakdownItemDto`, `MemberBreakdownResponseDto`
    - [x] **Average Expenses:** API to calculate average monthly expenses over a given period, filterable by categories.
        *   Endpoint: `GET /summaries/average-expenses`
        *   DTOs: `GetAverageExpensesQueryDto`, `AverageExpensesResponseDto`
    - [x] **Budget vs. Actual Comparison:** API to compare budgeted amounts against actual spending for all categories with defined budgets, for a specific period.
        *   Endpoint: `GET /summaries/budget-comparison`
        *   DTOs: `GetBudgetComparisonQueryDto`, `BudgetComparisonItemDto`, `BudgetComparisonResponseDto`
    - [x] **Budget Trend Analysis:** API to provide data for trend charts showing total budget vs. total actual expenses over time (e.g., monthly for a year).
        *   Endpoint: `GET /summaries/budget-trend`
        *   DTOs: `GetBudgetTrendQueryDto`, `BudgetTrendItemDto`, `BudgetTrendResponseDto`

### 2. Frontend UI/UX (Reports Page - `ReportsPage.vue`):
    - [x] **Global Filters:** Implement global filters for Year, Month, and Category selection to drive the report data.
    - [x] **Global Member Filter:** Added a multi-select filter for Household Members to refine report data. (Part of S3.2.1.2)
    - [x] **Monthly Budget vs. Expense Trend Chart (`MonthlyBudgetExpenseTrendChart.vue`):**
        *   Display a line chart showing the trend of total budgeted amounts vs. total actual expenses on a monthly basis for the selected year and categories.
        *   Allow users to click on a specific month in the trend chart to update other detail views (e.g., Category Breakdown) for that selected month.
    - [x] **Category Breakdown Report (`CategoryBreakdownReport.vue`):**
        *   Display a pie chart showing the distribution of expenses across categories for the selected period.
        *   Display a bar chart comparing actual expenses against budget limits for each category for the selected period.
        *   Provide a detailed table view of income/expenses per category.
        *   This report should be interactive, updating based on selections from the global filters and the Trend Chart.
        *   [x] Implemented drill-down: Clicking a category (in table or charts) displays its contributing transactions.
        *   [x] Added a button to navigate to the full transaction list from the drill-down view.
    - [x] **Member Breakdown View (`MemberBreakdownReport.vue`):**
        *   [x] Display financial contributions/allocations per household member in a table.
        *   [x] Added a bar chart to visualize income/expense per member.
        *   [x] Made the section collapsible by default.
    - [x] **Highcharts Integration:** Successfully integrate and utilize Highcharts for all chart visualizations, addressing any TypeScript and ESLint challenges.
    - [x] **Export to PDF:** Add functionality to export the current report view (based on active filters) as a PDF document. (Initial client-side implementation using `jspdf` and `html2canvas` complete, with basic layout adjustments and pagination).
### 3. [x] Implemented "Strict Mode" for Reports:
    - **Objective:** Provide users with a "strict" filtering option for reports (Category Breakdown, Member Breakdown, Budget Trend) when specific household members are selected.
    - **Frontend:**
        - [x] Added a "Chế độ nghiêm ngặt" (Strict Mode) checkbox to the global filters on `ReportsPage.vue`.
        - [x] Updated `ReportsPage.vue` to pass the `isStrictMode` (true/false) flag to all relevant `summaryStore` actions.
        - [x] Ensured `summaryStore.ts` correctly includes `isStrictMode` in API query DTOs.
        - [x] Handled potential `null` values for `selectedMemberIdsGlobal` when strict mode is active but no members are selected, preventing frontend errors.
    - **Backend (`SummariesService`):**
        - [x] Implemented `applyStrictMode` logic:
            - For shared expenses, only includes transactions where ALL selected members participated.
            - Adjusts the transaction amount to reflect only the sum of shares of the selected members.
            - Excludes non-shared expenses and all income transactions when strict mode is active with member filters.
        - [x] Implemented `applyNonStrictModeMemberFilter` for consistent non-strict member filtering.
        - [x] Updated DTOs (e.g., `GetCategoryBreakdownQueryDto`, `GetMemberBreakdownQueryDto`, `GetBudgetTrendQueryDto`) to accept `isStrictMode` as a string (`"true"`/`"false"`) from the query parameters and parse it into a boolean within the service layer to handle DTO transformation issues with boolean query parameters.
    - **Testing:**
        - [x] Successfully passed relevant test cases (TC3.x series) validating the behavior of strict mode under various conditions (no members selected, single member, multiple members, etc.).

---

**Current Progress:**
Backend APIs for summaries are largely complete and have been enhanced to support member-specific filtering.
The frontend `ReportsPage.vue` is highly interactive:
*   Global filters for Year, Month, Category, and Member are functional.
*   The Trend Chart, Category Breakdown (with transaction drill-down from table and charts), and Member Breakdown (with chart and collapsible UI) components are implemented and integrated.
The primary focus has been on delivering rich, interactive data visualization and drill-down capabilities.
