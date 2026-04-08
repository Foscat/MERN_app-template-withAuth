# Deployment Guide

This guide explains how to deploy this MERN template to production.

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

| Variable | Required | Example | Notes |
| -------- | -------- | ------- | ----- |
| `NODE_ENV` | Yes | `production` | Must be `production` in deployed environments |
| `PORT` | No | `3001` | Platform usually injects this automatically |
| `MONGODB_URI` | Yes | `mongodb+srv://...` | Use MongoDB Atlas or managed Mongo |
| `CLIENT_ORIGIN` | Usually Yes | `https://your-app.onrender.com` | Should match your public app URL |
| `JWT_ACCESS_SECRET` | Yes | random 32+ chars | Access token signing secret |
| `JWT_REFRESH_SECRET` | Yes | random 32+ chars | Refresh token signing secret |
| `ACCESS_TOKEN_EXPIRES_IN` | No | `15m` | Optional override |
| `REFRESH_TOKEN_EXPIRES_IN` | No | `7d` | Optional override |
| `salt` | Yes | `10` | bcrypt salt rounds |

## Pre-Deploy Checklist

1. Create a production MongoDB database (recommended: MongoDB Atlas).
2. Add your deployment domain to Atlas network access allowlist.
3. Generate strong JWT secrets.
4. Ensure Node version is `22.19.0` (already pinned in project files).
5. Confirm app builds locally:

```bash
npm install
npm install --prefix client
npm run build
```

PowerShell local production smoke test:

```powershell
$env:NODE_ENV='production'
npm run start:prod
```

## Render

Recommended setup:
- Type: **Web Service**
- Root directory: repository root
- Build command:

```bash
npm install --prefix client && npm run build
```

- Start command:

```bash
npm run start:prod
```

- Auto deploy: enabled
- Health check path: `/`

Set all required environment variables in Render dashboard.

## Replit Deployments

Use **Deployments** (Autoscale or Reserved VM).

Build command:

```bash
npm install --prefix client && npm run build
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
heroku config:set MONGODB_URI="..."
heroku config:set CLIENT_ORIGIN="https://<your-app-name>.herokuapp.com"
heroku config:set JWT_ACCESS_SECRET="..."
heroku config:set JWT_REFRESH_SECRET="..."
heroku config:set ACCESS_TOKEN_EXPIRES_IN="15m"
heroku config:set REFRESH_TOKEN_EXPIRES_IN="7d"
heroku config:set salt="10"
```

Deploy:

```bash
git push heroku <your-branch>:main
```

Because this repo has a client subproject, ensure frontend deps are installed during build on Heroku. If needed, set a custom build step pattern in your pipeline equivalent to:

```bash
npm install --prefix client && npm run build
```

## Railway

Service settings:
- Build command:

```bash
npm install --prefix client && npm run build
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
fly secrets set NODE_ENV=production MONGODB_URI="..." CLIENT_ORIGIN="https://<app>.fly.dev" JWT_ACCESS_SECRET="..." JWT_REFRESH_SECRET="..." salt="10"
fly deploy
```

In your Fly config, ensure build/start equivalents run:
- build: `npm install --prefix client && npm run build`
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

## Common Issues

### 1. `401` after login

- Check `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`.
- Ensure backend domain and cookie settings align with your deployment origin.

### 2. CORS errors

- `CLIENT_ORIGIN` must exactly match your public frontend URL.
- Include protocol (`https://...`).

### 3. Mongo connection failures

- Validate `MONGODB_URI` is correct and accessible from your deployment environment.
- Verify Atlas allowlist includes deployment egress IP/domain policy.

### 4. Build fails because client deps are missing

- Use build command:

```bash
npm install --prefix client && npm run build
```

## Suggested Default

If you want the fastest path with minimal infrastructure decisions:

- choose **Render Web Service**
- deploy as one service
- use MongoDB Atlas
