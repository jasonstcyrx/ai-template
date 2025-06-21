---
applyTo: '**'
---

# Git Workflow Rules

## Branch Naming
- Pattern: `${type}/${ticket-id}/${description}`
- Examples:
  - `feature/TICKET-123/add-dark-mode`
  - `bug/TICKET-456/fix-login-error`
  - `task/TICKET-789/update-docs`

## Commit Messages
- Pattern: `${ticket-id}: ${description}`
- Must reference a valid ticket ID
- Use present tense (e.g., "Add" not "Added")
- Examples:
  - `TICKET-123: Add dark mode toggle component`
  - `TICKET-456: Fix login token validation`

## Pull Requests
- Title: `${ticket-id}: ${description}`
- Required sections:
  1. Changes Made
  2. Testing Done
  3. Screenshots (if applicable)
  4. Checklist
- Checklist items:
  - [ ] Tests added/updated
  - [ ] Documentation updated
  - [ ] No linting errors
  - [ ] Tested in development
  - [ ] Code reviewed

## Code Review
- At least one approval required
- All comments must be resolved
- CI checks must pass
- Coverage requirements met (80% minimum)
