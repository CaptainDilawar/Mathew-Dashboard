# Frontend (standalone)

This folder is a self-contained React frontend built with Vite that communicates with the backend via `VITE_API_URL`.

## Quick start (dev)

1. Install dependencies

```bash
cd frontend
npm install
```

2. Run dev server

```bash
npm run dev
```

Dev server will typically run at `http://localhost:5173` and will contact the backend at `http://localhost:3001` by default.

## Production build

Set `VITE_API_URL` at build time to the public URL of your backend. Example:

```bash
# for Linux/macOS
VITE_API_URL=https://api.example.com npm run build

# Windows (PowerShell)
$env:VITE_API_URL = "https://api.example.com"; npm run build
```

`dist/` will contain the static files. Serve or deploy them to your static host.

## Docker (static hosting with Nginx)

```bash
# build image
docker build -t leadgen-frontend ./frontend

# run
# (Nginx serves the built assets; set VITE_API_URL at build time before building)
docker run -p 80:80 leadgen-frontend
```

## Note
- In dev the frontend defaults to `http://localhost:3001` for the API base, and the backend should set `FRONTEND_ORIGIN` to `http://localhost:5173` so CORS allows requests.
