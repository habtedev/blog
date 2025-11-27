# Blog Project

Express + Mongoose backend for a small blog platform. This repo provides:

- Blog and Writer domains (CRUD)
- Draft subsystems (BlogDraft and WriterDraft)
- Publish / Unpublish flows (move between Draft and Blog)
- Validation (Joi), centralized error handling, and structured logging
- Security middleware: `helmet` and cookie-based `csurf` (CSRF)

This README gives fast, professional setup and usage instructions for a development team.

## Quick Start

Requirements: Node.js 18+ (or current LTS), npm, and a running MongoDB server.

1. Clone the repo and install server dependencies:

```bash
cd /home/habtamu/Documents/project/blog/blog/server
npm install
```

2. Create a `.env` file in `server/` (see `.env.example` if present) and set at minimum:

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/blog
NODE_ENV=development
LOG_LEVEL=info
```

3. Start the server (development):

```bash
npm run dev
# or
npm start
```

The server listens on `http://localhost:$PORT` and mounts the API under `/api`.

## Environment & Configuration

- `PORT` - port where server runs (default 3000)
- `MONGO_URI` - MongoDB connection string
- `NODE_ENV` - `development` or `production` (affects cookie `secure` flag)
- `LOG_LEVEL` - logging verbosity (info, debug, warn, error)

## Project Layout (important files)

- `server/server.js` – app entry, DB connect and graceful shutdown
- `server/src/app.js` – express app, global middleware (helmet, csurf)
- `server/src/config/` – config & DB utilities
- `server/src/routes/` – route mounts (blog, writer)
- `server/src/domains/` – domain folders: `blog/`, `writer/` (models, services, controllers, validation)
- `server/src/middlewares/` – validation, error handler
- `server/src/utils/` – logger, HttpError

## Security Notes

- `helmet()` is enabled globally to set secure HTTP headers.
- CSRF protection is enabled using cookie-based tokens. The app exposes a helper endpoint to fetch the token:

  - `GET /api/csrf-token` returns `{ csrfToken }`.
  - Clients (browsers) must include the token when making state-changing requests (POST/PUT/PATCH/DELETE) as a header `X-CSRF-Token` or `_csrf` body field.
  - The CSRF cookie is `httpOnly` and `sameSite: 'lax'`. In production `secure: true` is enforced (HTTPS required).

If your API is consumed by non-browser clients (mobile apps, scripts) we recommend using API keys or JWT-based auth and either:

- Exempt those routes from CSRF (router-level), or
- Use a conditional CSRF wrapper (skip CSRF when a valid API key or Authorization header is present).

## API Highlights

This project contains two main domain APIs: `Blog` and `Writer`. Both support drafts and publish flows.

- Blog routes (example):

  - `GET /api/blog` - list published posts (supports `?status=` filter)
  - `POST /api/blog` - create a new blog post
  - `PATCH /api/blog/:id/status` - change status (publish/unpublish/archived)
  - `POST /api/blog/drafts` - create a blog draft
  - `POST /api/blog/drafts/:draftId/publish` - publish a blog draft

- Writer routes (example):
  - `GET /api/writer` - list writers
  - `POST /api/writer` - create writer
  - `POST /api/writer/:id/drafts` - create a writer-scoped draft
  - `POST /api/writer/:id/drafts/:draftId/publish` - publish a writer draft (adds published post to writer.posts)

Example: publish a writer draft (browser flow)

1. Fetch CSRF token

```js
const r = await fetch("/api/csrf-token", { credentials: "include" });
const { csrfToken } = await r.json();

await fetch(`/api/writer/${writerId}/drafts/${draftId}/publish`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-CSRF-Token": csrfToken,
  },
  credentials: "include",
  body: JSON.stringify({ deleteDraft: true }),
});
```

Example: publish a blog draft (server-side curl)

````bash
# Blog — Server

