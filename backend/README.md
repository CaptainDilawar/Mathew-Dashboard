# Backend (standalone)

This is the backend service for the Lead Generation Dashboard. It exposes these endpoints:
- `POST /api/login` - simple username/password login using `APP_USERNAME`/`APP_PASSWORD` env values
- `GET /api/spreadsheets` - lists Google Drive spreadsheets (requires Google API auth)
- `GET /api/sheets/:sheetId` - fetches sheet data
- `GET /api/sheets/:sheetId/metadata` - lists sheet tabs
- `GET /health` - health check

## Quick start (local)

1. Install dependencies

```bash
cd backend
npm install
```

2. Create `.env` (or set environment variables)

Use `.env.example` as a template. At minimum set:
```
APP_USERNAME=admin
APP_PASSWORD=password
FRONTEND_ORIGIN=http://localhost:5173
```

3. (Optional) Google API
- Place `credentials.json` (OAuth client) inside `backend/` if you want to use local OAuth flow.
- To pre-generate a `GOOGLE_TOKEN` for deployments, run:
  ```bash
  node generate-token.js
  ```
  Copy the printed JSON into an environment variable `GOOGLE_TOKEN` on the server.

4. Start

```bash
npm start
```

The server will run on `http://localhost:3001` by default.

## Docker

To build and run using Docker (production):

```bash
# build
docker build -t leadgen-backend ./backend

# run (set envs as necessary)
docker run -p 3001:3001 \
  -e APP_USERNAME=admin \
  -e APP_PASSWORD=password \
  -e FRONTEND_ORIGIN=https://your-frontend.example.com \
  -e GOOGLE_TOKEN="{...}" \
  leadgen-backend
```

## Notes
- `FRONTEND_ORIGIN` controls CORS; set it to your production frontend URL.
- If `GOOGLE_TOKEN` is set, the backend will use it instead of prompting for local OAuth.
