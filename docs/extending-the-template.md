# Extend the baseline consistently

## Local startup

Use Node 22.19 or later within Node 22.x. Run `npm ci` and `npm ci --prefix client`. If MongoDB is not already running, start the local services with `docker compose up -d`. Ports are bound to loopback; these services are development conveniences, not production infrastructure.

Run `npm run doctor` to inspect prerequisites, then `npm run dev`. A local `.env` is optional because development defaults exist. Copy `.env.example` when customizing. **Replace development credentials, origins, infrastructure addresses, namespace identifiers, and administrator settings before production.** Never rename production to an unrecognized environment to bypass validation.

If port 27017 is occupied by an existing MongoDB installation, use that installation with an appropriate local database URI or change the Compose port mapping. Do not stop an unrelated service automatically.

## Module ownership

Each component, API module, and backend module owns its source and colocated test in a same-named folder. Its parent contains an explicit `index.js` barrel. Internal sibling imports use the sibling module path, not the same group's barrel, to avoid circular dependencies. Public consumers use the parent barrel.

The structure checks discover modules rather than maintaining a list of allowed feature names. They check source/test colocation and export reachability. Keep application entry points and shared configuration small and explicit.

```sh
npm run scaffold -- component InventoryCard
npm run scaffold -- page Inventory
npm run scaffold -- api inventory
npm run scaffold -- server-module inventory
```

The generator refuses existing targets and unsafe names. A generated page is registered but is non-indexable and hidden from navigation by default. API and server skeletons are intentionally incomplete extension points: replace their pending acceptance tests and implement the domain behavior. They are not automatically registered backend endpoints.

## Example: add an inventory feature

1. Define one acceptance test for the intended behavior, such as an authorized member reading their own inventory. Include a different member's forbidden case.
2. Add the model and indexes under `app/models`. Keep tenant or ownership identifiers explicit. Do not accept model query operators directly from request objects.
3. Add repository operations with allowlisted filters, projections, stable pagination, and query time limits. Treat caller input as data, not a query language.
4. Add a service that validates input and implements ownership/business decisions. Inject its repository and configuration through the composition root. Services do not receive Express request or response objects.
5. Add thin controller adapters and a router. Require authentication and appropriate resource authorization on the server. Mount specific routes before `/:id` routes.
6. Implement the client API wrapper using the shared Axios instance. Keep request/return `console.log` tracers commented out and do not include credentials or sensitive payloads.
7. Build the page from the semantic components and CSS-library hooks. Keep style, color theme, display mode, and layout gap owned by configuration. Do not copy preset CSS into local stylesheets.
8. Export each module, add the route metadata, and update navigation flags deliberately. Frontend access flags are not a replacement for backend authorization.
9. Run the focused changed tests, lint, and formatting. Generate documentation with `npm run docs:generate`, then confirm `npm run docs:check` before publishing.

## Contracts to preserve

- Access tokens remain in memory; refresh cookies are HTTP-only. Use `refreshSession` for restoration rather than implementing a second refresh loop.
- Logout invalidates pending client responses. Do not assign tokens from requests started before a session change.
- Account/session DTOs are allowlists. Never serialize an entire future model and assume today's redaction list remains safe.
- Error payloads preserve `message` and add stable `code` and `requestId` fields. Do not expose stack traces, connection strings, or database errors.
- Authentication failures and infrastructure outages are different. Do not clear valid cookies on transient outages or refresh conflicts.
- New reusable functions need proper JSDoc descriptions, parameter types, return types, and meaningful failure documentation. Put each JSDoc tag on its own line.

## Documentation and verification

Generated references include backend, client, shared JavaScript, and tooling modules. Tests are excluded from public API references but still require documented module headers. JavaScript, JSX, CommonJS, and ES modules are supported; introducing TypeScript requires adding a suitable documentation parser rather than silently skipping it.

Run tests narrowly while developing. Database integration tests use `TEST_MONGODB_URI`; `npm run test:multi-instance` additionally requires `TEST_REDIS_URL` and deliberately fails when real infrastructure is absent. Use dedicated disposable databases and Redis namespaces. Never point verification at production.
