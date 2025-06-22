# Sprint 5: Foundational Data Model Refactor

**Sprint Goal:** Implement the foundational backend data model to support a "Big Family" / "Small Family" hierarchy. This is a critical infrastructure sprint that enables all future multi-level reporting and management features.

---

## Key Features & User Stories

- **As the family administrator,** I need to structure our finances into a "Big Family" and my own "Small Family" so that I can separate shared expenses from my personal ones.

---

## Technical Backlog

- [ ] **Schema:** Define `BigFamily` and `SmallFamily` models in `schema.prisma`.
- [ ] **Schema:** Refactor `User`, `Category`, `Transaction`, `HouseholdMember`, `Settlement`, and `PredefinedSplitRatio` to belong to a `SmallFamily`.
- [ ] **Schema:** Introduce `BigFamilyCategoryTemplate` and `SmallFamilyCategoryConfig` models to handle shared categories with per-family budget limits.
- [ ] **Migrations:** Generate and apply the new database migrations.
- [ ] **Seed Data:** Update `seed.ts` to create a default `BigFamily` and `SmallFamily`, and associate the test user with them.
- [ ] **Authorization:** Update `AuthService` to include `smallFamilyId` and `bigFamilyId` in the JWT payload.
- [ ] **Service Layer:** Refactor all backend services (`create`, `findAll`, etc.) to enforce data ownership and filtering based on the `smallFamilyId` from the JWT.