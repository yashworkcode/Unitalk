# UniTalk backend

Express + Socket.IO + MongoDB backend for the UniTalk frontend. It implements
every REST endpoint and socket event the frontend already calls (see
`src/modules/api/client.ts` and `src/modules/api/socket.ts` in the frontend
project) — auth, user search/profile/settings, 1:1 conversations, message
history, and **live message translation** on both the REST history endpoint
and the real-time socket path.

## 1. Requirements

- Node.js 18+
- A MongoDB database (local `mongod`, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

## 2. Setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and set at minimum:

- `MONGODB_URI` — your MongoDB connection string
- `JWT_SECRET` — any long random string
- `CLIENT_ORIGIN` — the URL your frontend runs on (`http://localhost:5173` by default with Vite)

Everything else has a sane default for local development (see comments in
`.env.example`), including password-reset emails, which print to the console
if no SMTP server is configured.

## 3. Run it

```bash
npm run dev      # auto-restarts on file changes (node --watch)
npm start        # plain node
```

The API listens on `http://localhost:5000/api` and Socket.IO on the same
port, matching the frontend's default `.env.local.example`.

Optional: `npm run seed` creates two demo accounts (`ari@example.com` /
`mateo@example.com`, password `password123`) so you can log in with two
browser windows and message yourself immediately.

## 4. How real-time translation works

`src/services/translationService.js` is the single place translation
happens. Four providers are built in, swappable via one env var:

- **`TRANSLATION_PROVIDER=google-cloud` (default, use this for a live site)**
  — the official Google Cloud Translation API. Reliable, has an actual
  SLA, free tier covers 500,000 characters/month. Requires
  `GOOGLE_TRANSLATE_API_KEY` — see the **"Going live on Render"** section
  below for the exact steps to get one.
- `TRANSLATION_PROVIDER=google-free` — the public, keyless
  `translate.googleapis.com` trick endpoint. No key needed, fine for a
  quick local test, but unofficial with no SLA — it can rate-limit or block
  you without warning. **Don't use this for a live/production site.**
- `TRANSLATION_PROVIDER=libretranslate` — point `LIBRETRANSLATE_URL` at a
  self-hosted or public [LibreTranslate](https://libretranslate.com) instance
  (add `LIBRETRANSLATE_API_KEY` if it requires one).
- `TRANSLATION_PROVIDER=none` — uses only the small bundled phrase
  dictionary (no network calls at all, very limited coverage).

If the configured provider ever fails for any reason (bad key, network
hiccup, quota hit), the service automatically falls back to the offline
phrase dictionary so a message is never lost — it just won't be translated
as richly until the underlying issue is fixed.

If the live provider ever fails (network hiccup, rate limit, offline dev
environment) the service automatically falls back to the same bundled
phrase dictionary so a message is never lost — it's just translated less
richly. Results are cached in memory per (text, target language) pair to
avoid re-translating repeated phrases.

**Translation direction — auto-detect, not "always assume English":** every
participant in a chat has their own target language for that conversation
(`chatsApi.changeLanguage`). When a message is sent, the backend first
**detects whatever language the sender actually typed in** (the live
providers do this in the same request via `sl=auto`; the offline fallback
uses the `franc-min` library) and only translates it if that differs from
the *recipient's* chosen language — so if someone writes `"te amo"`, it's
detected as Spanish and translated straight into whatever language the
recipient prefers (German, Japanese, English, anything), not the other way
around, and not skipped just because the target happens to be English. If
the sender is already typing in the recipient's language, the text is left
untouched instead of being needlessly re-translated. Both the original text
(for the sender's own view) and the translated text (for the recipient's
view) are stored/broadcast in a single socket payload — exactly the
`{ me, them }` shape `src/modules/api/socket.ts` already expects.

Note: the offline dictionary fallback (`TRANSLATION_PROVIDER=none`, or what
kicks in if a live provider request fails) is a small phrase list, so it
only recognizes phrases in that list and can misjudge very short, ambiguous
text (e.g. "te amo" reads as valid Spanish *or* Portuguese to a statistical
detector). The default `google-free` provider does real detection across
any language pair and doesn't have this limitation.

## 5. REST API

All endpoints are prefixed with `/api`. Authenticated ones expect
`Authorization: Bearer <token>`.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | – | Liveness check |
| POST | `/auth/register` | – | Create an account, returns `{ token, user }` |
| POST | `/auth/login` | – | `{ token, user }` |
| POST | `/auth/forgot-password` | – | Sends (or logs) a reset link |
| POST | `/auth/reset-password/:token` | – | Sets a new password |
| GET | `/auth/me` | ✓ | Current user |
| POST | `/auth/logout` | ✓ | Marks the user offline |
| GET | `/users/search?q=` | ✓ | Search by name/username/user id |
| GET | `/users/online` | ✓ | Currently online users |
| PATCH | `/users/me` | ✓ | Update name/bio/country/avatar/chatLanguage |
| PATCH | `/users/me/settings` | ✓ | Update translation/appearance settings |
| GET | `/chats` | ✓ | List conversations |
| POST | `/chats` | ✓ | Start a conversation: `{ username, language }` |
| PATCH | `/chats/:chatId/language` | ✓ | Change this chat's translation target language |
| DELETE | `/chats/:chatId` | ✓ | Hide the conversation for the caller only |
| GET | `/messages/:chatId` | ✓ | Full history, pre-translated for the caller |

## 6. Socket.IO events

Connect with `io(SOCKET_URL, { auth: { token } })` — same as
`src/modules/api/socket.ts` already does.

**Client → server**
- `chat:join { chatId }` / `chat:leave { chatId }`
- `chat:typing { chatId }`
- `message:send { chatId, text, messageType, attachment? }`
- `chat:language-changed { chatId, language }` (informational, REST already persists it)

**Server → client**
- `message:receive { id, chatId, senderId, messageType, attachment, createdAt, me, them }`
- `chat:preview { chatId, preview, time }`
- `user:online { userId }` / `user:offline { userId }`
- `user:typing { userId, chatId }`
- `message:error { message }`

## 7. Project layout

```
server.js                  entrypoint: DB connect -> HTTP + Socket.IO
src/app.js                 Express app (middleware + routes)
src/config/db.js           Mongoose connection
src/models/                User, Chat, Message schemas
src/controllers/           Route handlers
src/routes/                Route wiring
src/middleware/            JWT auth guard, error handler
src/services/               translationService.js, emailService.js
src/socket/chatSocket.js   Socket.IO auth + all real-time events
src/utils/                 id/token helpers, seed script
```

## 8. Going live on Render (so translation actually works)

1. **Get a Google Cloud Translation API key**
   - Go to [console.cloud.google.com](https://console.cloud.google.com), create a project (or pick an existing one)
   - Enable the API: [console.cloud.google.com/apis/library/translate.googleapis.com](https://console.cloud.google.com/apis/library/translate.googleapis.com)
   - Create a key: [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) → **Create Credentials → API key**
   - Click the new key → under **API restrictions**, restrict it to **Cloud Translation API** only (good practice, costs nothing extra)
   - Billing must be enabled on the project for the API to work, but the first 500,000 characters/month are free — a small/medium chat app is very unlikely to exceed that.

2. **Create the Render Web Service** (for this `backend` folder)
   - New → Web Service → connect your repo, set **Root Directory** to `backend`
   - Build command: `npm install`
   - Start command: `npm start`

3. **Set these environment variables in Render's dashboard** (Settings → Environment):
   ```
   MONGODB_URI=<your MongoDB Atlas connection string>
   JWT_SECRET=<a long random string>
   CLIENT_ORIGIN=<your deployed frontend's URL, e.g. https://your-app.vercel.app>
   TRANSLATION_PROVIDER=google-cloud
   GOOGLE_TRANSLATE_API_KEY=<the key from step 1>
   ```
   (Render sets `PORT` automatically — you don't need to set it yourself.)

4. **Deploy the frontend** somewhere static (Vercel/Netlify/Render Static
   Site) with `VITE_API_URL` and `VITE_SOCKET_URL` pointing at your Render
   backend's URL (e.g. `https://your-backend.onrender.com`).

That's it — with a real `GOOGLE_TRANSLATE_API_KEY` set, translation will
work reliably on the live site instead of depending on the unofficial
free endpoint.

## 9. Connecting the frontend

In the frontend project, copy `.env.local.example` to `.env.local` — it
already points at `http://localhost:5000`, matching this backend's default
`PORT`. Start this backend first, then `npm run dev` in the frontend.
