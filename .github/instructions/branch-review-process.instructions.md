---
applyTo: '**'
---

# Branch Review Process

## Overview
All code changes must go through a thorough review process before being merged into the main branch. This ensures code quality, consistency, and knowledge sharing across the team.

## Review Requirements

### Mandatory Review
- **All pull requests** require at least one approval from a qualified reviewer
- **No self-approvals** are permitted
- **Direct pushes to main branch** are strictly prohibited

### Reviewer Qualifications
- Must be a team member with appropriate permissions
- Should have knowledge of the codebase and technologies used
- Must not be the author of the pull request

## Review Process

### 1. Pull Request Creation
- Create a pull request with a clear, descriptive title
- Provide a detailed description of changes
- Include any relevant issue numbers or context
- Add appropriate labels and assignees

### 2. Code Review Checklist
Reviewers must verify:
- [ ] Code follows project coding standards
- [ ] No obvious bugs or logical errors
- [ ] Appropriate error handling is implemented
- [ ] Tests are included and passing
- [ ] Documentation is updated if needed
- [ ] No security vulnerabilities introduced
- [ ] Performance implications considered

### 3. Review Timeline
- **Standard reviews**: Respond within 24 hours
- **Urgent fixes**: Respond within 4 hours (use appropriate labels)
- **Large changes**: May require multiple reviewers

### 4. Approval Process
- **LGTM (Looks Good To Me)** approval required
- Address all review comments before merging
- Resolve any merge conflicts
- Ensure CI/CD pipeline passes

## Merge Guidelines

### Merge Strategy
- Use **squash and merge** for feature branches
- Use **rebase and merge** for hotfixes
- Maintain clean commit history

### Post-Merge
- Delete feature branches after successful merge
- Update any related documentation
- Notify stakeholders of significant changes

## Escalation
If a review is blocked or requires additional input:
1. Tag appropriate team leads
2. Schedule a code review meeting if needed
3. Document decisions and rationale

## Compliance
- All team members must follow this process
- Exceptions require approval from team lead
- Regular audits ensure process adherence
