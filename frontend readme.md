# Task & Comment API Documentation

This document describes all the API endpoints for task and comment management in the Jira-like task tracking system.

## Authentication

All endpoints require JWT authentication. Include the JWT token in the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

## Task Endpoints

### Create Task (Direct)

**Endpoint:** `POST /api/v1/tasks`

**Description:** Create a new task or subtask directly. The `project_id` must be included in the request body.

**Request Body:**
```json
{
  "project_id": "uuid",
  "parent_task_id": "uuid", // Optional - set for subtasks
  "title": "string",
  "description": "string", // Optional
  "status": "string", // Optional - defaults to "not_started"
  "priority": "string", // Optional - defaults to "medium"
  "assignee_id": "uuid", // Optional
  "estimate_seconds": "integer", // Optional
  "start_date": "date", // Optional
  "due_date": "date" // Optional
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "parent_task_id": "uuid", // null for main tasks
  "title": "string",
  "description": "string",
  "status": "string",
  "priority": "string",
  "assignee_id": "uuid",
  "assignee_email": "string",
  "estimate_seconds": "integer",
  "start_date": "date",
  "due_date": "date",
  "completed_at": "datetime",
  "created_by": "uuid",
  "created_at": "datetime",
  "updated_at": "datetime",
  "logged_seconds": "integer"
}
```

### Create Task (By Project)

**Endpoint:** `POST /api/v1/projects/{project_id}/tasks`

**Description:** Create a new task or subtask for a specific project.

**Request Body:**
```json
{
  "parent_task_id": "uuid", // Optional - set for subtasks
  "title": "string",
  "description": "string", // Optional
  "status": "string", // Optional - defaults to "not_started"
  "priority": "string", // Optional - defaults to "medium"
  "assignee_id": "uuid", // Optional
  "estimate_seconds": "integer", // Optional
  "start_date": "date", // Optional
  "due_date": "date" // Optional
}
```

**Response:** Same as Create Task (Direct) above.

### List Tasks

**Endpoint:** `GET /api/v1/tasks`

**Description:** List tasks with optional filters. Only returns tasks from the user's organization.

**Query Parameters:**
- `project_id` (UUID): Filter by project
- `status` (string): Filter by status (not_started, in_progress, blocked, completed, cancelled)
- `priority` (string): Filter by priority (low, medium, high)
- `assignee_id` (UUID): Filter by assignee
- `parent_task_id` (UUID): Filter by parent task (list subtasks)

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "project_id": "uuid",
    "parent_task_id": "uuid", // null for main tasks
    "title": "string",
    "description": "string",
    "status": "string",
    "priority": "string",
    "assignee_id": "uuid",
    "assignee_email": "string",
    "estimate_seconds": "integer",
    "start_date": "date",
    "due_date": "date",
    "completed_at": "datetime",
    "created_by": "uuid",
    "created_at": "datetime",
    "updated_at": "datetime",
    "logged_seconds": "integer"
  }
]
```

### List Tasks by Project

**Endpoint:** `GET /api/v1/projects/{project_id}/tasks`

**Description:** List tasks for a specific project with optional filters.

**Query Parameters:**
- `status` (string): Filter by status
- `assignee_id` (UUID): Filter by assignee
- `due_from` (date): Filter tasks due after this date
- `due_to` (date): Filter tasks due before this date
- `limit` (integer): Maximum number of results (1-500, default: 100)
- `offset` (integer): Pagination offset (default: 0)

**Response:** Same as List Tasks above.

### Get Task

**Endpoint:** `GET /api/v1/tasks/{task_id}`

**Description:** Get a specific task by ID.

**Response (200 OK):** Single task object as shown in List Tasks.

### Update Task

**Endpoint:** `PATCH /api/v1/tasks/{task_id}`

**Description:** Update a task's properties. Only include fields you want to update.

**Request Body:**
```json
{
  "parent_task_id": "uuid", // Optional
  "title": "string", // Optional
  "description": "string", // Optional
  "status": "string", // Optional
  "priority": "string", // Optional
  "assignee_id": "uuid", // Optional
  "estimate_seconds": "integer", // Optional
  "start_date": "date", // Optional
  "due_date": "date" // Optional
}
```

**Response (200 OK):** Updated task object as shown in List Tasks.

### Complete Task

**Endpoint:** `POST /api/v1/tasks/{task_id}/complete`

**Description:** Mark a task as completed.

**Request Body:**
```json
{
  "comment": "string" // Optional completion comment
}
```

**Response (200 OK):** Updated task object with status "completed".

### Reopen Task

**Endpoint:** `POST /api/v1/tasks/{task_id}/reopen`

**Description:** Reopen a completed task (change status back to "in_progress").

**Request Body:** None

**Response (200 OK):** Updated task object with status "in_progress".

### Delete Task

**Endpoint:** `DELETE /api/v1/tasks/{task_id}`

**Description:** Delete a task. Cannot delete tasks that have subtasks.

**Response (204 No Content):** Empty response on success.

### List Subtasks

**Endpoint:** `GET /api/v1/tasks/{task_id}/subtasks`

**Description:** List all subtasks for a specific parent task.

**Response (200 OK):** Array of task objects as shown in List Tasks.

### Get Project Task Statistics

**Endpoint:** `GET /api/v1/projects/{project_id}/tasks/stats`

**Description:** Get task statistics for a project.

**Response (200 OK):**
```json
{
  "project_id": "uuid",
  "total_tasks": "integer",
  "completed_tasks": "integer",
  "in_progress_tasks": "integer",
  "not_started_tasks": "integer",
  "blocked_tasks": "integer",
  "cancelled_tasks": "integer",
  "overdue_tasks": "integer",
  "progress_percentage": "float"
}
```

## Comment Endpoints

### List Comments

**Endpoint:** `GET /api/v1/tasks/{task_id}/comments`

**Description:** List all comments for a specific task.

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "task_id": "uuid",
    "author_id": "uuid",
    "body": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
]
```

