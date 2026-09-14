# Security Policy

## Supported Version

Security fixes are applied to the latest revision on the default branch. Forks should regularly synchronize dependency and application-security updates.

## Reporting a Vulnerability

Please use GitHub's private vulnerability reporting feature for this repository. Do not disclose suspected vulnerabilities in a public issue.

Include the affected route or component, reproduction steps, expected impact, and any suggested mitigation. Avoid including real credentials, access tokens, personal data, or production database records.

## Security Defaults

The template provides:

- allowlisted CORS origins and bounded request bodies;
- Helmet response headers and API rate limits;
- strict JWT algorithm, issuer, audience, and token-purpose validation;
- rotating, server-invalidated refresh sessions in `HttpOnly` cookies;
- in-memory access tokens rather than persistent browser token storage;
- owner/admin authorization for user resources;
- input allowlists, schema validation, and private-field redaction;
- automated lint, test, build, documentation-drift, and production-audit checks.

Deployers remain responsible for unique secrets, TLS, database network policy, backups, monitoring, and incident response.
