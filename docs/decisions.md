# Architectural Decision Records (ADRs)

## 1. Soft Delete vs Hard Delete for Users
- **Decision**: Users are disabled (`status: 'disabled'`) rather than dropped via `deleteOne`.
- **Rationale**: Hard deleting a user creates dangling foreign references in `Task.assigneeId`, `Comment.authorId`, and `TaskHistory.changedBy`, destroying historical audit trails. Disabling immediately blocks authentication and new task assignments while keeping past records valid.

## 2. Separate Collections vs Unbounded Arrays for Comments & Audit History
- **Decision**: Store `Comment` and `TaskHistory` in separate top-level collections referencing `taskId`.
- **Rationale**: An embedded array in the `Task` document would hit the 16MB BSON document cap as discussion threads and edits grow. Separate collections support pagination and high write concurrency.

## 3. Optimistic Concurrency Control (OCC)
- **Decision**: Implemented an explicit `version` property checked on every task update.
- **Rationale**: When two developers have the same task open and submit simultaneous edits, last-write-wins causes data loss. The server returns HTTP 409 Conflict if incoming version != stored version, prompting the client to refresh.

## 4. Node.js EventEmitter for History & Notifications
- **Decision**: Decoupled audit logging and user notifications from core CRUD services via `EventEmitter`.
- **Rationale**: Prevents bloating the core task service with secondary side-effects and ensures audit logging failures do not crash the primary task transaction.
