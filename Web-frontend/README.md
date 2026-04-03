# Web Frontend — Task Management

Responsive Next.js web app for the Task Management backend.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Axios (with interceptors)
- React Hot Toast (notifications)

---

## Prerequisites

- Node.js 18+
- Backend running on port `4000`

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

```bash
cp .env.example .env.local
```

Your `.env.local` should contain:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

> If your backend runs on a different port, update this value.

### 3. Start the dev server

```bash
npm run dev
```

App runs at `http://localhost:3000`

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Redirects to login or dashboard |
| `/login` | Login page |
| `/register` | Register page |
| `/dashboard` | Main task dashboard (protected) |

---

## Features

- Login and Register connected to backend API
- Access token stored in localStorage
- Automatic token refresh on 401 (Axios interceptor)
- Request queue during refresh — no duplicate refresh calls
- Session restored on page reload
- Task dashboard with:
  - Create, edit, delete, toggle tasks
  - Filter by status (All / Pending / Completed)
  - Search by title (debounced)
  - Pagination
  - Loading skeletons
- Toast notifications for all actions
- Fully responsive (mobile + desktop)

---

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production build
```

---

## Important

Make sure the **backend is running first** before starting the frontend, otherwise API calls will fail.
