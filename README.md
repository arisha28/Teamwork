<div align="center">

# 🚀 TeamWork — Task & Project Management System (MERN Stack)

**An enterprise-grade, full-stack collaborative project and task management system built with MongoDB, Express.js, React, and Node.js.**

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Jest Tests](https://img.shields.io/badge/Tests-12%2F12%20Passing-brightgreen?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

[Features](#-key-features) • [Architecture](#-architecture) • [Getting Started](#-quick-start-guide) • [Demo Credentials](#-pre-seeded-demo-accounts) • [API Reference](#-api-endpoints) • [Testing](#-running-tests) • [Docker](#-docker-support)

</div>

---

## 📌 About The Project

**TeamWork** is a production-style web application designed to demonstrate robust full-stack engineering fundamentals. It models multi-tenant project spaces, role-based access control, optimistic concurrency control, immutable audit trails, and data visualization using MongoDB aggregation pipelines.

Built in strict compliance with the **Trainee Project Outline (Phases 0 through 9)**, it avoids hiding engineering complexity behind black-box frameworks and follows industry-standard layered software design patterns.

---

## 🌟 Key Features

### 1. 👥 Authentication & Role-Based Access Control (RBAC)
- **JWT-Based Authentication**: Secure Bearer tokens with configurable expiration.
- **Three-Tier User Roles**:
  - `REGULAR_USER` (Developer): View assigned projects/tasks, update permitted fields, add comments, upload attachments.
  - `PROJECT_ADMIN` (Manager): Create/archive projects, manage memberships, delete/archive tasks, view project analytics.
  - `SYSTEM_ADMIN`: Global administrative oversight, user management, and soft-deletion.
- **Soft Delete Pattern**: Users can be disabled rather than hard-deleted to maintain database referential integrity and historical audit trails.

### 2. 📋 Interactive Kanban Board & Task Workflows
- **Dynamic Kanban Columns**: `To Do`, `In Progress`, `Blocked`, and `Completed`.
- **Enforced Business Rules**:
  - Assignees **must** be members of the parent project.
  - Due dates **cannot** precede project start dates.
  - Completed tasks **cannot** transition directly back to `To Do` without a dedicated, auditable reopen action.
  - Archived tasks and projects are immutable.
- **Optimistic Concurrency Control (OCC)**:
  - Version counters (`version`) prevent lost updates when concurrent users edit the same task simultaneously (detects conflicts with `HTTP 409`).

### 3. 🔍 Search, Multi-Filter, Sorting & Pagination
- **Server-Side Debounced Search**: Fast regex search across task titles and descriptions.
- **Compound Filters**: Filter simultaneously by status, priority, and assignee.
- **Sorting Options**: Sort by due date (asc/desc), creation date, or priority.
- **Paginated Responses**: Full pagination metadata (`total`, `pages`, `currentPage`, `limit`).

### 4. 💬 Collaboration, Auditing & In-App Notifications
- **Discussion Threads**: Add, edit, and delete task comments.
- **Field-Level Audit History**: Every status transition, priority change, or assignee reassignment is automatically recorded with `oldValue`, `newValue`, `changedBy`, and `changedAt` timestamps.
- **Event-Driven Architecture**: Decoupled domain events using Node's `EventEmitter`.
- **Live Notifications**: Instant in-app alerts when tasks are assigned or commented on.

### 5. 📎 File Attachments
- **Multipart Uploads**: Powered by `multer` with file-type validation (Images, PDFs, Documents, ZIPs) and 10MB size limits.
- **Safe Streaming**: Dedicated endpoint to safely stream downloads directly from storage.

### 6. 📊 MongoDB Aggregation Analytics Dashboard
- **Real-Time KPI Cards**: Total tasks, completed tasks, overdue tasks count, and velocity percentage.
- **Complex Aggregation Pipelines**:
  - `$group` status breakdown.
  - Priority distribution bars.
  - Workload balance per team member with completion rates.
  - Overdue task alert detection using date boundary comparisons.

---

## 🏗 Architecture

```
[ Browser Client (React 18 + Vite) ]
             │  HTTP / REST / JSON (Axios + JWT Interceptors)
             ▼
[ Express Router Layer ]
             │  Route definitions & path resolution
             ▼
[ Middlewares Layer ]
   ├── Authentication (JWT verify & hydrate user)
   ├── Authorization (RBAC: System Admin, Project Admin, Member)
   ├── Multer (File uploads & MIME filtering)
   ├── Winston & Morgan (Structured HTTP & application logging)
   └── Error Middleware (Operational vs Programming error translation)
             │
             ▼
[ Controller Layer ]
             │  Request parsing & HTTP status mapping (200, 201, 400, 404, 409)
             ▼
[ Service Layer (Core Business Rules) ]
             │  Validation rules, OCC version checking, EventEmitter
             ▼
[ Data Access / Models Layer (Mongoose) ]
   ├── Compound & Text Indexes
   └── Aggregation Pipelines ($match, $group, $lookup, $project)
             │
             ▼
[ MongoDB Database ]
```

---

## 📁 Repository Structure

```
teamwork/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection & environment configuration
│   │   ├── controllers/     # HTTP route controllers
│   │   ├── middlewares/     # JWT Auth, RBAC, Upload, Error & Logger middlewares
│   │   ├── models/          # Mongoose Schemas (User, Project, Task, Comment, etc.)
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Isolated business logic & event handlers
│   │   ├── utils/           # AppError, Winston logger, EventEmitter
│   │   ├── seed.js          # Database seeder with demo accounts & tasks
│   │   └── index.js         # Express app entry & graceful shutdown
│   ├── tests/               # Jest & Supertest automated API tests
│   ├── uploads/             # Task file storage
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client with JWT interceptors & API methods
│   │   ├── components/      # Navbar, Sidebar, Modal, KanbanBoard, TaskCard, etc.
│   │   ├── context/         # AuthContext & NotificationContext
│   │   ├── hooks/           # useAuth, useDebounce
│   │   ├── pages/           # Dashboard, Projects, ProjectDetail, TasksList, AdminUsers
│   │   ├── routes/          # ProtectedRoute component
│   │   ├── App.jsx          # App layout & routing
│   │   └── main.jsx         # React root
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── docs/                    # Architecture, API, Database, and Decision documentation
├── docker-compose.yml       # Multi-container orchestration
└── README.md
```

---

## ⚡ Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or v22 recommended)
- [MongoDB](https://www.mongodb.com/) running locally on port 27017 or a MongoDB Atlas URI

### 1. Clone the repository
```bash
git clone https://github.com/your-username/teamwork.git
cd teamwork
```

### 2. Backend Setup
```bash
cd backend
npm install

# Seed demo users, project, tasks, comments, and history
npm run seed

# Start backend development server (http://localhost:5000)
npm run dev
```

> **Note**: A pre-configured `.env` is created automatically. If customizing, duplicate `.env.example` to `.env`:
> ```env
> PORT=5000
> NODE_ENV=development
> MONGODB_URI=mongodb://127.0.0.1:27017/teamwork
> JWT_SECRET=your_jwt_secret_key
> JWT_EXPIRES_IN=7d
> UPLOAD_PATH=uploads
> ```

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install

# Start Vite development server (http://localhost:5173)
npm run dev
```

Open **`http://localhost:5173`** in your browser!

---

## 🔑 Pre-Seeded Demo Accounts

The login screen features **one-click quick-login buttons**, or you can manually enter these credentials:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **System Admin** | `admin@teamwork.local` | `password123` | Global admin, user management, toggle active/disabled status |
| **Project Admin** | `pm@teamwork.local` | `password123` | Project manager, member assignment, task deletion/archiving |
| **Developer** | `dev@teamwork.local` | `password123` | Regular user, Kanban management, comments, file attachments |

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` — Register a new account
- `POST /api/auth/login` — Login and receive JWT token
- `GET /api/auth/me` — Retrieve active user session profile

### Users & Administration (RBAC)
- `GET /api/users` — List all users
- `GET /api/users/:id` — Get user profile details
- `PUT /api/users/:id` — Update user profile information
- `PATCH /api/users/:id/status` — Toggle user active/disabled status (Soft Delete)

### Projects & Members
- `POST /api/projects` — Create a new project
- `GET /api/projects` — List projects associated with the user
- `GET /api/projects/:projectId` — Get project details and members
- `PUT /api/projects/:projectId` — Update project information
- `POST /api/projects/:projectId/members` — Add member with role (`ADMIN` / `MEMBER`)
- `DELETE /api/projects/:projectId/members/:userId` — Remove member from project
- `GET /api/projects/:projectId/dashboard` — Aggregated analytics & stats

### Tasks & Workflows
- `POST /api/projects/:projectId/tasks` — Create task (enforces member check)
- `GET /api/projects/:projectId/tasks` — List tasks with search, filter, sort & pagination
- `GET /api/tasks/:id` — Get task details
- `PUT /api/tasks/:id` — Update task with OCC `version` check
- `PATCH /api/tasks/:id/status` — Update task status (enforces reopen business rule)
- `PATCH /api/tasks/:id/reopen` — Reopen completed task back to To Do
- `DELETE /api/tasks/:id` — Delete task (Project Admin only)
- `GET /api/tasks/:id/history` — Get field-level audit change history

### Comments & Attachments
- `POST /api/tasks/:taskId/comments` — Add comment to task
- `GET /api/tasks/:taskId/comments` — Get comment thread
- `DELETE /api/comments/:commentId` — Delete comment (author or admin)
- `POST /api/tasks/:taskId/attachments` — Upload file attachment (max 10MB)
- `GET /api/tasks/:taskId/attachments` — List attachments for task
- `GET /api/attachments/:id/download` — Stream download file
- `DELETE /api/attachments/:id` — Delete attachment

---

## 🧪 Running Tests

The backend includes a comprehensive integration test suite covering the health check, JWT authentication, authorization, business rules, OCC conflict prevention, and aggregation pipelines:

```bash
cd backend
npm test
```

**Results:**
```text
PASS tests/api.test.js
  TeamWork Backend API Test Suite
    Phase 0: Health Check API
      ✓ GET /api/health should return 200 with status UP
    Phase 1 & 6: Authentication & User Management
      ✓ should reject duplicate email during registration (409 Conflict)
      ✓ should reject login with wrong credentials (401 Unauthorized)
      ✓ GET /api/auth/me should return current user profile
    Phase 2: Projects & Membership
      ✓ GET /api/projects/:projectId should return project details with members
    Phase 3 & 4: Task Business Rules, Search & OCC
      ✓ should create a new task successfully
      ✓ should reject assigning a non-member to a task
      ✓ should enforce Optimistic Concurrency Control (OCC) conflict detection
      ✓ should reject moving completed task directly to TODO without reopen
      ✓ should allow moving completed task to TODO via dedicated reopen endpoint
      ✓ should search and paginate tasks with metadata
    Phase 8: Project Aggregation Dashboard
      ✓ should calculate status counts, overdue tasks, and progress percentage

Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
```

---

## 🐳 Docker Support

To run the full stack (MongoDB + Express Backend + React Frontend via Nginx) with Docker Compose:

```bash
docker-compose up --build
```
- Frontend available at: `http://localhost:80`
- Backend API available at: `http://localhost:5000`
- MongoDB accessible on: `localhost:27017`

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
