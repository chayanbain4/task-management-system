🚀 Task Management System

A full-stack Task Management System built with modern technologies, featuring a secure backend API, a responsive web application, and a cross-platform mobile app.

This project demonstrates real-world application architecture, authentication workflows, and scalable design patterns.

📌 Features
🔐 Authentication
User registration & login
Secure password hashing using bcrypt
JWT-based authentication (Access + Refresh tokens)
Automatic session restoration
Token refresh on expiration (401 handling)
✅ Task Management
Create, update, delete tasks
Toggle task completion status
User-specific task isolation
Pagination for large datasets
Search tasks by title
Filter tasks by status
🛠 Tech Stack
Backend
Node.js + TypeScript
Express.js
PostgreSQL
Prisma ORM
JWT Authentication
Zod Validation
Web Frontend
Next.js
Axios (API handling)
Responsive UI design
Mobile App
Flutter
Riverpod (State Management)
Dio (HTTP Client)
Secure Storage
📁 Project Structure
task-management-system/
│
├── backend/              # Node.js + TypeScript API
├── Web-frontend/         # Next.js web app
├── Flutter-frontend/     # Flutter mobile app
├── docker-compose.yml    # PostgreSQL setup (optional)
└── README.md
⚙️ API Endpoints
Authentication
Method	Endpoint	Description
POST	/auth/register	Register user
POST	/auth/login	Login
POST	/auth/refresh	Refresh token
POST	/auth/logout	Logout
Tasks (Protected)
Method	Endpoint	Description
GET	/tasks	Get tasks (pagination, filter, search)
POST	/tasks	Create task
GET	/tasks/:id	Get task
PATCH	/tasks/:id	Update task
DELETE	/tasks/:id	Delete task
PATCH	/tasks/:id/toggle	Toggle status
🚀 Getting Started
1️⃣ Backend Setup
Option A: Docker (Recommended)
docker-compose up -d
Option B: Local PostgreSQL
createdb task_management
Run Backend
cd backend
cp .env.example .env

Update .env:

PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/task_management?schema=public
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
COOKIE_SECURE=false
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev

👉 Backend runs on: http://localhost:4000

2️⃣ Web Frontend Setup
cd Web-frontend
cp .env.example .env.local
npm install
npm run dev

Add in .env.local:

NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

👉 Web app runs on: http://localhost:3000

3️⃣ Flutter App Setup
cd Flutter-frontend
flutter pub get
flutter run
Emulator (Default)
http://10.0.2.2:4000
Physical Device
flutter run --dart-define=API_BASE_URL=http://YOUR_IP:4000
iOS Simulator
flutter run --dart-define=API_BASE_URL=http://localhost:4000
🔒 Security Practices
Passwords hashed using bcrypt
JWT authentication with expiration handling
Refresh token mechanism for session persistence
Protected API routes with middleware
Environment variables for sensitive data
📦 GitHub Guidelines
✅ Include
Source code
Prisma schema & migrations
.env.example
Documentation
❌ Exclude
.env / .env.local
node_modules/
Build files
Secrets or credentials
🌟 Highlights
Full-stack architecture (Backend + Web + Mobile)
Clean and scalable code structure
Advanced authentication flow (JWT + refresh tokens)
Real-world API features (search, filter, pagination)
Cross-platform implementation using Flutter
👨‍💻 Author

Chayan Bain
Full Stack Developer (MERN + Flutter)
