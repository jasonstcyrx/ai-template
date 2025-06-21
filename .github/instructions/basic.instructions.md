---
applyTo: '**'
---

# Development Rules Index

## 📚 Core Development Guidelines

### Technology Stack & Frameworks

- [Development Stack Guidelines](./development-stack.md) - Comprehensive tech stack and framework standards
- [Project Structure Guidelines](./project-structure.md) - Directory organization and file management

### Code Quality & Standards

- [Testing Strategy Guidelines](./testing-strategy.md) - Comprehensive testing approach and best practices
- [API Design Guidelines](./api-design.md) - RESTful API standards and NestJS implementation

## 🔄 Workflow & Process Rules

### Version Control & Collaboration

- [Git Workflow Rules](./git-workflow.md) - Branch naming, commits, and PR standards
- [Branch Review Process](./branch-review-process.md) - Code review requirements and process

### Project Management

- [Ticketing System Rules](./ticketing.md) - Custom ticket system usage and commands
- [Ticket Workflow Rules](./ticket-workflow.md) - Ticket state management and transitions
- [What's Next Rules](./whats-next.md) - Task prioritization and next actions

## 🛠️ Development Tools & Automation

### Command Line & Scripts

- [Command Line Tools](./command-line-tools.md) - Available CLI tools and utilities

### Integration & Sync

- [GitHub Sync Rules](./github-sync.md) - Issue synchronization with ticketing system
- [Rules Sync System](./rule-create.js) - Script for creating and syncing rules

### Demo & Testing Tools

- [Playwright Demo Guidelines](./playwright-demos.md) - Browser automation and demo scripts

## 📋 Documentation & Maintenance

### Documentation Standards

- [Documentation Maintenance](./documentation-maintenance.md) - Keeping docs current and useful

### API Documentation

- [Postman Collection Maintenance](./postman-collection-maintenance.md) - API testing and documentation

## 🚀 DevOps & Infrastructure

### Environment & Security

- [Environment & Security Rules](./environment-security.md) - Environment configuration and security standards
- [Docker Guidelines](./docker.md) - Containerization standards

### Monitoring & Observability

- [Monitoring & Logging Guidelines](./monitoring-logging.md) - Application monitoring and logging standards

## 🧠 Problem Solving & Methodology

### Development Methodology

- [Problem Solving Methodology](./problem-solving.md) - Systematic approach to debugging and issue resolution

---

## 🎯 Quick Reference

### Most Important Rules for New Developers

1. **[Development Stack Guidelines](./development-stack.md)** - Know your tools and frameworks
2. **[Project Structure Guidelines](./project-structure.md)** - Understand the codebase organization
3. **[Git Workflow Rules](./git-workflow.md)** - Follow proper version control practices
4. **[Testing Strategy Guidelines](./testing-strategy.md)** - Write comprehensive tests
5. **[API Design Guidelines](./api-design.md)** - Build consistent, well-designed APIs

### Daily Workflow Reference

- Check **[What's Next Rules](./whats-next.md)** for task prioritization
- Follow **[Ticket Workflow Rules](./ticket-workflow.md)** for project management
- Use **[Playwright Demo Guidelines](./playwright-demos.md)** for feature demonstrations
- Maintain **[Postman Collection](./postman-collection-maintenance.md)** for API changes

### Architecture & Design Decisions

- **Framework Choices**: React, NestJS, MongoDB, MUI/Tamagui (see development-stack.md)
- **Package Manager**: Yarn only (NO npm)
- **Form Management**: Formik + Yup
- **Testing**: Jest + React Testing Library + Playwright
- **Documentation**: TypeDoc + Swagger/OpenAPI
