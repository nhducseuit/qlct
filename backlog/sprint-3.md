# Sprint 3: Financial Summaries & Analytics

**Sprint Goal:** Deliver key financial summary views, providing users with insights into their income and expenses across various dimensions (time, categories, members) and enabling comparison with budget limits.

**Sprint Duration:** (Define your typical sprint duration, e.g., 2 weeks)

**Sprint Owner:** (Your Name/Team Lead)

---

## Sprint Backlog:

### Backend (S3.1.x - API Endpoints for Summaries)
- **S3.1.1:** Design and implement API endpoints for fetching aggregated transaction data.
    -   S3.1.1.1: Endpoint for monthly, quarterly, and yearly total income/expense summaries.
    -   S3.1.1.2: Endpoint for income/expense breakdown by category for a given period.
    -   S3.1.1.3: Endpoint for income/expense breakdown by household member for a given period.
- **S3.1.2:** Backend logic to calculate average expenses (e.g., daily/monthly average for selected periods/categories).
- **S3.1.3:** Backend logic to compare actual spending against category budget limits for a given period.

### Frontend (S3.2.x - UI for Summaries & Analytics)
- **S3.2.1:** Create a "Dashboard / Reports / Summaries" page (e.g., `DashboardPage.vue` or `ReportsPage.vue`).
    -   S3.2.1.1: Basic layout for displaying multiple summary components.
    -   S3.2.1.2: Implement global filters for the reports page (e.g., master date range selector, member selector).
- **S3.2.2:** UI Component: Display monthly, quarterly, and yearly income/expense totals.
    -   Consider a tabular view or clear statistical cards.
- **S3.2.3:** UI Component: Display income/expense breakdown by category.
    -   Use charts (e.g., pie chart for expense distribution, bar chart for income/expense per category).
    -   Allow drilling down or filtering by parent/child categories if feasible.
- **S3.2.4:** UI Component: Display income/expense breakdown by household member.
    -   Show contributions/spending per member.
- **S3.2.5:** UI Component: Display average expenses (e.g., "Average daily spend this month").
- **S3.2.6:** UI Component: Display budget vs. actual spending for categories.
    -   Show progress bars or visual indicators of spending against limits.
- **S3.2.7:** Integrate backend summary APIs with the new frontend components.
- **S3.2.8:** Ensure summary views are responsive and user-friendly.

### Testing & Refinement (S3.3.x)
- **S3.3.1:** Thoroughly test the accuracy of all summary calculations and data presentation.
- **S3.3.2:** Test usability of the reports page and its filters.
- **S3.3.3:** Performance testing for summary generation, especially with larger date ranges.

---
**Definition of Done for Sprint 3:**
- All listed tasks completed and tested.
- Users can view accurate monthly, quarterly, and yearly financial summaries.
- Users can analyze expenses by category and household member.
- Users can compare their spending against set budget limits.
- The core value proposition of financial insight is delivered.