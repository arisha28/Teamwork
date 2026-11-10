# API Documentation — TeamWork REST API

Base URL: `http://localhost:5000/api`

## Authentication
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user account | No |
| POST | `/api/auth/login` | Login and receive JWT token | No |
| GET | `/api/auth/me` | Fetch currently logged in profile | Yes (Bearer) |

## Users & RBAC
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/users` | List all users | Yes |
| GET | `/api/users/:id` | Get user details | Yes |
| PUT | `/api/users/:id` | Update profile information | Yes |
| PATCH | `/api/users/:id/status` | Enable/Disable user (Soft Delete) | System Admin |

## Projects
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/projects` | Create a new project | Yes |
| GET | `/api/projects` | List projects for user | Yes |
| GET | `/api/projects/:projectId` | Get project and members | Member/Admin |
| PUT | `/api/projects/:projectId` | Update project details | Project Admin |
| POST | `/api/projects/:projectId/members` | Add member with role | Project Admin |
| DELETE | `/api/projects/:projectId/members/:userId` | Remove member | Project Admin |
| GET | `/api/projects/:projectId/dashboard` | Aggregated metrics | Member/Admin |

## Tasks
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/projects/:projectId/tasks` | Create task | Member/Admin |
| GET | `/api/projects/:projectId/tasks` | List tasks with filters & pagination | Member/Admin |
| GET | `/api/tasks/:id` | Get task details | Yes |
| PUT | `/api/tasks/:id` | Update task with OCC version check | Yes |
| PATCH | `/api/tasks/:id/status` | Update status (Reopen rule enforced) | Yes |
| PATCH | `/api/tasks/:id/reopen` | Reopen completed task to TODO | Yes |
| DELETE | `/api/tasks/:id` | Delete task | Project Admin |
| GET | `/api/tasks/:id/history` | Get task field change audit log | Yes |

## Comments & Attachments
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/tasks/:taskId/comments` | Add comment to task | Yes |
| GET | `/api/tasks/:taskId/comments` | List comments for task | Yes |
| DELETE | `/api/comments/:commentId` | Delete comment (Author or Admin) | Yes |
| POST | `/api/tasks/:taskId/attachments` | Upload multipart file (max 10MB) | Yes |
| GET | `/api/tasks/:taskId/attachments` | List attachments for task | Yes |
| GET | `/api/attachments/:id/download` | Download attachment file stream | Yes |
| DELETE | `/api/attachments/:id` | Delete attachment from DB and disk | Yes |
