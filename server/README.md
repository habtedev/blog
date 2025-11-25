# Server

Tiny server for the blog project.

Quick start

1. Copy example env: `cp .env.example .env` and edit values.
2. Install deps (from project root or inside `server/`):

```bash
npm install
```

3. Run in development:

```bash
npm run dev
```

4. Run production:

```bash
npm start
```

Notes

- `.env` is ignored by git. Keep secrets out of source control.
- Server entrypoint: `server/server.js`.
- App is exported from `server/src/app.js`.
