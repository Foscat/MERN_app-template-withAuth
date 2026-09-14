# Scaling and operations

## Deployment contract

Run one Node application process per container or supervised process. Add replicas behind a load balancer to use multiple cores or machines; increasing a single process's CPU allocation does not make synchronous JavaScript execute on multiple cores. Tune memory, bounded connection pools, and workload limits before adding resources blindly.

Production requires explicit secrets, MongoDB URI, and `DEPLOYMENT_MODE`. Set `DEPLOYMENT_MODE=multi`, `RATE_LIMIT_STORE=redis`, and a shared Redis URL and namespace for every replica. Memory quotas are supported only for an explicitly single-instance deployment. Never silently replace an unavailable shared store with independent local counters.

All replicas need consistent signing keys, token metadata, and public configuration. Device sessions live in MongoDB; sticky sessions are not required. Use a managed/redundant MongoDB deployment and Redis/Valkey service with appropriate authentication, TLS, backups, monitoring, and network restrictions. The supplied Compose file is local-only.

Configure trusted proxy hops to match the actual ingress topology; do not trust arbitrary forwarded IP headers. Terminate TLS at a trusted ingress and restrict direct application access. Review HTTP timeouts against load-balancer timeouts.

## Health and shutdown

- `/api/health/live`: process liveness. It does not depend on MongoDB or Redis.
- `/api/health/ready`: MongoDB connection state, selected shared-store responsiveness, and draining state.
- `/api/health`: compatibility alias for readiness.

Readiness returns 503 when unavailable and is exempt from application quotas. Configure the load balancer to stop routing to unready instances. Send SIGTERM, allow the application to drain, and set the supervisor's termination allowance longer than `SHUTDOWN_TIMEOUT_MS` plus infrastructure cleanup allowance.

Defaults: MongoDB pool maximum 10, dependency and query budgets 5 seconds, Redis commands 2 seconds, HTTP request timeout 30 seconds, header timeout 15 seconds, keep-alive timeout 5 seconds, and drain budget 15 seconds. Environment overrides are validated rather than silently clamped.

Omit optional settings to accept defaults; explicitly empty or malformed values fail validation. Token lifetimes require positive `s`, `m`, `h`, or `d` units and cannot exceed 365 days. Review shorter product-appropriate lifetimes before production.

Compute connection budgets across the fleet: application replicas multiplied by pool size, plus monitoring, administrative tools, deployment overlap, and other consumers. Increase pool sizes only after observing saturation. CPU-heavy transformations belong in bounded worker processes or a job system once your product needs them; that system is not included in this lean baseline.

## Sessions and compatibility

This version requires one fresh sign-in for existing users. Accounts and application data remain intact. Perform a coordinated cutover: mixed old/new authentication servers must not share traffic. A rollback may require another sign-in; do not re-enable legacy tokens as a compatibility shortcut.

Each login creates an independent session. Refresh credentials rotate atomically; simultaneous requests receive a brief retryable 409 conflict without cookie deletion. Confirmed reuse of an older credential revokes that device. Password changes invalidate every existing session through the account version; deleted accounts cannot authorize; current database roles govern access immediately. TTL indexes clean up expired records, but expiry is enforced during authorization even before cleanup.

Run `npm run db:indexes` during controlled deployment preparation. It creates required indexes without dropping existing ones. Production does not rely on automatic index creation during every application startup. Check duplicate data and index build impact before upgrading a populated database.

## Pagination and caching

User listing retains bounded `page`/`limit` pagination with a maximum offset of 10000. For scalable traversal, send `cursor=` on the first request and use the returned `pagination.nextCursor` on subsequent requests. Cursor pages use stable creation-time/identifier ordering and do not force a total count. Keep filters unchanged while following a cursor.

Hashed assets can be cached immutably. HTML is revalidated. API responses and health probes are not cached. Public HTML can be served through a CDN, but deployment routing must preserve true 404 responses and private-page indexing policy.

## Measurements and operational signals

`npm run load:local` starts a separate local application process and reports readiness-probe throughput, latency percentiles, errors, process memory, event-loop delay, and connection-event deltas at 10, 50, and 100 concurrent requests. These results describe that probe workload only—not login, CRUD, production capacity, or a service-level objective. Repeat representative product workloads on provider staging before choosing replica counts.

Monitor request errors and latency, readiness transitions, process memory/restarts, event-loop lag, database pool pressure, slow queries, Redis availability, and quota rejections. Request IDs correlate client-safe errors with operational records. Optional console debugging tracers stay commented out; never enable credential or sensitive-payload logging.

Define backup retention and recovery objectives for your product. Rehearse database restoration into an isolated environment, verify account/data integrity, and document provider failover before production promotion. A local build or unit test is not proof of deployment availability or disaster recovery.
