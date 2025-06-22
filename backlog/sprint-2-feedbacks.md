# Sprint 2: UAT Feedback & Resolutions

## Objective: Address stability and usability issues identified after the initial backend and real-time sync implementation.

---

### FB2.1: WebSocket Connection Stability
- **Issue:** The WebSocket connection was unstable, frequently dropping or listeners becoming detached, especially after page navigation.
- **Analysis:** The root cause was traced to incorrect listener cleanup logic in Pinia stores and `authStore` behavior in development mode.
- **Resolution:** Refined `authStore` logic and removed problematic `onUnmounted` hooks from stores to ensure a persistent and stable WebSocket connection.

### FB2.2: Quick Entry Form Usability
- **Issue:** In `QuickEntryForm.vue`, the date field would reset after a successful transaction submission, requiring the user to re-select it for the next entry.
- **Resolution:** Corrected the state management within the component to persist the date field's value across submissions.

### FB2.3: Mobile UI for Pinned Categories
- **Issue:** The "Chọn nhanh" (pinned categories) section in the `QuickEntryForm` was difficult to use on mobile devices due to its small size.
- **Resolution:** Increased the component's height and adjusted text size to improve usability and touch-friendliness on smaller screens.

### FB2.4: Development Mode Authentication Consistency
- **Issue:** The `dev-user` authentication bypass was not applied consistently between standard HTTP API requests and WebSocket connections.
- **Resolution:** Modified the backend's `JwtAuthGuard` to ensure the `dev-user` is consistently recognized for all types of requests in development mode, simplifying the development workflow.

### FB2.5: Seeding for Default Data
- **Issue:** The application lacked default data, making initial setup for testing tedious.
- **Resolution:** Added a seed script for `PredefinedSplitRatio` to provide default sharing options on a fresh database setup.