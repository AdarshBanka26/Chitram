# Chitram (Gallery of Wonders) — Backend

REST API for **Chitram**, a creative-works gallery platform. As the circus's "Grand Archivist,"
users capture and celebrate fleeting performances: they sign up, upload art/photography/writing,
organize works into boards, like and save others' work, search and filter, and explore AI-powered
recommendations and similarity search.

Stack: **Node.js + Express + MongoDB (Mongoose)**, JWT auth, **Cloudinary** for media, **OpenAI**
for AI features (auto-tagging, embeddings, recommendations, similarity), and optional **MongoDB
Atlas Vector Search**.

---

## Quick start

```bash
cd backend
npm install
cp .env.example .env      # then fill in the values (see below)
npm run seed              # optional: load demo data
npm run dev               # starts on http://localhost:5000
```

Health check: `GET http://localhost:5000/api/health`

> Dependencies must be installed on your machine (`npm install`). The packages are standard:
> express, mongoose, jsonwebtoken, bcryptjs, cloudinary, multer, openai, helmet, cors, morgan,
> express-rate-limit, express-mongo-sanitize, dotenv.

---

## Environment variables (`.env`)

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | yes | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | yes | Signing secrets (use long random strings) |
| `JWT_ACCESS_EXPIRES` / `JWT_REFRESH_EXPIRES` | no | Token lifetimes (default 15m / 30d) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | for uploads | Image hosting |
| `OPENAI_API_KEY` | for AI | Enables auto-tagging, embeddings, recommendations, semantic search |
| `OPENAI_VISION_MODEL` / `OPENAI_EMBEDDING_MODEL` | no | Defaults: `gpt-4o-mini`, `text-embedding-3-small` |
| `USE_ATLAS_VECTOR_SEARCH` | no | `true` to use Atlas Vector Search; otherwise in-memory cosine fallback |
| `CLIENT_URL` | no | Allowed CORS origin(s), comma-separated |

The server **fails fast** if `MONGODB_URI` or the JWT secrets are missing, and **warns but keeps
running** if Cloudinary / OpenAI are absent — AI features then degrade gracefully (no auto-tags or
embeddings; recommendations fall back to trending; semantic search falls back to keyword search).

---

## Authentication & authorization

- **Authentication:** JWT access tokens (short-lived) + refresh tokens (rotated, stored hashed in
  the DB so a leak can't mint sessions). Passwords are hashed with bcrypt (cost 12).
- **Authorization:**
  - `protect` — requires a valid access token.
  - `optionalAuth` — attaches the user if a token is present (for public endpoints with
    personalization).
  - `authorize('admin')` — role-based gate.
  - `authorizeOwnership(...)` — ownership gate: only the resource owner (or an admin) may
    edit/delete. Collaborative boards additionally allow listed collaborators to add/remove works.

Send the access token as `Authorization: Bearer <accessToken>`.

---

## API reference

Base URL: `/api`

### Auth (`/auth`)
| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/register` | – | `{ name, username, email, password, preferences? }` |
| POST | `/login` | – | `{ identifier, password }` (identifier = email or username) |
| POST | `/refresh` | – | `{ refreshToken }` |
| POST | `/logout` | – | `{ refreshToken }` |
| GET | `/me` | yes | – |

### Users (`/users`)
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/:username` | – | Public profile + stats |
| PUT | `/me` | yes | Update name/bio/avatar/preferences |
| GET | `/me/dashboard` | yes | Uploaded works, boards, saved works, totals |
| POST | `/:id/follow` | yes | Toggle follow |

### Works (`/works`)
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/` | – | Feed. Query: `page, limit, category, type, owner, sort=popular` |
| POST | `/` | yes | Create. `multipart/form-data` field `image` for images, or JSON for writing. AI auto-tags + embeds in background |
| GET | `/:id` | optional | Increments view count; logs activity |
| PUT | `/:id` | owner | Update fields |
| DELETE | `/:id` | owner | Deletes work + Cloudinary asset + comments/activity |
| POST | `/:id/like` | yes | Toggle like |
| POST | `/:id/save` | yes | Toggle save/bookmark |
| GET | `/:id/similar` | – | **AI similarity search** (nearest works by embedding) |

### Boards / Collections (`/boards`)
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/` | optional | Public boards, or `?mine=true` for yours |
| POST | `/` | yes | Create board (`isCollaborative` optional) |
| GET | `/:id` | optional | Board with populated works |
| PUT/DELETE | `/:id` | owner | Update / delete |
| POST | `/:id/works` | owner/collaborator | `{ workId }` |
| DELETE | `/:id/works/:workId` | owner/collaborator | Remove work |
| POST | `/:id/collaborators` | owner | `{ username }` |
| DELETE | `/:id/collaborators/:userId` | owner | Remove collaborator |

### Comments (`/comments`)
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/work/:workId` | – | List comments |
| POST | `/work/:workId` | yes | `{ text, parent? }` (one level of replies) |
| DELETE | `/:id` | author/work-owner/admin | Delete |

### Search (`/search`)
| Method | Path | Notes |
|---|---|---|
| GET | `/` | `q, category, type, page, limit`. Add `semantic=true` for **AI semantic search** |
| GET | `/categories` | Allowed categories for filter UIs |

### Recommendations (`/recommendations`)
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/` | yes | Personalized feed from your engagement (AI taste vector); falls back to trending |

### Insights (`/insights`) — Content Insights Dashboard
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/overview` | yes | Totals (views/likes/saves/comments) + top works |
| GET | `/trends?days=30` | yes | Daily time series for graphs (views/likes/saves/comments) |
| GET | `/works/:id?days=30` | owner | Per-work trend |

---

## AI features — how they work

1. **Auto-tagging & categorization** — on upload, images are sent to the OpenAI vision model and
   writing to the chat model, returning descriptive tags (e.g. `landscape`, `portrait`, `abstract`)
   and a suggested category. Stored as `aiTags` / `aiCategory` (kept separate from user `tags`).
2. **Embeddings** — each work is embedded (title + description + tags + content) and the vector is
   stored on the work.
3. **Similarity search** (`/works/:id/similar`) and **semantic search** (`/search?semantic=true`)
   — nearest neighbors by cosine similarity.
4. **Recommendations** (`/recommendations`) — averages the embeddings of works you liked/saved/viewed
   into a "taste vector," then finds similar works you haven't seen.
5. **Insights** (`/insights/*`) — aggregations over an `Activity` event log power the engagement
   trend graphs.

### Optional: MongoDB Atlas Vector Search

The app works out of the box with an in-memory cosine fallback. For scale, create an Atlas Vector
Search index named **`work_vector_index`** on the `works` collection:

```json
{
  "fields": [
    { "type": "vector", "path": "embedding", "numDimensions": 1536, "similarity": "cosine" }
  ]
}
```

Then set `USE_ATLAS_VECTOR_SEARCH=true`. (1536 = dimensions of `text-embedding-3-small`.)

---

## Project structure

```
backend/
  src/
    config/      env, db, cloudinary
    models/      User, Work, Board, Comment, Activity
    middleware/  auth, authorize, errorHandler
    controllers/ auth, user, work, board, comment, search, recommendation, insights
    routes/      one router per resource
    services/    aiService (OpenAI), vectorService (similarity)
    utils/       token, ApiError, asyncHandler, seed
    app.js       Express app (security, routes, error handling)
    server.js    bootstrap + graceful shutdown
```

## Security notes

helmet, CORS allowlist, `express-mongo-sanitize`, rate limiting on `/auth`, bcrypt password hashing,
hashed + rotated refresh tokens, and sensitive fields stripped from all JSON responses.
