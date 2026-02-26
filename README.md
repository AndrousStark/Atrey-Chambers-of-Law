## Fullstack React + NestJS Website

This repo is a small fullstack website with a **React** frontend and a **NestJS** backend, organized in a simple monorepo layout.

- **frontend**: Vite + React + React Router single page app with a central landing page and a few extra pages.
- **backend**: Minimal NestJS app exposing a JSON API the frontend home page calls.

### Directory structure

```text
.
├── package.json           # Root workspace config + dev scripts
├── frontend/              # React SPA
│   ├── package.json
│   ├── index.html
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── styles.css
│       └── pages/
│           ├── HomePage.tsx
│           ├── AboutPage.tsx
│           ├── ServicesPage.tsx
│           └── ContactPage.tsx
└── backend/               # NestJS API
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.build.json
    └── src/
        ├── main.ts
        ├── app.module.ts
        └── app.controller.ts
```

### Install dependencies

From the project root:

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

You can also manage `frontend` and `backend` independently if you prefer.

### Run the apps (development)

In **two terminals**:

Terminal 1 – NestJS backend:

```bash
cd backend
npm run start:dev
```

Terminal 2 – React frontend:

```bash
cd frontend
npm run dev
```

Then open the URL that Vite prints (usually `http://localhost:5173`).

- The React app will call the backend at `/api` (proxied to `http://localhost:3000/api`).
- The NestJS API lives on port `3000` by default.

### Key routes

- **Frontend (React)**  
  - `/` – Central landing page, calls backend API and displays its message.  
  - `/about` – Simple about page.  
  - `/services` – Services list.  
  - `/contact` – Contact form (demo only, does not submit anywhere).

- **Backend (NestJS)**  
  - `GET /` – Simple JSON welcome from backend root.  
  - `GET /ping` – Health-style endpoint.  
  - `GET /api` – Message read by the React home page.


