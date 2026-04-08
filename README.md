# MERN App Template With Auth

Production-ready MERN starter with JWT access/refresh authentication, role support, protected frontend routes, and a modern React 18 + Vite + RSuite client.

## Highlights

- Express API with modular routes, controllers, middleware, and Mongoose models
- JWT access tokens + HTTP-only refresh cookie flow
- Automatic frontend token refresh and session expiry handling
- Protected React routes and dashboard layout scaffolding
- Node version pinned to `v22.19.0`
- JSDoc-first code comments aligned for `jsdoc2md` generation

## Tech Stack

- Backend: Node.js, Express, Mongoose, JWT, bcrypt, cookie-parser, cors
- Frontend: React 18, React Router, Vite, RSuite, Axios
- Tooling: Nodemon, Concurrently, jsdoc-to-markdown

## Prerequisites

- Node.js `22.19.0`
- npm `10+`
- MongoDB (local or hosted)

Use the included version files with your version manager:

- `.nvmrc`
- `.node-version`
- `client/.nvmrc`
- `client/.node-version`

## Quick Start

1. Install backend dependencies:
   ```bash
   npm install
   ```
2. Install frontend dependencies:
   ```bash
   npm install --prefix client
   ```
3. Configure environment variables (see below).
4. Start the app in development mode:
   ```bash
   npm run start
   ```

Backend runs on `http://localhost:3001` and Vite dev server on `http://localhost:5173`.

## Environment Variables

Create a root `.env` file for backend config.

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `PORT` | No | `3001` | API server port |
| `MONGODB_URI` | No | `mongodb://localhost/mern_app-template-withauth` | MongoDB connection string |
| `CLIENT_ORIGIN` | No | `http://localhost:5173` | Allowed CORS origin |
| `JWT_ACCESS_SECRET` | Yes | none | Secret for access token signing |
| `JWT_REFRESH_SECRET` | Yes | none | Secret for refresh token signing |
| `ACCESS_TOKEN_EXPIRES_IN` | No | `15m` | Access token TTL |
| `REFRESH_TOKEN_EXPIRES_IN` | No | `7d` | Refresh token TTL |
| `salt` | Yes | none | bcrypt salt rounds or salt value |

Client env is optional in current code. If needed, use `client/.env`:

```env
VITE_API_URL=/api
```

## Available Scripts

### Root Scripts

| Command | Description |
|---|---|
| `npm run start` | Auto-selects dev/prod mode based on `NODE_ENV` |
| `npm run start:dev` | Runs API via Nodemon + Vite dev server concurrently |
| `npm run start:prod` | Runs API server only (for built client assets) |
| `npm run build` | Builds the Vite client to `client/dist` |
| `npm run docs:api` | Generates API docs from JSDoc comments |

### Client Scripts

| Command | Description |
|---|---|
| `npm run dev --prefix client` | Starts Vite dev server |
| `npm run build --prefix client` | Builds frontend assets |
| `npm run preview --prefix client` | Previews built frontend |
| `npm run test:unit --prefix client` | Runs Vitest unit tests |
| `npm run test:snapshots --prefix client` | Runs Playwright snapshots in update mode (local baseline generation) |
| `npm run test:snapshots:verify --prefix client` | Verifies existing Playwright snapshot baselines |

## Authentication Flow

1. `POST /api/users/login` or `POST /api/users/register` returns an access token.
2. Refresh token is set as `HttpOnly` cookie on `/api/users` path.
3. Frontend sends access token in `Authorization: Bearer <token>`.
4. On `401`, Axios interceptor attempts `POST /api/users/refresh`.
5. If refresh succeeds, request is retried automatically.
6. If refresh fails, session is cleared and user is redirected to `/login`.

## API Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/users/register` | Register user |
| `POST` | `/api/users/login` | Login user |
| `POST` | `/api/users/refresh` | Rotate refresh cookie and issue access token |
| `POST` | `/api/users/logout` | Clear refresh cookie |
| `GET` | `/api/users/current` | Get current authenticated user |
| `GET` | `/api/users` | List users |
| `POST` | `/api/users` | Create user (register alias) |
| `GET` | `/api/users/:id` | Fetch user by id |
| `PUT` | `/api/users/:id` | Update user |
| `DELETE` | `/api/users/:id` | Delete user |

## Dynamic Documentation (JSDoc + jsdoc2md)

This repository is configured for generated API docs.

- Output file: `docs/api-reference.md`
- Generation command:

```bash
npm run docs:api
```

The script scans:

- `server.js`
- `app/**/*.js`
- `client/src/api/**/*.js`

This keeps output stable and avoids JSX parser noise while still documenting the API surface.

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
  controllers/
  middleware/
  models/
  routes/
client/
  src/
    api/
    components/
    context/
    layouts/
    pages/
server.js
docs/
```

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

## Troubleshooting

- `401` loops on authenticated routes:
  - Verify `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` match issued tokens.
  - Confirm browser accepts cookies for backend origin and `withCredentials` requests.
- CORS errors:
  - Ensure `CLIENT_ORIGIN` exactly matches frontend origin.
- MongoDB connection failure:
  - Validate `MONGODB_URI` and network/IP access rules.
