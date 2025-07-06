# The following items were moved from Sprint 5:
- [ ] Admin capabilities (editing members of their own and nested families) (moved from Sprint 5)
- [ ] Default to assigning new members to default family (if/when adding is enabled) (moved from Sprint 5)
- [ ] Access control/escalation for household members (moved from Sprint 5)
# Sprint 7: Multi-User Onboarding & Permissions

**Sprint Goal:** Expand the application to support multiple users by implementing invitation and role management functionalities.

---

## Key Features & User Stories

- **As a family administrator,** I want to invite other members to join my "Big Family" and assign them to their respective "Small Family" units.
- **As a new user,** I want to accept an invitation and register an account that is automatically linked to the correct family structure.

---

## Technical Backlog

- [ ] **UI - User Management:** Create a new page or section for inviting users via email.
- [ ] **Backend - Invitation System:** Implement API endpoints and logic to generate, send, and process user invitations.
- [ ] **Backend - RBAC:** Implement backend guards and logic for `SmallFamilyAdmin` and `BigFamilyAdmin` roles to control access to administrative features.
- [ ] **Frontend - Auth Flow:** Update the registration process to handle invitation tokens.