# 💀 Hate Movies

A movie review platform where you hate movies instead of liking them. Users can rate films on a 1–5 skull scale, leave hate comments, and curate their personal list of most-hated films.

**Live demo:** deployed on Vercel — frontend served directly from the Express backend.

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + TypeScript, Vite, React Router v7, TanStack React Query v5 |
| Backend | Node.js, Express, TypeORM, PostgreSQL |
| Auth | JWT (stored in `localStorage`) |
| Deploy | Vercel (single project — backend serves the built frontend) |

---

## Features

- Browse movies fetched from the database
- Add movies to your personal **Hated list**
- Submit a **1–5 star hate review** with an optional comment
- **Hate-vote** other users' comments (once per user, tracked server-side)
- Delete your own reviews
- **My Hateds** page — your full hated movies grid
- **My Reviews** page — all your submitted evaluations
- Admin role — can delete any comment
- Red/dark aggressive theme with custom skull favicon

---

## Project structure

```
├── backend/        Express API + TypeORM entities + migrations
│   ├── entities/   TypeORM EntitySchema definitions
│   ├── migrations/ PostgreSQL migration files (.cjs)
│   ├── routes/     API route handlers
│   ├── middlewares/
│   └── server.js   Entry point — also serves frontend/dist
└── frontend/       React + TypeScript SPA
    ├── src/
    │   ├── api/        Fetch wrappers for each resource
    │   ├── components/ Shared components (MovieCard, StarRating)
    │   ├── context/    AuthContext (JWT decode)
    │   ├── hooks/      React Query hooks
    │   ├── pages/      One folder per route
    │   └── types/      Shared TypeScript interfaces
    └── index.html
```

---

## Local development

### Prerequisites

- Node.js 18+
- PostgreSQL running locally

### Backend

```bash
cd backend
npm install
```

Create a `.env` file (see `.env.example` below), then:

```bash
npm run dev        # nodemon with auto-reload
npm run migration:run   # apply pending migrations
```

**.env variables:**

```
PORT=8081
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=yourdbname
JWT_SECRET=your_jwt_secret
```

### Frontend (dev server with hot reload)

```bash
cd frontend
npm install
npm run dev        # Vite dev server on http://localhost:5173
                   # /api calls are proxied to http://localhost:8081
```

### Frontend (production build served by backend)

```bash
cd frontend
npm run build      # outputs to frontend/dist/

cd ../backend
npm start          # serves API + frontend at http://localhost:8081
```

---

## API overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/users/login` | — | Login, returns JWT |
| POST | `/api/users/new` | — | Register |
| GET | `/api/movies` | — | List all movies |
| GET | `/api/movies/:id` | — | Single movie |
| GET | `/api/hateds` | ✓ | Current user's hated movies |
| POST | `/api/hateds/add` | ✓ | Add movie to hateds |
| DELETE | `/api/hateds/:movieId` | ✓ | Remove from hateds |
| GET | `/api/evaluations/movie/:movieId` | optional | Reviews for a movie |
| POST | `/api/evaluations/movie/:movieId` | ✓ | Submit/update review |
| GET | `/api/evaluations/movie/:movieId/stats` | — | Avg rating + review count |
| GET | `/api/evaluations/mine` | ✓ | Current user's reviews |
| DELETE | `/api/evaluations/:id/comment` | ✓ | Delete own review (admin: any) |
| PUT | `/api/evaluations/:id/hate` | ✓ | Cast a hate vote (once per user) |
| DELETE | `/api/evaluations/:id/hate` | ✓ | Remove hate vote |

Full interactive docs available at `/api-docs` (Swagger UI).

---

## Database migrations

```bash
cd backend

# Run all pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Generate a new migration (after editing entities)
npm run migration:generate --name=MigrationName
```

---

## Deployment (Vercel)

The backend serves the built frontend from `frontend/dist/`. A single Vercel project handles both.

**Vercel settings:**
- Root directory: `backend`
- Build command: `cd ../frontend && npm install && npm run build`
- Output directory: *(leave empty — Express handles serving)*

No `VITE_API_URL` environment variable is needed — the frontend uses `/api` as a relative path, which resolves correctly on any domain.
