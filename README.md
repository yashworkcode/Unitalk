# UniTalk — full stack

A real-time, translation-first messaging app.

```
unitalk-fullstack/
├── frontend/   React + TypeScript + Vite client (Socket.IO client, REST API client)
├── backend/    Express + Socket.IO + MongoDB server, live translation engine
└── package.json  root scripts to install/run both together
```

Each half also has its own README with full details:
- `frontend/README.md`
- `backend/README.md`

## 1. Prerequisites

- Node.js 18+
- A MongoDB database — either install MongoDB locally, or create a free
  cluster at [MongoDB Atlas](https://www.mongodb.com/atlas) (no credit card
  required for the free tier) and copy its connection string.

## 2. One-time setup

```bash
cd unitalk-fullstack

# install dependencies for the root, backend, and frontend
npm install
npm run install:all

# backend config
cp backend/.env.example backend/.env
# open backend/.env and set:
#   MONGODB_URI=<your connection string>
#   JWT_SECRET=<any long random string>

# frontend config
cp frontend/.env.local.example frontend/.env.local
# defaults already point at http://localhost:5000, matching the backend's default PORT
```

## 3. Run everything

```bash
npm run dev
```

This starts the backend (`http://localhost:5000`) and frontend
(`http://localhost:5173`) together, with labeled, color-coded logs. Open
`http://localhost:5173` in your browser.

Run them separately if you'd rather see each in its own terminal:

```bash
npm run dev:backend
npm run dev:frontend
```

### Try it with two accounts

```bash
npm run seed
```

Creates two demo accounts — `ari@example.com` and `mateo@example.com`, both
with password `password123`, one set to English and one to Spanish. Log in
as one in a normal browser window and the other in a private/incognito
window to watch live translated messaging between them.

## 4. What's implemented

**Auth** — register, login, forgot/reset password (JWT-based), persisted
session on reload.

**Contacts & conversations** — search by name/username/user ID, start a
1:1 conversation, set a per-conversation translation language, remove a
conversation from your own list.

**Real-time messaging** — Socket.IO delivers messages instantly; text,
images, video, and voice notes are all supported (sent as data URLs, no
separate upload step needed). Presence (online/offline) and typing events
are wired up too.

**Live translation** — every message is translated server-side into each
recipient's chosen language for that conversation, both for messages
arriving in real time and when loading chat history. See
`backend/src/services/translationService.js` — it uses a free translation
API by default, is swappable to LibreTranslate or an offline dictionary via
one env var, and always has an offline fallback so a translation hiccup
never blocks message delivery.

**Profile & settings** — editable profile (name, bio, country, avatar,
default chat language), notification/appearance/translation preferences,
light/dark theme, app language.

## 5. Deploying

- **Backend**: any Node host works (Render, Railway, Fly.io, a VPS...).
  Set the same env vars as `.env`, point `MONGODB_URI` at your production
  database, and set `CLIENT_ORIGIN` to your deployed frontend's URL.
- **Frontend**: `npm run build:frontend` produces a static `frontend/dist`
  folder deployable to Vercel, Netlify, or any static host. Set
  `VITE_API_URL` / `VITE_SOCKET_URL` (in that host's env config, or a
  `.env.production` file) to your deployed backend's URL before building.
