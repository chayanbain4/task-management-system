# Task Management System — Software Engineering Assessment

A complete **Task Management System** built for the assessment requirements — including the mandatory backend, **both** Track A (Web) and Track B (Flutter mobile app).

---

## What is included

### Backend (Mandatory)
- Node.js + TypeScript + Express
- Prisma ORM + PostgreSQL
- JWT access token + refresh token authentication
- bcrypt password hashing
- Full task CRUD scoped to authenticated user
- Pagination, filtering by status, and title search on `GET /tasks`
- Zod validation + standard HTTP error handling

### Track A — Web Frontend (Next.js)
- Login and registration pages
- Auto session restore using refresh token
- Access token auto-refresh on 401 (Axios interceptor)
- Task dashboard with create, edit, delete, toggle, search, filter, pagination
- Responsive design (mobile + desktop)
- Toast notifications for all actions

### Track B — Flutter Mobile App
- Login and registration screens with animated gradient UI
- Secure token storage using `flutter_secure_storage`
- Auto token refresh on 401 with request retry (Dio interceptor)
- Task list with `ListView.builder`, pull-to-refresh, infinite scroll
- Add, edit, delete, toggle task status
- Filter by status + debounced search by title
- Delete confirmation dialog
- Snackbar error handling (401, 500, network errors)
- Riverpod state management with layered architecture (UI → Controller → Repository → API)

---

## Project Structure

```text
task-management-system/
  backend/              # Node.js + TypeScript API
  Web-frontend/         # Next.js web app (Track A)
  Flutter-frontend/     # Flutter mobile app (Track B)
  docker-compose.yml    # PostgreSQL via Docker (optional)
  README.md
```

---

## Backend Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout |

### Tasks (Bearer token required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | List tasks (pagination, filter, search) |
| POST | `/tasks` | Create task |
| GET | `/tasks/:id` | Get single task |
| PATCH | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |
| PATCH | `/tasks/:id/toggle` | Toggle task status |

---

## 1) Backend Setup

### Option A — PostgreSQL via Docker (easiest)

```bash
docker-compose up -d
```

### Option B — Local PostgreSQL

```bash
createdb task_management
```

### Then run the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/task_management?schema=public
JWT_ACCESS_SECRET=replace_with_a_long_random_access_secret
JWT_REFRESH_SECRET=replace_with_a_long_random_refresh_secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
COOKIE_SECURE=false
```

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Backend runs at `http://localhost:4000`

---

## 2) Web Frontend Setup (Track A)

```bash
cd Web-frontend
cp .env.example .env.local
npm install
npm run dev
```

App runs at `http://localhost:3000`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

> Make sure the backend is running first.

---

## 3) Flutter App Setup (Track B)

```bash
cd Flutter-frontend
flutter pub get
flutter run
```

> The app connects to `http://10.0.2.2:4000` by default (Android emulator alias for localhost).

### Running on physical Android device

Find your computer IP (`ifconfig` on Mac, `ipconfig` on Windows) and run:

```bash
flutter run --dart-define=API_BASE_URL=http://YOUR_IP:4000
```

### Running on iOS simulator

```bash
flutter run --dart-define=API_BASE_URL=http://localhost:4000
```

See `Flutter-frontend/README.md` for full Flutter setup instructions.

---

## 4) GitHub Rules

Safe to push:
- Source code
- Prisma schema + migrations
- `.env.example`
- README files

Do NOT push:
- `.env` or `.env.local`
- `node_modules/`
- `build/`
- Database data or secrets

---

## 5) Assessment Coverage

| Requirement | Status |
|-------------|--------|
| Node.js + TypeScript backend | ✅ |
| SQL database with Prisma ORM | ✅ |
| JWT access + refresh tokens | ✅ |
| bcrypt password hashing | ✅ |
| Auth endpoints (register, login, refresh, logout) | ✅ |
| Task endpoints (CRUD + toggle) | ✅ |
| Pagination, filtering, searching | ✅ |
| Next.js web frontend (Track A) | ✅ |
| Login + registration pages | ✅ |
| Responsive task dashboard | ✅ |
| Task CRUD + toast notifications | ✅ |
| Flutter mobile app (Track B) | ✅ |
| Secure token storage | ✅ |
| Auto token refresh on 401 | ✅ |
| ListView.builder + pull-to-refresh | ✅ |
| Riverpod layered architecture | ✅ |
| CRUD + snackbar error handling | ✅ |