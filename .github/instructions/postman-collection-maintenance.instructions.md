---
applyTo: '**'
---

# Postman Collection Maintenance Rule

## Overview
This rule establishes the critical practice of maintaining up-to-date Postman collections that accurately reflect the current API state, ensuring reliable testing and documentation for all stakeholders.

## Core Rule: Always Update Postman Collections After API Changes

### When to Update Postman Collections
After completing ANY of the following work:
- New API endpoints added
- Existing endpoint modifications (URL, method, parameters)
- Request/response schema changes
- Authentication changes
- New query parameters or headers
- Status code changes
- Error response modifications
- API versioning updates
- Environment variable changes
- New API features or functionality

### Required Collection Updates

#### 1. Endpoint Management
- **New Endpoints**: Add complete request configuration
- **Modified Endpoints**: Update URL, method, parameters, headers
- **Deprecated Endpoints**: Mark with deprecation notice and removal date
- **Removed Endpoints**: Delete from collection after grace period

#### 2. Request Configuration
- **Headers**: Update required/optional headers
- **Authentication**: Update auth methods and tokens
- **Parameters**: Add/modify query params, path variables, form data
- **Request Body**: Update JSON schemas, form data, raw content
- **Pre-request Scripts**: Update dynamic variable generation

#### 3. Response Documentation
- **Success Responses**: Update example responses for all success scenarios
- **Error Responses**: Document all possible error states and codes
- **Response Schema**: Keep JSON schemas current with actual API responses
- **Status Codes**: Document all returned HTTP status codes

#### 4. Environment Variables
- **Development**: Update local development environment variables
- **Staging**: Maintain staging environment configuration
- **Production**: Keep production environment variables (non-sensitive)
- **Base URLs**: Update API base URLs for different environments

### Collection Organization Standards

#### Folder Structure
```
📁 Haulr API Collection
├── 📁 Authentication
│   ├── Register
│   ├── Login
│   ├── Refresh Token
│   └── Logout
├── 📁 Users
│   ├── Get Profile
│   ├── Update Profile
│   └── Delete User
├── 📁 Orders
│   ├── Create Order
│   ├── Get Orders
│   ├── Update Order Status
│   └── Cancel Order
├── 📁 Products
├── 📁 WebSocket Testing
│   ├── Connection Setup
│   └── Event Testing
└── 📁 Admin
```

#### Naming Conventions
- **Collections**: `[Project Name] API v[Version]`
- **Folders**: Use clear, functional groupings
- **Requests**: `[HTTP Method] [Resource] - [Action]`
- **Examples**: `POST User - Register`, `GET Orders - List All`

#### Request Documentation
- **Description**: Clear explanation of endpoint purpose
- **Parameters**: Document all parameters with examples
- **Headers**: List required and optional headers
- **Body**: Provide example request bodies
- **Responses**: Include example success and error responses

### Testing and Validation

#### Request Testing
- **Pre-request Scripts**: Generate dynamic data (timestamps, UUIDs)
- **Test Scripts**: Validate response status, schema, required fields
- **Environment Setup**: Automatic token management and variable setting
- **Data Cleanup**: Scripts to clean up test data after requests

#### Collection Testing
```javascript
// Example test script for all requests
pm.test("Status code is success", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201, 204]);
});

pm.test("Response time is acceptable", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test("Response has required fields", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('data');
});
```

#### Automated Testing
- **Collection Runner**: Regular automated runs against staging
- **Newman Integration**: CI/CD pipeline integration
- **Monitoring**: Set up monitoring for critical API workflows

### Environment Management

#### Environment Variables
```json
{
  "api_base_url": "{{base_url}}/api",
  "auth_token": "{{jwt_token}}",
  "user_id": "{{current_user_id}}",
  "environment": "development"
}
```

#### Dynamic Variables
- Use `{{$guid}}` for unique identifiers
- Use `{{$timestamp}}` for time-based data
- Use `{{$randomInt}}` for random numbers
- Store auth tokens automatically in environment

#### Security Considerations
- **Never commit**: Production credentials or sensitive tokens
- **Use variables**: For all environment-specific values
- **Token management**: Automatic refresh and storage
- **Sensitive data**: Mark as secret in team workspaces

### Version Control and Sharing

#### Collection Export
- **Regular exports**: Weekly exports to version control
- **JSON format**: Export as Collection v2.1 format
- **File naming**: `postman-collection-v[version]-[date].json`
- **Storage location**: `docs/api/postman/` directory

