# Sprint 5: AI-Powered Financial Recommendations

**Sprint Goal:** Introduce AI-driven recommendations to help users gain deeper insights from their financial data, initially focusing on summaries and potentially extending to daily transaction advice.

**Sprint Duration:** (Define your typical sprint duration, e.g., 2 weeks)

**Sprint Owner:** (Your Name/Team Lead)

---

## Sprint Backlog:

### Predefined Share Ratios (Continued)

- **Feature:** Provide functionality to configure and reuse sets of predefined share ratios.
- **Status (Start of Sprint 5):** Backend CRUD and WebSocket integration complete. Frontend API service and store complete. Integration into Transaction Quick Entry Form complete.
- **Remaining Tasks for Sprint 5:**
    - [ ] Create UI page/dialogs for managing (listing, adding, editing, deleting) predefined split ratios.
        - [ ] Design and implement `PredefinedRatiosPage.vue`.
        - [ ] Design and implement `PredefinedRatioFormDialog.vue` for add/edit operations.
        - [ ] Integrate store actions for CRUD operations on this page.
    - [ ] Integrate predefined ratio selection into `CategoryFormDialog.vue`.

### Household Member Ordering (Continued)

- **Feature:** Enable configuration and persistence of household member display order.
- **Status (Start of Sprint 5):** Backend model supports `order`. Frontend store sorts by `order` and implements basic reordering logic. UI controls (Up/Down buttons) added.
- **Remaining Tasks for Sprint 5:**
    - [ ] (Verification) Confirm that WebSocket updates for member order changes correctly trigger UI updates in `HouseholdMembersPage.vue`.
    - [ ] (Optional/Future) Consider adding drag-and-drop reordering in the UI.
    - [ ] (Optional/Future) Add logic to automatically assign an initial `order` value when a new member is created (e.g., last in the list). (Backend or Frontend store)

### Optional Category Default Share Ratio (Enhancement)

- **Feature:** Improve UI clarity for optional default share ratio on categories.
- **Status (Start of Sprint 5):** Functionality is optional from a data perspective.
- **Task for Sprint 5:**
    - [ ] (Optional/Future) Add a UI toggle in `CategoryFormDialog.vue` to explicitly enable/disable the default split ratio section for better clarity.

### Research & Design (S5.1.x)
- **S5.1.1:** Research and select an AI/ML approach or service for financial recommendations.
    -   Options: Rule-based engine, simple statistical models, or integration with an external AI API (e.g., OpenAI, Google AI).
    -   Consider complexity, cost, data privacy, and ease of integration.
- **S5.1.2:** Define specific types of recommendations to provide based on summaries (e.g., spending patterns, budget adherence, savings opportunities, unusual expense detection).
- **S5.1.3 (Stretch):** Define types of recommendations for daily/individual transactions (e.g., better category suggestions, duplicate transaction alerts, subscription reminders).

### Backend (S5.2.x - AI Logic & APIs)
- **S5.2.1:** Implement backend logic to generate recommendations based on financial summaries (from Sprint 3).
    -   This might involve querying aggregated data and applying rules or model predictions.
- **S5.2.2:** Create API endpoint(s) to fetch these summary-based recommendations for the authenticated user.
- **S5.2.3 (Stretch):** Implement backend logic for daily/transaction-specific recommendations.
- **S5.2.4 (Stretch):** Create API endpoint(s) to fetch daily/transaction-specific recommendations.

### Frontend (S5.3.x - Displaying Recommendations)
- **S5.3.1:** Design and implement a UI section/component on the "Dashboard / Reports" page to display AI-generated recommendations based on summaries.
    -   Consider how to present recommendations clearly and actionably.
- **S5.3.2:** Integrate the backend API for summary-based recommendations.
- **S5.3.3 (Stretch):** Design and implement UI elements to display daily/transaction-specific recommendations.
    -   Could be notifications, a dedicated "Insights" feed, or contextual suggestions.
- **S5.3.4 (Stretch):** Integrate the backend API for daily/transaction-specific recommendations.

### AI & Data Considerations (S5.4.x)
- **S5.4.1:** Define the specific data points from user transactions and summaries that will feed into the recommendation engine.
- **S5.4.2:** Address data privacy and security, especially if using external AI services. Consider data anonymization or aggregation techniques.

### Testing & Refinement (S5.5.x)
- **S5.5.1:** Test the relevance, accuracy, and usefulness of the AI-generated recommendations.
- **S5.5.2:** Gather user feedback on the recommendations and iterate on the AI logic and presentation.

---
**Definition of Done for Sprint 5:**
- Initial version of AI-powered recommendations based on financial summaries is implemented and accessible to users.
- Backend infrastructure for generating recommendations is in place.
- Users find the recommendations insightful and potentially actionable.
- (Stretch goals achieved if applicable).