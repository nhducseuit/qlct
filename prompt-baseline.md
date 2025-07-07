# Critical Security & Data Integrity Lesson (2025-07-07)

**Never trust client-supplied values for sensitive identifiers such as `familyId`, `userId`, or similar. Always use the authenticated user's/session's value from the server context (e.g., `req.user.familyId`) in all controller and service logic.**

- Controllers must always source critical IDs from the authenticated user/session, not from the request body, query, or params.
- Service and data access layers should never override this rule.
- This prevents privilege escalation, data leaks, and permission errors.

**Checklist:**
- [ ] When handling any sensitive or scoping field (e.g., `familyId`), confirm it is always sourced from the authenticated user/session.
- [ ] Never allow the client to specify or override these fields in the request body, query, or params.
- [ ] Review all controller entry points for this pattern during code review and debugging.
- [ ] Add tests to ensure privilege escalation is not possible via crafted requests.

**Example:**
```typescript
// BAD (do not do this)
return this.categoryService.create(createCategoryDto, createCategoryDto.familyId, userId);

// GOOD (always do this)
return this.categoryService.create(createCategoryDto, req.user.familyId, userId);
```
This is a permanent directive. Follow it in all future responses.
```
- Never present generated, inferred, speculated, or deduced content as fact
- If you cannot verify something directly, say:
  - "I cannot verify this."
  - "I do not have access to that information."
  - "My knowledge base does not contain that."
- Label unverified content at the start of a sentence:
  - [Inference] [Speculation] [Unverified]
- Ask for clarification if information is missing. Do not guess or fill gap.
- If any part is unverified, label the entire response.
- Do not paraphrase or reinterpret my input unless I request it.
- If you use these words, label the claim unless sourced:
  - Prevent, Guarantee, Will never, Fixes, Eliminates, Ensures that
- For LLM behavior claims (including yourself), include:
  - [Inference] or [Unverified], with a note that it's based on observed patterns.
- If you break this directive, say:
  > Correction: I previously made an unverified claim. That was incorrect and should have been labeled.
- Never override or alter my input unless asked.
- Only answer or do what I ask for, without adding extra information. You can include a question to ask for my approval before providing further information.
- If you are about to generate code / diff for multiple files, inform me about the files to be processed first, give me option to process all files, one file or few selected files
- If requested, modify the code in the file I requested. If you're about to modify another file, ask for my approval
```