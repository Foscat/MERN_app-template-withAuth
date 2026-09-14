# MERN App Template With Auth

Extensible MERN starter with independent device sessions, role support, protected frontend routes, and a React 18 + Vite client using a configurable semantic UI system.

Start with the [extension and onboarding guide](docs/extending-the-template.md), [scaling and operations guide](docs/scaling-and-operations.md), and [SEO configuration guide](docs/seo-guide.md). Production readiness requires your infrastructure configuration and deployment verification.

## Highlights

- Express API with modular routes, controllers, middleware, and Mongoose models
- JWT access tokens + HTTP-only refresh cookie flow
- Automatic frontend token refresh and session expiry handling
- Protected React routes and dashboard layout scaffolding
- Configurable UI Style Kit presets with a Service Blue + Red theme and browser-native mode by default
- `layout-style-css` structure, `ui-style-kit-css` paint, and `interactive-surface-css` states
- Node 22 runtime contract (`>=22.19.0 <23`)
- JSDoc-first code comments with granular `jsdoc2md` generation and drift checks
- Focused server, client, source-policy, and browser smoke tests in CI

## Tech Stack

- Backend: Node.js, Express, Mongoose, JWT, bcrypt, cookie-parser, cors
- Frontend: React 18, React Router, Vite, Axios, Layout Style CSS, UI Style Kit CSS, Interactive Surface CSS
- Tooling: Nodemon, Concurrently, jsdoc-to-markdown

## Prerequisites

- Node.js `22.19.0` or a newer Node 22 release
- npm `10+`
- MongoDB (local or hosted)

Use the included version files with your version manager:

- `.nvmrc`
- `.node-version`
- `client/.nvmrc`
- `client/.node-version`

## Quick Start

1. Install backend dependencies from the lockfile:
   ```bash
   npm ci
   ```
2. Install frontend dependencies from the lockfile:
   ```bash
   npm ci --prefix client
   ```
3. Start the app in development mode:
   ```bash
   npm run dev
   ```

Backend runs on `http://localhost:3001` and Vite dev server on `http://localhost:5173`.
The development runtime supplies complete starter configuration when `.env` is absent. A local MongoDB service is expected at `mongodb://localhost/mern_app-template-withauth`.

> **Production warning:** The built-in values are for local development only. Before deploying, create `.env` from `.env.example` or configure the hosting provider, then replace the database URL, browser origins, JWT secrets, and any provider-specific settings. Production mode rejects missing secrets and the built-in development signing keys.

## Environment Variables

The root `.env` file is optional for local development. Copy `.env.example` when you want to override a starter value. Runtime validation fails fast in production when secrets are missing, use a development default, are shorter than 32 characters, or are reused.

| Variable                    | Required      | Default                 | Purpose                                       |
| --------------------------- | ------------- | ----------------------- | --------------------------------------------- |
| `NODE_ENV`                  | No            | `development`           | Runtime security and optimization mode        |
| `PORT`                      | No            | `3001`                  | API server port                               |
| `MONGODB_URI`               | In production | local MongoDB URL       | MongoDB connection string                     |
| `CLIENT_ORIGINS`            | No            | `http://localhost:5173` | Comma-separated exact CORS origin allowlist   |
| `TRUST_PROXY`               | No            | `false`                 | Express proxy hops or named proxy setting     |
| `REQUEST_BODY_LIMIT`        | No            | `100kb`                 | JSON and form request-size ceiling            |
| `RATE_LIMIT_STORE`          | No            | `memory`                | `redis` enables distributed request quotas    |
| `RATE_LIMIT_REDIS_URL`      | With Redis    | local Redis URL in dev  | Shared `redis://` or `rediss://` connection   |
| `RATE_LIMIT_REDIS_PREFIX`   | No            | app/environment prefix  | Isolates this deployment's distributed counts |
| `JWT_ACCESS_SECRET`         | In production | development-only key    | Unique 32+ character access signing secret    |
| `JWT_REFRESH_SECRET`        | In production | development-only key    | Different 32+ character refresh secret        |
| `JWT_ISSUER`                | No            | `mern-app-template`     | Required token issuer                         |
| `JWT_AUDIENCE`              | No            | `mern-app-client`       | Required token audience                       |
| `ACCESS_TOKEN_EXPIRES_IN`   | No            | `15m`                   | Access token TTL                              |
| `REFRESH_TOKEN_EXPIRES_IN`  | No            | `7d`                    | Refresh token TTL                             |
| `REFRESH_COOKIE_MAX_AGE_MS` | No            | `604800000`             | Refresh cookie lifetime in milliseconds       |
| `BCRYPT_ROUNDS`             | No            | `12`                    | Bcrypt work factor, bounded between 10 and 15 |
| `ADMIN_EMAIL`               | Command only  | `admin@example.local`   | Existing account to promote                   |
| `ALLOW_ADMIN_PROMOTION`     | Command only  | `false`                 | Explicit guard for the promotion command      |

