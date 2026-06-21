# Chitram — Frontend

React (Vite) + Tailwind CSS frontend for **Chitram (Gallery of Wonders)**, wired to the Express/MongoDB
backend in `../backend`. Clean white canvas, bold editorial type, and vivid Indian-art accent colors
(royal blue, magenta, olive, ink).

## Quick start

```bash
cd frontend
npm install
npm run dev           # http://localhost:5173
```

Make sure the backend is running on port 5000 (`cd ../backend && npm run dev`). Vite proxies all
`/api` requests to it, so there are no CORS issues in development.

To point at a deployed backend instead, copy `.env.example` to `.env` and set `VITE_API_URL`.

## Landing-page images

Drop your artwork into `public/gallery/` named `art-1.jpg … art-5.jpg` (hero strip) and
`art-6.jpg … art-13.jpg` (optional mosaic). See `public/gallery/README.txt`. Missing images
fall back to soft gradients, so the page never looks broken.

## Pages

- **/** — Landing (hero, image strip, "Why Choose Chitram" cards, CTA)
- **/discover** — Gallery feed with category filters, keyword + AI semantic search, and personalized recommendations
- **/works/:id** — Work detail: media/writing, like/save, tags (incl. AI tags), comments, add-to-board, AI "similar works"
- **/collections** — Boards (public + yours), create board (incl. collaborative)
- **/boards/:id** — Board detail: works, remove works, manage collaborators
- **/saved** — Your bookmarked works _(auth)_
- **/dashboard** — Content insights: stat cards, engagement-trend chart (recharts), manage your works/boards _(auth)_
- **/upload** — Publish an image (Cloudinary) or writing; AI auto-tags on publish _(auth)_
- **/u/:username** — Public profile + follow
- **/login**, **/register** — Auth

## How it's wired

- `src/api/client.js` — axios instance. Attaches the JWT access token, and on a 401 automatically
  refreshes (rotating refresh token) once and replays the request. Tokens live in `localStorage`.
- `src/api/endpoints.js` — typed wrappers for every backend route.
- `src/context/AuthContext.jsx` — session state, login/register/logout, restores session on load.
- `src/context/ToastContext.jsx` — lightweight toast notifications.
- `src/components/ProtectedRoute.jsx` — gates `/upload`, `/saved`, `/dashboard`.

## Design tokens (`tailwind.config.js`)

Colors: `royal`, `magenta`, `olive`, `ink`, `cream`. Fonts: `display` (Archivo, headlines),
`brand` (Baloo 2, the Chitram wordmark), `mono` (Space Mono, labels/nav), `sans` (Inter, body).
Reusable component classes (`.btn-primary`, `.btn-outline`, `.input`, `.label`, `.container-x`,
`.masonry`) live in `src/index.css`.

## Tech

react, react-dom, react-router-dom, axios, recharts, lucide-react · Vite, Tailwind CSS, PostCSS.
