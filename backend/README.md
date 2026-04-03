# Backend — Task Management API

Node.js REST API with JWT authentication and full task CRUD.

## Tech Stack

- Node.js + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- JWT (access + refresh tokens)
- bcrypt (password hashing)
- Zod (request validation)

---

## Prerequisites

- Node.js 18+
- PostgreSQL running locally

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

```bash
cp .env.example .env
```

Then open `.env` and fill in your values:

```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/task_management?schema=public
JWT_ACCESS_SECRET=my_super_long_access_secret_123456789
JWT_REFRESH_SECRET=my_super_long_refresh_secret_987654321
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
COOKIE_SECURE=false
```

> Replace `yourpassword` with your PostgreSQL password.

### 3. Create the database

Make sure PostgreSQL is running, then create the database:

```bash
psql -U postgres -c "CREATE DATABASE task_management;"
```

### 4. Run migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Start the server

```bash
npm run dev
```

Server runs at `http://localhost:4000`

---

## API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout |

### Tasks (require Bearer token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | List tasks (pagination, filter, search) |
| POST | `/tasks` | Create task |
| GET | `/tasks/:id` | Get single task |
| PATCH | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |
| PATCH | `/tasks/:id/toggle` | Toggle task status |

### Query params for GET /tasks

| Param | Type | Example |
|-------|------|---------|
| `page` | number | `?page=1` |
| `limit` | number | `?limit=10` |
| `status` | string | `?status=PENDING` |
| `search` | string | `?search=meeting` |

---

## Available Scripts

```bash
npm run dev          # Start development server (hot reload)
npm run build        # Compile TypeScript
npm run start        # Run compiled build
npx prisma studio    # Open Prisma DB GUI
```

---

## Using Docker (optional)

If you have Docker, you can start PostgreSQL without installing it:

```bash
docker-compose up -d
```

Then skip the database creation step and go straight to migrations.