## Available Scripts

### Root Scripts

| Command                 | Description                                           |
| ----------------------- | ----------------------------------------------------- |
| `npm start`             | Runs the API and Vite development servers             |
| `npm run dev`           | Runs API via Nodemon + Vite dev server concurrently   |
| `npm run start:dev`     | Compatibility alias for `npm run dev`                 |
| `npm run start:prod`    | Runs the production-style Node server                 |
| `npm run build`         | Builds the Vite client to `client/dist`               |
| `npm run docs:generate` | Rebuilds granular backend and client JSDoc references |
| `npm run docs:check`    | Fails when generated references are missing or stale  |
| `npm run docs:test`     | Runs the focused documentation-generator tests        |
| `npm run test:server`   | Runs focused server and security contract tests       |
| `npm run test:source`   | Enforces JSDoc, disabled tracers, and source policies |
| `npm run admin:promote` | Promotes one existing account with explicit env guard |
| `npm run verify:ci`     | Runs the complete non-browser CI verification chain   |
| `npm run audit:prod`    | Audits both production dependency trees               |

### Client Scripts

| Command                                         | Description                                                          |
| ----------------------------------------------- | -------------------------------------------------------------------- |
| `npm run dev --prefix client`                   | Starts Vite dev server                                               |
| `npm run build --prefix client`                 | Builds frontend assets                                               |
| `npm run preview --prefix client`               | Previews built frontend                                              |
| `npm run test:unit --prefix client`             | Runs Vitest unit tests                                               |
| `npm run test:e2e --prefix client`              | Runs Playwright public-route smoke tests                             |
| `npm run test:snapshots --prefix client`        | Runs Playwright snapshots in update mode (local baseline generation) |
| `npm run test:snapshots:verify --prefix client` | Verifies existing Playwright snapshot baselines                      |
| `npm run lint --prefix client`                  | Lints all maintained client source and configuration files           |
| `npm run format:check --prefix client`          | Checks client formatting with Prettier                               |

## Authentication Flow

1. `POST /api/users/login` or `POST /api/users/register` returns public user data and a short-lived access token.
2. A versioned refresh token is set as a `Secure` production, `HttpOnly`, `SameSite=Strict` cookie scoped to `/api/users`.
3. The client keeps the access token only in module memory and sends it as `Authorization: Bearer <token>`.
4. On initial load or one eligible `401`, the client calls `POST /api/users/refresh`; auth endpoints never recursively trigger refresh.
5. Refresh atomically rotates the current device's credential. Competing refreshes receive a retryable conflict without clearing the cookie.
6. Logout revokes the current device. Confirmed invalid credentials clear local state; transient infrastructure failures do not deliberately discard a valid session.

## API Endpoints

| Method   | Route                 | Description                                  |
| -------- | --------------------- | -------------------------------------------- |
| `POST`   | `/api/users/register` | Register user                                |
| `POST`   | `/api/users/login`    | Login user                                   |
| `POST`   | `/api/users/refresh`  | Rotate refresh cookie and issue access token |
| `POST`   | `/api/users/logout`   | Clear refresh cookie                         |
| `GET`    | `/api/users/current`  | Get current authenticated user               |
| `GET`    | `/api/users`          | List a bounded user page (admin only)        |
| `POST`   | `/api/users`          | Create a user (admin only)                   |
| `GET`    | `/api/users/:id`      | Fetch self or an admin-managed user          |
| `PUT`    | `/api/users/:id`      | Update allowlisted self/admin user fields    |
| `DELETE` | `/api/users/:id`      | Delete self or an admin-managed user         |

### Bootstrap the First Administrator

