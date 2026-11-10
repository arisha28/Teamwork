# Architecture Document — TeamWork (MERN Stack)

## 1. High-Level Architecture Overview

TeamWork is architected following the clean layered architecture pattern:

```
[ Browser / Client ]
        │  HTTP / REST / JSON (Axios with Bearer Interceptor)
        ▼
[ Express Router Layer ]
   - Defines URL route paths, parameter validation, and HTTP methods
        │
        ▼
[ Middleware Layer ]
   - Authentication (JWT verification & active user hydration)
   - Authorization / RBAC (System Admin, Project Admin, Project Member)
   - Request Logger (Morgan stream integrated into Winston)
   - File Uploads (Multer with MIME filtering and size caps)
   - Error Handler (Centralized operational vs programming error mapping)
        │
        ▼
[ Controller Layer ]
   - Parses HTTP inputs (`req.params`, `req.query`, `req.body`)
   - Translates domain responses to HTTP status codes (200, 201, 204)
        │
        ▼
[ Service Layer (Business Logic) ]
   - Implements business rules (e.g. assignee membership verification, reopen constraint, OCC version comparison)
   - Emits asynchronous domain events for cross-cutting concerns (audit history, notifications)
        │
        ▼
[ Data Access / Model Layer (Mongoose) ]
   - Schema validation, defaults, and type coercion
   - Compound indexes for optimized query filtering and sorting
   - Aggregation pipelines for statistical dashboards
        │
        ▼
[ MongoDB Database ]
```

## 2. Event-Driven Audit & Notification Flow

When a task update occurs:
1. `task.service.js` detects which fields changed.
2. Emits `task.updated` via Node `EventEmitter`.
3. `history.service.js` catches the event and writes immutable records to `TaskHistory`.
4. `notification.service.js` catches task assignment and comment events to alert users.

## 3. Optimistic Concurrency Control (OCC)
- Every task carries an incrementing `version` counter.
- When an update request arrives with a client version lower than database version, the update is rejected with `HTTP 409 Conflict`.
