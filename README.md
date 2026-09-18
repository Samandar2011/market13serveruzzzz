# CEFR MASTER

Original Uzbek-language CEFR mock-exam platform prototype with a responsive student experience and protected admin area.

## Start

```powershell
npm start
```

Open `http://localhost:3000`.

## Deploy online with Render

1. Push this project to a GitHub repository.
2. In Render, choose **New > Blueprint** and select the repository.
3. Render will read `render.yaml`, create the Node web service and attach a persistent disk for `data.json` and audio uploads.
4. Open the generated `https://...onrender.com` URL.

The free plan may sleep when idle. The included `render.yaml` uses a small persistent disk, so use a paid Render plan if the disk is required in production.

| Account | Login | Password |
|---|---|---|
| Student | `student@cefrmaster.uz` | `Student@2026` |
| Admin | `admin@cefrmaster.uz` | `Admin@2026` |

The server creates `data.json` on first run. It holds local development data and is intentionally excluded from source control. Passwords are salted `scrypt` hashes.

## Included working flows

- Registration, login, server-side sessions, logout, role-gated admin APIs
- Test catalogue, server-persisted attempts/answers, autosaved writing responses, objective scoring and results
- Student dashboard, profile, results, mobile-ready test interface and finish confirmation
- Admin overview, searchable users and test creation
- A normalized PostgreSQL production schema reference in `schema.sql`

## Production handoff

The dependency-free local persistence adapter makes the prototype immediately runnable. Before public deployment, implement the supplied PostgreSQL schema through a database repository; then add CSRF protection for cookie sessions, a durable session store, rate limiter, object storage with malware scanning for uploads, transactional payment-provider adapters, and an email/SMS verification service.
