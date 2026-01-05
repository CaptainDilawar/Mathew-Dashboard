# Mathew-Dashboard
A data analytics dashboard connecting sheets api, n8n.

---

## Vercel monorepo deployment (frontend + serverless backend)

Steps to deploy this repo as a monorepo on Vercel:

1. Import the repository into Vercel and make sure you **import the root** of the repository (so `vercel.json` is used).
2. When prompted for Build & Output settings, Vercel will use `vercel.json` to configure builds: the `frontend` folder is built as a static site and `backend/api/*.js` files are serverless endpoints.

Environment variables to set in Vercel (Project > Settings > Environment Variables):
- `GOOGLE_CREDENTIALS` — the full JSON from your `credentials.json` (stringify the JSON file contents).
- `GOOGLE_TOKEN` — the authorized user JSON (contains `refresh_token`) produced after you authorize the app locally (see below). This is required for serverless runtime to access Sheets/Drive.
- `VITE_API_URL` — optional. If set, the frontend will use this as API base. If not set, the app will use relative `/api/...` paths in production (recommended).

How to obtain `GOOGLE_TOKEN` (quick):
1. Run the existing local backend to perform OAuth once: `node backend/index.js`.
2. Follow the browser-based authorization flow; `token.json` will be created in `backend/`.
3. Copy the contents of `backend/token.json` and set it as the `GOOGLE_TOKEN` environment variable in Vercel (stringified JSON).

Security notes:
- Do not commit `credentials.json` or `token.json` to the repository. `.gitignore` already excludes `credentials.json` / `token.json` and we added explicit `/backend/credentials.json` and `/backend/token.json` entries.
- Serverless functions cannot write to local disk persistently; keep `GOOGLE_TOKEN` in a secure environment variable or use a managed secret store.

If you'd like, I can:
- Add a short script to help you generate the `GOOGLE_TOKEN` JSON, or
- Implement an OAuth web flow that exchanges authorization codes and stores tokens in an external DB.

