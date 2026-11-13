# GREEN-API Telegram chat

A minimal web chat that sends and receives Telegram text messages through [GREEN-API](https://green-api.com).

- `greenapi-back`: NestJS + PostgreSQL. Talks to GREEN-API, stores chats and messages, pushes live updates.
- `greenapi-front`: the chat UI. React 19, TypeScript, Vite, React Router, TanStack Query (data fetching and cache), Server-Sent Events for live updates, CSS Modules + Sass, Radix UI (dialog, menu).

You need Docker, Node.js 22+ and pnpm.

## Backend

### Launch

```bash
cd greenapi-back
cp .env.example .env
docker compose up --build
```

Before starting, open `.env` and fill in `DB_USER`, `DB_PASSWORD` and `DB_NAME` with any values you like (for example `postgres` / `postgres` / `greenapi`). Docker creates the database with them.

The API runs on `http://localhost:3000/api`.

### Configure

Everything is in `greenapi-back/.env`:

| Variable                            | What it is                                                                              |
| ----------------------------------- | --------------------------------------------------------------------------------------- |
| `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Postgres credentials (required)                                                         |
| `GREEN_API_URL`                     | Your instance's API host, shown in the GREEN-API console as `apiUrl`                    |
| `FRONTEND_ORIGIN`                   | Where the frontend runs. Default `http://localhost:5173`                                |
| `PORT`                              | API port. Default `3000`. If you change it, also update `greenapi-front/vite.config.ts` |

## Frontend

### Launch

```bash
cd greenapi-front
pnpm install
pnpm dev
```

Open `http://localhost:5173`. The backend must be running.

### Log in with your own instance

1. In the [GREEN-API console](https://console.green-api.com), create a **Telegram** instance and link it to your Telegram account.
2. Copy its `idInstance` and `apiTokenInstance`.
3. Paste them into the login screen.
4. Press the **+** button, enter a phone number, and start chatting.

On the first login GREEN-API may restart the instance, which can take up to 5 minutes. Messages sent during that time arrive once it's back.
