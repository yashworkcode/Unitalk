# UniTalk frontend

A responsive React + TypeScript front-end for a translation-first messaging product.

## Run locally

```bash
npm install
npm run dev
```

## Feature modules

- `src/modules/chat` — inbox, chat thread, translation controls, reactions, and composer
- `src/modules/discovery` — search by name, username, or User ID plus friend requests
- `src/modules/navigation` — app sidebar and adaptive navigation
- `src/modules/profile` — contact profile, shared media, profile actions, and copyable IDs
- `src/modules/settings` — language/translation and appearance preferences
- `src/modules/shared` — accessible icon and avatar primitives
- `src/modules/data` — typed local demo data; replace with API/query hooks when connecting the backend

The interactive flows are intentionally client-side demos: sending messages, adding friends, copying user IDs, toggling translation/original text, switching colour mode, and opening settings all work without a service. Clear inline comments mark the handoff points for API, auth, Socket.IO, and persistence work.
