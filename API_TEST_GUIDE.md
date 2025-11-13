# API Testing Guide

## Quick Start
1. Backend running on: `http://localhost:5000`
2. Frontend running on: `http://localhost:5174`
3. API Docs available at: `http://localhost:5000/api-docs`

## Test Workflow

### Step 1: Register a User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!",
    "confirmPassword": "Test123!"
  }'
```

**Expected Response (201)**:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id_here",
    "name": "Test User",
    "email": "test@example.com",
    "role": "user"
  }
}
```

### Step 2: Login with User
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

**Expected Response (200)**: Same as register response

### Step 3: Get Current User (Requires Token)
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer <your_token_here>"
```

**Expected Response (200)**:
```json
{
  "user": {
    "id": "user_id_here",
    "name": "Test User",
    "email": "test@example.com",
    "role": "user"
  }
}
```

### Step 4: Create a Task
```bash
curl -X POST http://localhost:5000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token_here>" \
  -d '{
    "title": "Complete Project Documentation",
    "description": "Write comprehensive API documentation",
    "priority": "high",
    "dueDate": "2024-12-31"
  }'
```

**Expected Response (201)**:
```json
{
  "message": "Task created successfully",
  "task": {
    "_id": "task_id_here",
    "title": "Complete Project Documentation",
    "description": "Write comprehensive API documentation",
    "status": "pending",
    "priority": "high",
    "userId": "user_id_here",
    "dueDate": "2024-12-31T00:00:00.000Z",
    "createdAt": "2024-11-13T08:00:00.000Z",
    "updatedAt": "2024-11-13T08:00:00.000Z"
  }
}
```

### Step 5: Get All User's Tasks
```bash
curl -X GET http://localhost:5000/api/v1/tasks \
  -H "Authorization: Bearer <your_token_here>"
```

**Expected Response (200)**:
```json
{
  "tasks": [
    {
      "_id": "task_id_here",
      "title": "Complete Project Documentation",
      "description": "Write comprehensive API documentation",
      "status": "pending",
      "priority": "high",
      "userId": "user_id_here",
      "dueDate": "2024-12-31T00:00:00.000Z",
      "createdAt": "2024-11-13T08:00:00.000Z",
      "updatedAt": "2024-11-13T08:00:00.000Z"
    }
  ]
}
```

### Step 6: Get Single Task
```bash
curl -X GET http://localhost:5000/api/v1/tasks/<task_id> \
  -H "Authorization: Bearer <your_token_here>"
```

**Expected Response (200)**:
```json
{
  "task": {
    "_id": "task_id_here",
    "title": "Complete Project Documentation",
    "description": "Write comprehensive API documentation",
    "status": "pending",
    "priority": "high",
    "userId": "user_id_here",
    "dueDate": "2024-12-31T00:00:00.000Z",
    "createdAt": "2024-11-13T08:00:00.000Z",
    "updatedAt": "2024-11-13T08:00:00.000Z"
  }
}
```

### Step 7: Update Task Status
```bash
curl -X PUT http://localhost:5000/api/v1/tasks/<task_id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token_here>" \
  -d '{
    "status": "in-progress"
  }'
```

**Expected Response (200)**:
```json
{
  "message": "Task updated successfully",
  "task": {
    "_id": "task_id_here",
    "title": "Complete Project Documentation",
    "description": "Write comprehensive API documentation",
    "status": "in-progress",
    "priority": "high",
    "userId": "user_id_here",
    "dueDate": "2024-12-31T00:00:00.000Z",
    "createdAt": "2024-11-13T08:00:00.000Z",
    "updatedAt": "2024-11-13T08:00:00.000Z"
  }
}
```

### Step 8: Delete Task
```bash
curl -X DELETE http://localhost:5000/api/v1/tasks/<task_id> \
  -H "Authorization: Bearer <your_token_here>"
```

**Expected Response (200)**:
```json
{
  "message": "Task deleted successfully"
}
```

## Frontend Testing

1. **Visit**: `http://localhost:5174`
2. **Register**: Click "Register" and fill in the form
3. **Login**: Use registered credentials to login
4. **Dashboard**: After login, you'll see the task dashboard
5. **Create Task**: Add a new task using the form
6. **Manage Tasks**: Update status or delete tasks

## Error Testing

### Invalid Email on Register
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "invalid-email",
    "password": "Test123!",
    "confirmPassword": "Test123!"
  }'
```

**Expected Response (400)**:
```json
{
  "message": "Invalid email format"
}
```

### Wrong Password on Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "WrongPassword"
  }'
```

**Expected Response (401)**:
```json
{
  "message": "Invalid credentials"
}
```

### Missing Token
```bash
curl -X GET http://localhost:5000/api/v1/tasks
```

**Expected Response (401)**:
```json
{
  "message": "No token provided"
}
```

### Invalid Token
```bash
curl -X GET http://localhost:5000/api/v1/tasks \
  -H "Authorization: Bearer invalid_token_here"
```

**Expected Response (401)**:
```json
{
  "message": "Invalid token"
}
```

### Access Someone Else's Task
1. Register User A and get token A
2. Register User B and get token B
3. Create task with User A's token (get task_id)
4. Try to get/update that task with User B's token

```bash
curl -X GET http://localhost:5000/api/v1/tasks/<user_a_task_id> \
  -H "Authorization: Bearer <user_b_token>"
```

**Expected Response (403)**:
```json
{
  "message": "Access denied"
}
```

## Health Check
```bash
curl http://localhost:5000/health
```

**Expected Response (200)**:
```json
{
  "message": "Server is running"
}
```

## Status Codes Reference

| Code | Meaning |
|------|---------|
| 200  | OK - Request successful |
| 201  | Created - Resource created successfully |
| 400  | Bad Request - Invalid input |
| 401  | Unauthorized - No token or invalid token |
| 403  | Forbidden - No permission to access |
| 404  | Not Found - Resource doesn't exist |
| 500  | Internal Server Error - Server error |

## Notes

- Replace `<your_token_here>` with actual JWT token from login/register response
- Replace `<task_id>` with actual task ID from create/get response
- Replace `<user_id_here>` with actual user ID
- All timestamps are in ISO 8601 format
- Passwords are hashed with bcrypt and never returned
- Tokens expire after 7 days by default

## Frontend Features to Test

1. **Authentication Flow**
   - Register new account
   - Login with credentials
   - Auto-logout on invalid token
   - Persistent login after page refresh

2. **Task Management**
   - Create task with title and description
   - Update task status (pending → in-progress → completed)
   - Delete task with confirmation
   - View all personal tasks
   - Filter by priority

3. **UI/UX**
   - Error messages display correctly
   - Success messages appear after actions
   - Loading states while fetching
   - Responsive design on mobile
   - Smooth transitions and animations

4. **Security**
   - Token stored securely in localStorage
   - Protected routes redirect to login
   - Admin dashboard only for admin users
   - Cross-site scripting (XSS) prevention

Enjoy testing! 🚀
