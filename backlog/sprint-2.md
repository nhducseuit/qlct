# Sprint 2: Multi-User Synchronization & Cloud Backend

**Sprint Goal:** To transition the application from a local prototype to a full-stack, cloud-ready solution with real-time data synchronization between clients.

---

## Key Features & User Stories

- **As a user,** I want my data to be saved to a central database so I can access it from different devices.
- **As a user,** I want to see changes made by other users in real-time without needing to refresh the page.

---

## Technical Backlog

### Backend

- [x] **Architecture:** Set up NestJS project with Prisma ORM.
- [x] **Database:** Define the complete data model in `schema.prisma` and configure a PostgreSQL database.
- [x] **APIs:** Implement full CRUD (Create, Read, Update, Delete) API endpoints for `Transaction`, `Category`, and `HouseholdMember`.
- [x] **Real-Time:** Implement a `NotificationsGateway` using WebSockets (Socket.IO) to broadcast data changes to connected clients.
- [x] **Integration:** Integrate the WebSocket gateway into the CRUD services to emit events upon data modification.

### Frontend

- [x] **API Integration:** Refactor all Pinia stores (`transactionStore`, `categoryStore`, `householdMemberStore`) to fetch and mutate data via the new backend APIs instead of local state.
- [x] **Real-Time:** Implement `socketService.ts` to manage the WebSocket connection.
- [x] **State Sync:** Update Pinia stores to listen for WebSocket events (`..._updated`) and update their state accordingly, ensuring the UI reflects real-time changes.

### DevOps

- [x] **Containerization:** Create `Dockerfile`s for both frontend and backend, and a `docker-compose.yml` file to orchestrate the services (backend, frontend, database).
- [x] **Development Mode:** Implement a `dev-user` bypass for authentication to simplify development.