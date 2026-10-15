# Chitram

**Chitram (Gallery of Wonders)** is a full-stack creative-works gallery where people can publish art, photography, and writing, discover new work, build collections, and connect with other creators.

The project combines a React frontend with an Express REST API, MongoDB persistence, Cloudinary media storage, and optional OpenAI-powered discovery features.

## Features

- Browse and filter a gallery of creative works
- Upload images or publish writing
- User profiles, following, likes, saves, and comments
- Public, private, and collaborative boards
- Keyword search and optional semantic search
- AI-assisted tags, recommendations, and similar-work discovery
- Creator insights with views, likes, saves, comments, and trends
- JWT authentication with rotating refresh tokens

## Stack

- **Frontend:** React 18, Vite, React Router, Tailwind CSS, Recharts, Axios
- **Backend:** Node.js, Express, Mongoose, MongoDB
- **Services:** Cloudinary for uploads; OpenAI for optional AI features
- **Deployment:** Vercel configuration is included for both `frontend/` and `backend/`

## Project structure

```text
.
├── backend/       Express API, database models, services, and authentication
├── frontend/      React/Vite client application
├── package.json   Root development commands
└── README.md
```

More detailed documentation is available in [backend/README.md](backend/README.md) and [frontend/README.md](frontend/README.md).

## Requirements

- Node.js 18 or newer
- npm
- A MongoDB database, preferably MongoDB Atlas
- Cloudinary credentials for image uploads
- An OpenAI API key for AI features (optional)

## Local setup

### 1. Install dependencies

From the repository root:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 2. Configure the backend

Copy the example environment file and fill in the required values:

```bash
copy backend\.env.example backend\.env
```

On macOS/Linux, use:

```bash
cp backend/.env.example backend/.env
```

At minimum, set:

```env
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=replace_with_a_long_random_secret
JWT_REFRESH_SECRET=replace_with_a_different_long_random_secret
```

Cloudinary variables are needed for image uploads. `OPENAI_API_KEY` is optional; without it, AI features use their documented fallback behavior.

### 3. Configure the frontend

The development default works with the local backend proxy:

```env
VITE_API_URL=/api
```

To use a deployed API, create `frontend/.env` from `frontend/.env.example` and set `VITE_API_URL` to the backend base URL.

### 4. Start the application

Run both services from the root:

```bash
npm run dev
```

The frontend is available at [http://localhost:5173](http://localhost:5173). The API runs at [http://localhost:5000](http://localhost:5000).

Verify the API with:

```text
GET http://localhost:5000/api/health
```

You can also run each package independently:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

## Available scripts

### Root

| Command | Description |
|---|---|
| `npm run dev` | Start the backend and frontend together |
| `npm start` | Start the backend and serve the frontend preview |

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start the API with Nodemon |
| `npm start` | Start the API in production mode |
| `npm run seed` | Load the available demo data |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |

## Environment variables

Backend configuration is documented in [backend/.env.example](backend/.env.example):

- `MONGODB_URI` and JWT secrets are required.
- `CLIENT_URL` controls the allowed frontend origin(s).
- Cloudinary variables enable image uploads.
- `OPENAI_API_KEY` enables tagging, embeddings, recommendations, and semantic search.
- `USE_ATLAS_VECTOR_SEARCH=true` enables the optional Atlas Vector Search index.

Frontend configuration is documented in [frontend/.env.example](frontend/.env.example):

- `VITE_API_URL` sets the API base URL. Keep `/api` for local development.

Never commit `.env` files or production credentials.

## Deployment

The project includes separate Vercel configurations:

1. Deploy `backend/` as the API project and configure its environment variables.
2. Deploy `frontend/` as the web project.
3. Set the frontend `VITE_API_URL` to the deployed backend API URL.
4. Set the backend `CLIENT_URL` to the deployed frontend URL.

For production AI similarity search at scale, create the `work_vector_index` Atlas Search index described in [backend/README.md](backend/README.md).

## License

The backend package is published under the MIT license. See `backend/package.json` for the package metadata.
