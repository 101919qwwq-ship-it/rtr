# Droid CRUD — Railway-ready project
Stack: Node.js, Express, PostgreSQL, simple SQL migrations (custom runner)

## What you get
- Single deployable project that serves frontend and REST API from one URL.
- Migrations are applied automatically on start (Procfile runs migrations before server).
- Uses DATABASE_URL environment variable (Railway provides it).

## Endpoints
- GET  /api/droids
- GET  /api/droids/:id
- POST /api/droids
- PUT  /api/droids/:id
- DELETE /api/droids/:id

## Fields (droid)
- id (serial primary key)
- name (text, required)
- type (text, required)
- manufacturer (text)
- year_production (int)
- status (text)

## Local run
1. Install Node.js (v16+)
2. Copy `.env.example` -> `.env` and set DATABASE_URL
3. Install deps:
   ```
   npm install
   ```
4. Run migrations + server:
   ```
   npm run start
   ```
5. Open `http://localhost:3000`

## Deploy to Railway
- Create new project, set up PostgreSQL plugin (or provide DATABASE_URL).
- Deploy from GitHub or upload this project.
- Railway sets `DATABASE_URL`. The Procfile runs migrations on each deploy.
- After deploy, open the generated URL.