### Create Comment

**Endpoint:** `POST /api/v1/tasks/{task_id}/comments`

**Description:** Add a comment to a task.

**Request Body:**
```json
{
  "body": "string"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "task_id": "uuid",
  "author_id": "uuid",
  "body": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Update Comment

**Endpoint:** `PATCH /api/v1/comments/{comment_id}`

**Description:** Update a comment's content.

**Request Body:**
```json
{
  "body": "string" // Optional - if not provided, comment will be empty
}
```

**Response (200 OK):** Updated comment object as shown above.

### Delete Comment

**Endpoint:** `DELETE /api/v1/comments/{comment_id}`

**Description:** Delete a comment.

**Response (204 No Content):** Empty response on success.

## Task Status Values

- `not_started`: Task has not been started
- `in_progress`: Task is currently being worked on
- `blocked`: Task is blocked and cannot proceed
- `completed`: Task has been completed
- `cancelled`: Task has been cancelled

## Task Priority Values

- `low`: Low priority
- `medium`: Medium priority (default)
- `high`: High priority

## Validation Rules

### Task Creation/Update
- `title` is required and must be non-empty
- `due_date` must be on or after `start_date` (if both provided)
- `parent_task_id` must reference an existing task in the same project
- `assignee_id` must be a member of the project (if provided)
- Cannot set a task as its own parent

### Task Deletion
- Cannot delete tasks that have existing subtasks

### Date Constraints
- `start_date` cannot be before the project's creation date
- `due_date` cannot be before the project's creation date
- `start_date` cannot be before today (for new tasks)

## Error Responses

**400 Bad Request:**
- Invalid data format
- Validation errors (e.g., due_date before start_date)
- Assignee not a project member
- Parent task not found or in different project
- Task has subtasks (cannot delete)

**401 Unauthorized:**
- Missing or invalid JWT token

**403 Forbidden:**
- Insufficient permissions

**404 Not Found:**
- Task, project, or comment not found

**422 Unprocessable Entity:**
- Invalid UUID format
- Invalid enum values

## Example Usage

### Create a Main Task
```bash
curl -X POST "http://localhost:8000/api/v1/tasks" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Implement user authentication",
    "description": "Implement login, signup, and password reset",
    "priority": "high"
  }'
```

### Create a Subtask
```bash
curl -X POST "http://localhost:8000/api/v1/tasks" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "550e8400-e29b-41d4-a716-446655440000",
    "parent_task_id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Create login form UI",
    "description": "Design and implement the login form component"
  }'
```

### Add a Comment
```bash
curl -X POST "http://localhost:8000/api/v1/tasks/550e8400-e29b-41d4-a716-446655440001/comments" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "This looks good! Just need to add validation for email format."
  }'
```

### List Tasks with Filters
```bash
curl -X GET "http://localhost:8000/api/v1/tasks?project_id=550e8400-e29b-41d4-a716-446655440000&status=in_progress" \
  -H "Authorization: Bearer <token>"
```

### Get Project Statistics
```bash
curl -X GET "http://localhost:8000/api/v1/projects/550e8400-e29b-41d4-a716-446655440000/tasks/stats" \
  -H "Authorization: Bearer <token>"
```