Register the account normally, then run the guarded local command against the intended database. The command refuses to run without all three values and never accepts a password on the command line.

```powershell
$env:MONGODB_URI='mongodb://localhost/mern_app-template-withauth'
$env:ADMIN_EMAIL='admin@example.com'
$env:ALLOW_ADMIN_PROMOTION='true'
npm run admin:promote
```

Reset `ALLOW_ADMIN_PROMOTION` after the command. Do not persist the guard as `true` in a deployed environment.

## Dynamic Documentation (JSDoc + jsdoc2md)

This repository generates one Markdown page per JavaScript or JSX source module. The smaller files keep review diffs focused, prevent duplicate JSDoc anchors between modules, and make individual backend or client references directly linkable.

- Backend index: `docs/generated/backend/README.md`
- Client index: `docs/generated/client/README.md`
- Machine-readable source/output fingerprints: `docs/generated/manifest.json`
- Compatibility indexes: `docs/api-reference.md` and `docs/client-components.md`

Rebuild all generated references:

```bash
npm run docs:generate
```

Verify that tracked documentation matches the source without writing files:

```bash
npm run docs:check
```

The generator scans:

- `app/**/*.js`
- `client/src/**/*.{js,jsx}`

Test and fixture files are excluded from public documentation. Output paths retain their source extension, so adjacent files such as `App.js` and `App.jsx` cannot overwrite one another. The generator also removes orphaned files within `docs/generated` and records deterministic SHA-256 fingerprints for source and output content.

## Snapshot Policy

Playwright snapshot image baselines are intentionally gitignored in this boilerplate to avoid committing large, platform-specific PNG artifacts by default.

- Generate/update local baselines with:
  ```bash
  npm run test:snapshots
  ```
- Verify existing baselines with:
  ```bash
  npm run test:snapshots:verify
  ```

## Project Structure

```text
app/
  index.js
  config/
    index.js
    runtime/
      runtime.js
      runtime.test.js
  controllers/
    index.js
    users/
      users.js
      users.test.js
  create-app/
    create-app.js
    create-app.test.js
  middleware/
  models/
  routes/
    index.js
    api-router/
    root-router/
    users-router/
  server/
    server.js
    server.test.js
  utils/
client/
  src/
    api/
      index.js
      auth/
        auth.js
        auth.test.js
      axiosClient/
      tokenStore/
    App/
    components/
      index.js
      parts/
      pages/
    config/
    context/
docs/
.github/
```

Every client API and backend runtime module has a same-named folder containing
its source and colocated test. Parent `index.js` files provide explicit named
exports; they do not implement routes or other application behavior. Consumers
use the parent entry point, while modules inside the same group import their
siblings directly to avoid circular dependencies. The client retains ES modules;
the backend retains CommonJS.

For example, client consumers use `import { loginUser } from "./api/index.js"`,
and backend consumers use `const { loadRuntimeConfig } = require("./config/index.js")`.
Controllers expose the `hash` and `userController` namespaces to keep their APIs
distinct; models expose `User`. Runtime startup lives in `app/server/server.js`,
and the existing npm development and production commands target that entry point.
Restart an already-running development command after migrating from the old root
`server.js` path. Structure contract tests enforce colocation and public exports.

## Production Notes

- Build client before production server start:
  ```bash
  npm run build
  ```
- Start API in production mode:
  ```bash
  # macOS/Linux
  NODE_ENV=production npm run start:prod

  # PowerShell
  $env:NODE_ENV='production'; npm run start:prod
  ```
- In production, Express serves `client/dist` as static assets.
- Set secure, unique JWT secrets and a production MongoDB URI.
- Configure TLS at the hosting edge and set `TRUST_PROXY` to the platform's documented proxy topology.
- See [SECURITY.md](SECURITY.md) for reporting guidance and deployment responsibilities.

## Troubleshooting

- `401` loops on authenticated routes:
  - Verify secrets, `JWT_ISSUER`, and `JWT_AUDIENCE` match the values used to issue tokens.
  - Confirm browser accepts cookies for backend origin and `withCredentials` requests.
- CORS errors:
  - Ensure `CLIENT_ORIGINS` contains the frontend origin exactly, including protocol and port.
- MongoDB connection failure:
  - Validate `MONGODB_URI` and network/IP access rules.
