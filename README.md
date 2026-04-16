# 🚀 Task Management System

A full-stack Task Management System built with modern technologies.

It includes:
- Secure backend API
- Responsive web application
- Cross-platform mobile app

---

## 📌 Features

### 🔐 Authentication
- User Registration & Login  
- Password hashing (bcrypt)  
- JWT Authentication (Access + Refresh Tokens)  
- Session restoration  
- Token refresh (401 handling)  

### ✅ Task Management
- Create, update, delete tasks  
- Toggle task status  
- User-specific tasks  
- Pagination  
- Search by title  
- Filter by status  

---

## 🛠 Tech Stack

**Backend**
- Node.js + TypeScript  
- Express.js  
- PostgreSQL  
- Prisma ORM  

**Frontend**
- Next.js  
- Axios  

**Mobile**
- Flutter  
- Riverpod  
- Dio  

---

## 📁 Project Structure


task-management-system/
├── backend/
├── Web-frontend/
├── Flutter-frontend/
├── docker-compose.yml
└── README.md


---

## ⚙️ API Endpoints

### Authentication
- POST /auth/register  
- POST /auth/login  
- POST /auth/refresh  
- POST /auth/logout  

### Tasks
- GET /tasks  
- POST /tasks  
- GET /tasks/:id  
- PATCH /tasks/:id  
- DELETE /tasks/:id  
- PATCH /tasks/:id/toggle  

---

## 🚀 Setup

### Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run dev

Backend → http://localhost:4000

Web
cd Web-frontend
npm install
npm run dev

Web → http://localhost:3000

Flutter
cd Flutter-frontend
flutter pub get
flutter run
🔒 Security
bcrypt password hashing
JWT authentication
Refresh token system
Protected routes
🌟 Highlights
Full-stack project
Clean architecture
Real-world features
Cross-platform app
👨‍💻 Author

Chayan Bain
Full Stack Developer