[![Status](https://img.shields.io/badge/status-development-yellow.svg)](#)
[![Node](https://img.shields.io/badge/node-%3E=_18-brightgreen.svg)](#)
[![License](https://img.shields.io/badge/license-Proprietary-lightgrey.svg)](#)

Professional, production-oriented backend for a small blog platform. This repository contains a focused Express + Mongoose API with:

- Domain separation (Blog, Writer)
- Draft workflow: BlogDraft and WriterDraft collections for editable drafts
- Publish / Unpublish flows that move content between Draft and Blog
- Validation (Joi), centralized error handling, structured logging
- Security: `helmet()` and cookie-based CSRF protection (configurable)

Table of contents
- [Quick start](#quick-start)
- [Environment](#environment)
- [Architecture & layout](#architecture--layout)
- [API overview](#api-overview)
- [Security considerations](#security-considerations)
- [Developer workflow](#developer-workflow)
- [Recommended production hardening](#recommended-production-hardening)
- [Troubleshooting](#troubleshooting)
- [Contributing & license](#contributing--license)

## Quick start

Requirements: Node.js 18+ and a running MongoDB instance.

1. Install dependencies:

```bash
cd server
npm install
````

2. Create `.env` (example values):

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/blog
NODE_ENV=development
LOG_LEVEL=info
```

3. Run the server:

```bash
npm run dev   # development (nodemon)
npm start     # production
```

Server base URL: `http://localhost:$PORT`. API root is mounted under `/api`.

## Environment

- `PORT` — HTTP port (default 3000)
- `MONGO_URI` — MongoDB connection string
- `NODE_ENV` — `development` or `production` (affects cookie secure flag)
- `LOG_LEVEL` — logger level: `debug|info|warn|error`

## Architecture & layout

- `server/server.js` — application bootstrap, DB connect, graceful shutdown
- `server/src/app.js` — Express app, global middleware (helmet, cookie-parser, csurf)
- `server/src/config/` — configuration and DB helper
- `server/src/routes/` — route mounting (blog, writer)
- `server/src/domains/` — domain folders; each contains `model`, `service`, `controller`, `validation`
- `server/src/middlewares/` — validation middleware, centralized error handler
- `server/src/utils/` — logger, HttpError

Design principles

- Keep controllers thin and focused on HTTP concerns.
- Business logic lives in services that operate on models.
- Drafts are stored separately to allow safe editing without altering published content.

## API overview

This API exposes the Blog and Writer domains. Below are the most-used endpoints.

Blog

- `GET /api/blog` — list posts (supports `?status=`)
- `GET /api/blog/:id` — get a single post (`?preview=true` to view drafts)
- `POST /api/blog` — create a post
- `PATCH /api/blog/:id` — update post (status changes are restricted)
- `PATCH /api/blog/:id/status` — change status (`draft|published|archived`)
- `POST /api/blog/drafts` — create blog draft
- `POST /api/blog/drafts/:draftId/publish` — publish draft

Writer

- `GET /api/writer` — list writers
- `GET /api/writer/:id` — get writer
- `POST /api/writer` — create writer
- `POST /api/writer/:id/drafts` — create writer draft
- `POST /api/writer/:id/drafts/:draftId/publish` — publish writer draft (adds blog id to `writer.posts`)

CSRF token endpoint (for browser clients)

- `GET /api/csrf-token` — returns `{ csrfToken }`; include this token on state-changing requests in header `X-CSRF-Token` or as `_csrf` in body.

Example: publish a writer draft (browser)

```js
// fetch token first
const r = await fetch("/api/csrf-token", { credentials: "include" });
const { csrfToken } = await r.json();

await fetch(`/api/writer/${writerId}/drafts/${draftId}/publish`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
  credentials: "include",
  body: JSON.stringify({ deleteDraft: true }),
});
```

## Security considerations

- `helmet()` is enabled to set secure HTTP headers; you can tune Helmet options for CSP and other policies.
- CSRF protection is enabled using cookie-based tokens. In production the CSRF cookie is set with `secure: true` and `sameSite: 'lax'`.
- If you have non-browser API clients (mobile, CLI), prefer using token-based auth (JWT/API keys) and exempt those routes from CSRF or use a conditional CSRF middleware.

Add these common protections for production:

1. Add authentication (JWT or session) and enforce ownership checks for drafts and publish routes.
2. Enable MongoDB transactions (replica set) for atomic publish/unpublish flows.
3. Add rate limiting and stricter CSP via Helmet.

## Developer workflow

- Follow the services/controllers pattern. Keep controllers focused on parsing requests, early validation, and returning HTTP responses; put business rules in services.
- Use the provided Joi schemas in `domains/*/validation` for request validation.
- Use the logger for structured logs and set `LOG_LEVEL` appropriately.

Recommended Git workflow

- Feature branches, small commits, descriptive commit messages.
- Open PRs with tests for non-trivial logic.

## Recommended production hardening

1. Authentication & ownership checks (high priority)
2. Transactional publish/unpublish flows (MongoDB replica set)
3. Integration tests for the publish/unpublish and writer draft flows
4. CI (GitHub Actions) to run lint and tests on PRs

## Troubleshooting

- MongoDB connection issues: validate `MONGO_URI` and ensure MongoDB is reachable.
- CSRF errors (`EBADCSRFTOKEN`): ensure client fetched the CSRF token and sends it with the request.

## Contributing & license

- Fork, branch, and open PRs. Include tests for significant changes.
- Add a `LICENSE` if you plan to open-source the repository.

---
