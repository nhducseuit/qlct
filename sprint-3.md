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

---

**Current Progress:**
Backend APIs for summaries are largely complete and have been enhanced to support member-specific filtering.
The frontend `ReportsPage.vue` is highly interactive:
*   Global filters for Year, Month, Category, and Member are functional.
*   The Trend Chart, Category Breakdown (with transaction drill-down from table and charts), and Member Breakdown (with chart and collapsible UI) components are implemented and integrated.
The primary focus has been on delivering rich, interactive data visualization and drill-down capabilities.