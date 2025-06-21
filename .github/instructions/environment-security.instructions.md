---
applyTo: '**'
---

# Environment and Security Rules

## Environment Variables
- Never commit actual .env files
- Maintain .env.example with all required variables
- Use descriptive names: `SERVICE_SPECIFIC_VARIABLE`
- Document all variables in README
- Categories:
  - API Keys: `*_API_KEY`
  - Secrets: `*_SECRET`
  - Endpoints: `*_URL`, `*_ENDPOINT`
  - Toggles: `ENABLE_*`, `DISABLE_*`

## Security Standards
- Secrets Management:
  - Use environment variables for secrets
  - Never log sensitive data
  - Rotate keys regularly
  - Use secret management service in production
- Authentication:
  - Implement rate limiting
  - Use secure session management
  - Enable MFA where possible
  - Follow OAuth2 best practices
- Data Protection:
  - Encrypt sensitive data at rest
  - Use HTTPS for all API calls
  - Implement proper CORS policies
  - Regular security audits

## Docker Guidelines
- Use specific version tags
- Multi-stage builds for production
- Non-root user in containers
- Health checks for all services
- Resource limits defined
- Security scanning in CI/CD
