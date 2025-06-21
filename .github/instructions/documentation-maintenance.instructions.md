---
applyTo: '**'
---

# Documentation Maintenance Rule

## Overview

This rule establishes the critical practice of maintaining up-to-date documentation throughout the development process.

## Core Rule: Always Update Documentation After Work

## Core Rule:

### When to Update Documentation

After completing ANY of the following work:

- Code changes or new features
- API modifications or additions
- Database schema changes
- Configuration updates
- Architecture decisions
- Bug fixes that affect behavior
- Performance optimizations
- Security implementations
- New integrations or dependencies
- Process changes or workflows

### Required Documentation Updates

#### 1. Update Central README

- Add new features to `docs/README.md` navigation
- Link to new documentation files
- Update quick links if external resources changed
- Verify all links are working

#### 2. Update Relevant Technical Docs

- **API changes**: Update `docs/api/` documentation
- **Database changes**: Update `docs/ERD.md` and schema docs
- **Frontend changes**: Update `docs/frontend/` guides
- **Backend changes**: Update `docs/backend/` guides
- **Infrastructure changes**: Update `docs/infrastructure/` guides

#### 3. Update Tech Stack Documentation

- Add new technologies to `docs/TECH_STACK.md`
- Update version numbers
- Add new best practices
- Update implementation details

#### 4. Update Code Comments

- Add JSDoc comments for new functions
- Update existing comments if behavior changed
- Document complex logic or algorithms
- Add TODO comments for future work

#### 5. Update README Files

- Project root README for setup changes
- Component READMEs for new features
- Service READMEs for API changes

### Documentation Quality Standards

#### Content Requirements

- **Clear and Concise**: Use simple language, avoid jargon
- **Complete**: Cover all aspects of the feature/change
- **Current**: Remove outdated information
- **Linked**: Connect related documentation
- **Examples**: Include code examples where relevant
- **Screenshots**: Add visual aids for UI changes

#### Format Requirements

- Use Markdown formatting consistently
- Follow established documentation structure
- Include proper headers and navigation
- Use code blocks with syntax highlighting
- Add tables for structured data

### Documentation Review Process

#### Before Submitting Work

1. **Self-Review**: Check all affected documentation
2. **Link Verification**: Ensure all links work
3. **Completeness Check**: Verify nothing is missing
4. **Accuracy Validation**: Confirm technical accuracy

#### Documentation Checklist

- [ ] Updated central README navigation
- [ ] Updated relevant technical documentation
- [ ] Added/updated code comments
- [ ] Verified all links work
- [ ] Added examples where needed
- [ ] Updated version numbers if applicable
- [ ] Removed outdated information
- [ ] Added new files to git tracking

### Special Cases

#### Emergency Fixes

- Document the fix immediately
- Create follow-up ticket for comprehensive docs
- Add temporary notes in relevant files

#### Experimental Features

- Document in separate experimental section
- Mark as "Beta" or "Experimental"
- Include stability warnings

#### Deprecated Features

- Add deprecation warnings
- Document migration path
- Set removal timeline

### Automation Support

#### Git Hooks

- Pre-commit: Check for documentation changes
- Post-commit: Remind about documentation updates

#### CI/CD Integration

- Documentation build validation
- Link checking
- Spelling and grammar checks

### Documentation Debt

#### Identifying Documentation Debt

- Outdated screenshots
- Missing API documentation
- Broken links
- Incomplete feature documentation
- Missing setup instructions

#### Addressing Documentation Debt

- Create tickets for major documentation gaps
- Fix small issues immediately
- Regular documentation review sessions
- Quarterly documentation audits

## Enforcement

### Code Review Requirements

- Reviewers must verify documentation updates
- No merge without documentation changes
- Documentation updates required for API changes

### Team Accountability

- Documentation updates tracked in tickets
- Regular documentation health checks
- Team discussions about documentation quality

### Tools and Resources

- Use MUI documentation for component guidance
- Reference Tamagui docs for mobile components
- Follow TypeScript documentation standards
- Maintain consistency with established patterns

## Benefits of Following This Rule

### Developer Experience

- Faster onboarding for new team members
- Reduced context switching for existing developers
- Clear understanding of system behavior
- Easier debugging and troubleshooting

### Product Quality

- Better user experience through clear documentation
- Reduced support requests
- Improved feature adoption
- Higher code maintainability

### Business Value

- Faster feature development
- Reduced technical debt
- Better knowledge retention
- Improved team collaboration

## Remember: Documentation is Code

Treat documentation with the same care and attention as code. It's not an afterthought—it's an integral part of the development process that ensures the long-term success and maintainability of the project.
