# Deployment Guide

This guide explains how to deploy this MERN template to production.

Before configuring a provider, read [scaling and operations](docs/scaling-and-operations.md) for deployment mode, shared stores, health probes, index creation, and the session cutover. Follow the [SEO publishing checklist](docs/seo-guide.md) before enabling indexing. Production requires an explicit `DEPLOYMENT_MODE=single` or `multi`; multi-instance deployments require Redis.

> **Important:** The repository includes friction-free local development defaults. Replace every starter credential, local infrastructure URL, browser origin, and provider-specific setting before deployment. Production mode rejects missing JWT secrets and the built-in development signing keys.

It covers:

- Render
- Replit Deployments
- Heroku
- Railway
- Fly.io

It also includes notes for Vercel/Netlify (frontend-only platforms).

## Deployment Model

This project is configured to run as a **single Node service**:

- Express serves the API
- Express also serves the built Vite frontend from `client/dist`

This is the easiest and most reliable deployment path for this boilerplate.

## Required Environment Variables

Set these on your hosting platform:

| Variable                    | Required    | Example                         | Notes                                           |
| --------------------------- | ----------- | ------------------------------- | ----------------------------------------------- |
| `NODE_ENV`                  | Yes         | `production`                    | Must be `production` in deployed environments   |
| `DEPLOYMENT_MODE`           | Yes         | `single` or `multi`             | Explicit topology; multi requires shared Redis  |
| `PORT`                      | No          | `3001`                          | Platform usually injects this automatically     |
| `MONGODB_URI`               | Yes         | `mongodb+srv://...`             | Use MongoDB Atlas or managed Mongo              |
| `CLIENT_ORIGINS`            | Usually Yes | `https://your-app.onrender.com` | Comma-separated exact browser origins           |
| `TRUST_PROXY`               | Platform    | `1`                             | Use the provider's documented proxy-hop setting |
| `RATE_LIMIT_STORE`          | Multi-node  | `redis`                         | Select shared quotas instead of process memory  |
| `RATE_LIMIT_REDIS_URL`      | With Redis  | `rediss://...`                  | Managed Redis/Valkey connection URL             |
| `RATE_LIMIT_REDIS_PREFIX`   | No          | deployment-specific value       | Shared by instances, unique per app/environment |
| `JWT_ACCESS_SECRET`         | Yes         | random 32+ chars                | Unique access-token signing secret              |
| `JWT_REFRESH_SECRET`        | Yes         | different random 32+ chars      | Unique refresh-token signing secret             |
| `JWT_ISSUER`                | No          | `mern-app-template`             | Token issuer checked during verification        |
| `JWT_AUDIENCE`              | No          | `mern-app-client`               | Token audience checked during verification      |
| `ACCESS_TOKEN_EXPIRES_IN`   | No          | `15m`                           | Optional override                               |
| `REFRESH_TOKEN_EXPIRES_IN`  | No          | `7d`                            | Optional override                               |
| `REFRESH_COOKIE_MAX_AGE_MS` | No          | `604800000`                     | Keep aligned with the refresh-token lifetime    |
| `BCRYPT_ROUNDS`             | No          | `12`                            | Bounded to 10-15 by runtime code                |

## Pre-Deploy Checklist

1. Create a production MongoDB database (recommended: MongoDB Atlas).
2. Add your deployment domain to Atlas network access allowlist.
3. Generate strong JWT secrets.
4. Use Node `22.19.0` or a newer Node 22 release.
5. Confirm app builds locally:

```bash
npm ci
npm ci --prefix client
npm run verify:ci
npm run build
```

PowerShell local production smoke test:

```powershell
$env:NODE_ENV='production'
$env:DEPLOYMENT_MODE='single'
npm run start:prod
```

## Render

Recommended setup:

- Type: **Web Service**
- Root directory: repository root
- Build command:

```bash
npm ci && npm ci --prefix client && npm run build
```

- Start command:

```bash
npm run start:prod
```

- Auto deploy: enabled
- Health check path: `/api/health`

Set all required environment variables in Render dashboard.

## Replit Deployments

Use **Deployments** (Autoscale or Reserved VM).

Build command:

```bash
npm ci && npm ci --prefix client && npm run build
```

Run command:

```bash
npm run start:prod
```

Set environment secrets in Replit:

- `NODE_ENV=production`
- all required variables listed above

Replit provides `PORT`; this app already respects `process.env.PORT`.

## Heroku

### One-time setup

```bash
heroku login
heroku create <your-app-name>
```

