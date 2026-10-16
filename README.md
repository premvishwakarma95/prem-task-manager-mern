# Task Manager (MERN)

A small task manager: create, edit, complete, filter, search and delete tasks.

**Stack:** MongoDB + Mongoose, Express 5, React 18 (Vite). Node 18+.

## Run with Docker (recommended)

```bash
docker compose up -d --build
```

Open http://localhost:8080. This starts three containers: `mongo` (MongoDB 7 with a persistent volume), `server` (Express API) and `client` (React build served by nginx, which proxies `/api` to the server). MongoDB is not exposed to the host. Stop with `docker compose down` (add `-v` to wipe the data).

## Run locally without Docker

```bash
# 1. MongoDB must be running (local install or: docker run -p 27017:27017 mongo:7)

# 2. API  (http://localhost:5000)
cd server
cp .env.example .env      # edit MONGO_URI if needed
npm install
npm run dev

# 3. Client (http://localhost:5173) - in a second terminal
cd client
npm install
npm run dev
```

Tests (need a MongoDB; they use and drop a separate `*_test` database):
`cd server && MONGO_URI=mongodb://127.0.0.1:27017/taskmanager_test npm test`

## API

| Method | Path | Notes |
|---|---|---|
| GET | `/api/tasks?status=&q=&page=&limit=` | filter by status, title search, numbered pagination (default 10 per page, max 50). Returns `{ items, page, limit, total, pages }` |
| POST | `/api/tasks` | `title` required |
| PATCH | `/api/tasks/:id` | partial update |
| DELETE | `/api/tasks/:id` | 204 on success |

Task: `title`, `description`, `status` (todo / in-progress / done), `priority` (low / medium / high), plus automatic `createdAt` / `updatedAt`.

## Three most important decisions

1. **Validation on the server, not just the UI.** The API whitelists fields, validates enums and lengths, checks ObjectIds, and returns clear 400/404 errors. The UI can't be trusted, and a clean API contract lets any other client reuse it.
2. **Docker Compose with an nginx proxy.** One `docker compose up` starts MongoDB (with a persistent volume), the API and the React build. nginx serves the UI and proxies `/api` to the server, so the browser talks to a single origin (no CORS setup) and MongoDB is never exposed to the host. A reviewer can run the whole app with no local installs.
3. **Server-side pagination, filtering and search, with debounce and stale-response protection.** The API returns one page of 10 tasks plus the total, so the UI shows numbered pages (Previous / 1 2 3 / Next). Out-of-range pages are clamped, so deleting the last task on a page never leaves an empty screen. Filtering on the server scales better than loading everything into the browser, and the `cancelled` flag stops a slow earlier request from overwriting a newer result.

## Three things I deliberately did not implement

1. **Authentication / multi-user accounts.** The brief asks for a simple task manager; auth adds signup, sessions, password security and per-user data scoping, a big surface for a 24-hour exercise. The model would just gain a `user` field later.
2. **Drag-and-drop Kanban board and manual ordering.** It needs an ordering field, reorder endpoints and accessibility work. A status dropdown covers the same need with far less risk.
3. **Real-time sync (WebSockets) and reminders.** Only matters with multiple users or devices, and adds infrastructure (socket server, scheduler) with no benefit for a single-user app.

## One limitation I'd fix with one more day

**Page-number pagination uses `skip`, and search uses an unanchored regex; neither scales to very large collections.** `skip(n)` and `countDocuments` get slower as the data grows, and the regex can't use an index. I'd switch to cursor pagination for deep pages and add a MongoDB text index. A text index would also allow searching descriptions and ranking results.
