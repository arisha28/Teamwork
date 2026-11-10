# Database Design & Modeling — MongoDB

## 1. Collections & Relationships

### `User`
- `_id`: ObjectId
- `name`: String
- `email`: String (Unique index)
- `passwordHash`: String (Bcrypt)
- `role`: Enum [`REGULAR_USER`, `PROJECT_ADMIN`, `SYSTEM_ADMIN`]
- `status`: Enum [`active`, `disabled`] (Soft delete pattern)
- `createdAt`, `updatedAt`: Timestamps

### `Project`
- `_id`: ObjectId
- `name`: String
- `description`: String
- `ownerId`: ObjectId ref User
- `status`: Enum [`ACTIVE`, `ARCHIVED`]
- `startDate`: Date
- `endDate`: Date
- `members`: Embedded Subdocuments array:
  - `userId`: ObjectId ref User
  - `role`: Enum [`ADMIN`, `MEMBER`]
  - `joinedAt`: Date

### `Task`
- `_id`: ObjectId
- `projectId`: ObjectId ref Project (Index)
- `title`: String
- `description`: String
- `status`: Enum [`TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`, `ARCHIVED`] (Index)
- `priority`: Enum [`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`] (Index)
- `assigneeId`: ObjectId ref User (Index)
- `reporterId`: ObjectId ref User
- `dueDate`: Date
- `version`: Number (OCC)
- **Compound Index**: `{ projectId: 1, status: 1 }`
- **Text Index**: `{ title: "text", description: "text" }`

### `Comment` (Referenced collection for scalability)
- `_id`: ObjectId
- `taskId`: ObjectId ref Task (Index)
- `authorId`: ObjectId ref User
- `content`: String

### `Attachment`
- `_id`: ObjectId
- `taskId`: ObjectId ref Task (Index)
- `uploadedBy`: ObjectId ref User
- `originalFileName`: String
- `storedFileName`: String
- `contentType`: String
- `fileSize`: Number
- `storagePath`: String

### `TaskHistory` (Audit Log)
- `_id`: ObjectId
- `taskId`: ObjectId ref Task (Index)
- `changedBy`: ObjectId ref User
- `fieldName`: String
- `oldValue`: Mixed
- `newValue`: Mixed
- `changedAt`: Date

### `Notification`
- `_id`: ObjectId
- `userId`: ObjectId ref User (Index)
- `type`: Enum [`TASK_ASSIGNED`, `TASK_STATUS_CHANGED`, `TASK_COMMENT_ADDED`, `PROJECT_ADDED`, `SYSTEM`]
- `message`: String
- `metadata`: Mixed
- `isRead`: Boolean
