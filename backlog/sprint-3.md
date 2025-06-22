# Sprint 3: Financial Summaries & Analytics

**Sprint Goal:** To provide users with powerful tools to visualize and analyze their financial data through an interactive reports page, enabling better financial insights and decision-making.

---

## Key Features & User Stories

- **As a user,** I want to see a summary of my income vs. expenses over different time periods (monthly, yearly).
- **As a user,** I want to filter my reports by specific household members to understand their financial impact.
- **As a user,** I want to see a breakdown of my spending by category in both a table and a chart.
- **As a user,** I want to click on a category in a report to see the detailed transactions that make up that total.
- **As a user,** I want to compare my actual spending against my set budgets.
- **As a user,** I want to export my reports to a PDF file for offline viewing or sharing.

---

## Technical Backlog

### Backend

- [x] **Summaries API:** Implement a new `SummariesController` and `SummariesService`.
- [x] **API Endpoints:** Create endpoints for `totals`, `category-breakdown`, `member-breakdown`, and `budget-trend`.
- [x] **Filtering Logic:** Enhance all summary services to support advanced filtering by `memberIds`, `categoryIds`, `transactionType` (income/expense), and `isStrictMode`.
- [x] **Transaction API Enhancement:** Update the `GET /transactions` endpoint to support detailed filtering to power the report drill-down feature.

### Frontend

- [x] **Reports Page:** Create `ReportsPage.vue` as the central hub for all analytics.
- [x] **Global Filters:** Implement UI controls for global filtering by Year, Month, Category, Household Members, Income Exclusion, and Strict Mode.
- [x] **Reporting Components:**
    - [x] `CategoryBreakdownReport.vue`: Implement an interactive table and charts (pie, bar) for category analysis.
    - [x] `MemberBreakdownReport.vue`: Implement a bar chart to visualize totals per member.
    - [x] `MonthlyBudgetExpenseTrendChart.vue`: Implement a line/bar chart to show actual spending vs. budget over time.
- [x] **Drill-Down Functionality:** Implement logic to fetch and display a transaction detail table when a user clicks on a category in a report.
- [x] **PDF Export:** Integrate `jspdf` and `html2canvas` to provide a client-side "Export to PDF" feature for the reports page.