#### Team Collaboration
- **Postman Workspace**: Use team workspace for collaboration
- **Access control**: Manage team member permissions
- **Change tracking**: Document collection changes in git commits
- **Review process**: Team review for major collection changes

### Integration with Development Workflow

#### Git Integration
```bash
# Export collection before committing API changes
npm run export-postman

# Commit collection with API changes
git add docs/api/postman/
git commit -m "API: Add new user endpoints and update Postman collection"
```

#### CI/CD Integration
```yaml
# Example GitHub Actions workflow
- name: Test API with Postman
  run: |
    newman run docs/api/postman/collection.json \
    --environment docs/api/postman/environment.json \
    --reporters cli,junit \
    --reporter-junit-export results.xml
```

#### Documentation Sync
- **API Docs**: Generate documentation from collection
- **README updates**: Update API endpoint lists
- **Status page**: Reflect API health from collection tests

### Maintenance Checklist

#### Before API Deployment
- [ ] All new endpoints added to collection
- [ ] Existing endpoints updated for changes
- [ ] Request/response examples updated
- [ ] Test scripts validated
- [ ] Environment variables updated
- [ ] Collection exported to version control
- [ ] Team notified of changes

#### Weekly Maintenance
- [ ] Run full collection against staging
- [ ] Verify all requests work correctly
- [ ] Update any deprecated endpoints
- [ ] Review and clean up test data
- [ ] Export latest collection version
- [ ] Update documentation links

#### Monthly Review
- [ ] Archive old/unused requests
- [ ] Reorganize folder structure if needed
- [ ] Update collection description
- [ ] Review and optimize test scripts
- [ ] Validate environment configurations
- [ ] Team feedback on collection usability

### Automation Tools

#### Collection Management Scripts
```javascript
// Auto-generate collection from OpenAPI spec
npm run generate-postman-from-swagger

// Validate collection structure
npm run validate-postman-collection

// Export collection with version
npm run export-postman --version=1.2.0
```

#### Monitoring Integration
- **Postman Monitor**: Set up monitors for critical workflows
- **Slack Integration**: Notifications for failed API tests
- **Dashboard**: Collection health metrics and trends

### Quality Standards

#### Request Quality
- **Complete configuration**: All required fields populated
- **Realistic examples**: Use production-like test data
- **Error handling**: Cover all error scenarios
- **Performance**: Include response time validations

#### Documentation Quality
- **Clear descriptions**: Easy to understand request purpose
- **Complete examples**: Request and response examples for all scenarios
- **Up-to-date**: Reflect current API behavior
- **Searchable**: Use consistent naming and tagging

### Troubleshooting

#### Common Issues
- **Outdated tokens**: Implement automatic token refresh
- **Environment mismatch**: Validate environment variables
- **Schema changes**: Regular validation against actual responses
- **Missing endpoints**: Automated detection of new API routes

#### Resolution Steps
1. **Identify issue**: Check collection runner results
2. **Locate endpoint**: Find affected request in collection
3. **Update configuration**: Modify request parameters/headers
4. **Test changes**: Validate fix with collection runner
5. **Document**: Update request description and examples
6. **Export**: Save updated collection to version control

## Enforcement

### Code Review Requirements
- API changes require corresponding collection updates
- Collection changes must be reviewed by API team
- No API deployment without updated collection
- Collection export must be included in PR

### Team Accountability
- Collection maintenance assigned to API developers
- Regular collection health checks
- Team training on Postman best practices
- Collection quality metrics tracked

### Integration Requirements
- Collection tests run in CI/CD pipeline
- Failed collection tests block deployment
- Collection export automated in release process
- API documentation generated from collection

## Benefits of Following This Rule

### Developer Experience
- Faster API testing and debugging
- Consistent testing across team members
- Reduced manual testing effort
- Clear API usage examples

### Product Quality
- Comprehensive API testing coverage
- Early detection of API regressions
- Consistent API behavior validation
- Better error handling testing

### Business Value
- Faster development cycles
- Reduced API-related bugs in production
- Better stakeholder confidence in API reliability
- Improved developer onboarding experience

## Remember: Collections are Living Documentation
Treat Postman collections as executable documentation that evolves with your API. They should always represent the current, accurate state of your API and serve as the single source of truth for API testing and usage examples.