Set config vars:

```bash
heroku config:set NODE_ENV=production
heroku config:set DEPLOYMENT_MODE=single
heroku config:set MONGODB_URI="..."
heroku config:set CLIENT_ORIGINS="https://<your-app-name>.herokuapp.com"
heroku config:set JWT_ACCESS_SECRET="..."
heroku config:set JWT_REFRESH_SECRET="..."
heroku config:set ACCESS_TOKEN_EXPIRES_IN="15m"
heroku config:set REFRESH_TOKEN_EXPIRES_IN="7d"
heroku config:set BCRYPT_ROUNDS="12"
```

Deploy:

```bash
git push heroku <your-branch>:main
```

Because this repo has a client subproject, ensure frontend deps are installed during build on Heroku. If needed, set a custom build step pattern in your pipeline equivalent to:

```bash
npm ci && npm ci --prefix client && npm run build
```

## Railway

Service settings:

- Build command:

```bash
npm ci && npm ci --prefix client && npm run build
```

- Start command:

```bash
npm run start:prod
```

Set required variables in Railway dashboard, including `NODE_ENV=production`.

## Fly.io

For Fly.io, deploy as a Node web service with internal port from `PORT`.

Typical command flow:

```bash
fly launch
fly secrets set NODE_ENV=production DEPLOYMENT_MODE=single MONGODB_URI="..." CLIENT_ORIGINS="https://<app>.fly.dev" JWT_ACCESS_SECRET="..." JWT_REFRESH_SECRET="..." BCRYPT_ROUNDS="12"
fly deploy
```

In your Fly config, ensure build/start equivalents run:

- build: `npm ci && npm ci --prefix client && npm run build`
- start: `npm run start:prod`

## Vercel / Netlify Notes

These are primarily frontend platforms.

This boilerplate is backend + frontend in one service, so direct Vercel/Netlify deployment is not the best fit unless you:

- deploy API separately (Render/Railway/Fly/etc.), and
- update frontend API base URL strategy (current axios config assumes same-origin `/api`).

## Production Verification

After deployment:

1. Open app root URL and confirm UI renders.
2. Register a new user.
3. Log in and verify dashboard route access.
4. Confirm refresh-token behavior (stay logged in across token refresh window).
5. Confirm logout clears session.

## Scaling and Operations

- A single instance can retain `RATE_LIMIT_STORE=memory` without another service.
- Before running multiple application instances, provision managed Redis or Valkey and give every instance the same settings:

  ```dotenv
  DEPLOYMENT_MODE=multi
  RATE_LIMIT_STORE=redis
  RATE_LIMIT_REDIS_URL=rediss://<managed-connection-url>
  RATE_LIMIT_REDIS_PREFIX=<unique-app-and-environment-name>
  ```

- Use the provider's private/internal connection URL where available. Prefer `rediss://` whenever traffic crosses an untrusted network, and store the URL as a secret because it commonly contains credentials.
- Keep `RATE_LIMIT_REDIS_PREFIX` identical across every instance of one deployment, but unique across applications and environments that share the same Redis/Valkey service. The app adds separate `api` and `auth` namespaces automatically.
- Redis mode validates and connects the shared store before MongoDB or the HTTP listener starts. An invalid URL or unavailable store therefore fails startup instead of silently falling back to per-process counters.
- Runtime store errors fail closed through the API error boundary. Monitor Redis/Valkey availability and latency as part of the application service-level checks.
- Keep TLS termination, `TRUST_PROXY`, and `CLIENT_ORIGINS` aligned with the hosting provider's network topology.
- Enable managed database backups, centralized structured logging, uptime checks against `/api/health`, and secret rotation in the deployment platform.
- Treat a signing secret as compromised if it was ever committed or exposed; replace it in every deployed environment rather than only deleting the current file.

## Common Issues

### 1. `401` after login

- Check `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`.
- Ensure backend domain and cookie settings align with your deployment origin.

### 2. CORS errors

- `CLIENT_ORIGINS` must include your public frontend URL exactly.
- Include protocol (`https://...`).

### 3. Mongo connection failures

- Validate `MONGODB_URI` is correct and accessible from your deployment environment.
- Verify Atlas allowlist includes deployment egress IP/domain policy.

### 4. Build fails because client deps are missing

- Use build command:

```bash
npm ci && npm ci --prefix client && npm run build
```

## Suggested Default

If you want the fastest path with minimal infrastructure decisions:

- choose **Render Web Service**
- deploy as one service
- use MongoDB Atlas
