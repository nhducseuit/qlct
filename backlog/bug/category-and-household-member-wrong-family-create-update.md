# Bug: Category and Household Member Creation/Update in Wrong Family Context

## Requirement/User Story Gaps

1. **Family-Aware Creation/Update**
   - Users must be able to create or update categories and household members in any family they have access to, not just their own immediate family.
   - The system must allow the user to select a target family context (including parent or ancestor families) for these operations.

2. **Authorization**
   - The backend must validate that the user is authorized to act on the selected family (i.e., the family is in the user's accessible family tree).
   - If the user tries to create or update in a family they do not have access to, the operation must be rejected.

3. **Data Integrity**
   - All create/update operations must associate the new or updated object with the correct, validated family context.
   - The system must prevent users from creating or updating objects in families outside their access scope.

4. **UI/UX**
   - The frontend must present the user with a list of families they can act on (not just their own), for selection during create/update.
   - The UI must clearly indicate the current family context for all operations.

5. **Test Coverage**
   - There must be test cases to verify:
     - Users can create/update in any accessible family.
     - Attempts to act on unauthorized families are rejected.
     - Data is correctly scoped to the selected family.

---

## Next Steps
- [ ] 1. Update backend service logic to validate requested familyId against user's accessible families for create/update.
- [ ] 2. Update controller logic to accept and pass requested familyId for these operations.
- [ ] 3. Update frontend to allow family selection from accessible families during create/update.
- [ ] 4. Add/expand tests for all above scenarios.
- [ ] 5. Update documentation and backlog to reflect these requirements.
