# Secure REST API with Role-Based Access Control

## About the Developer

**Name:** Manu V G  
**Education:** Final Year B.Tech Student in CSE Department at VTU CPGS Mysuru #Aspiring Software Engineer

---

## Project Description

A scalable, production-ready REST API built with Node.js/Express and React, featuring JWT authentication, role-based access control, and a comprehensive Products management system.

## Key Features

### Backend (Node.js + Express + MongoDB)
- **Authentication**: JWT-based login/registration with bcrypt password hashing
- **Authorization**: Role-based access (User & Admin roles)
- **Product Management**: Full CRUD operations with ownership validation
- **API Versioning**: Structured v1 endpoints (`/api/v1`)
- **Security**: Input validation, sanitization, and error handling
- **Documentation**: Swagger/OpenAPI at `/api-docs`

### Frontend (React + Vite)
- **Authentication Flow**: Login, registration, protected routes
- **User Dashboard**: Marketplace, personal products, analytics
- **Admin Dashboard**: Dark theme, user management, system overview
- **Product Operations**: Create, read, update, delete with modal editing
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Auto-refresh after operations

## Project Structure

```
securerestapi/
├── backend/
│   ├── models/ (User, Product schemas)
│   ├── controllers/ (authController, productController)
│   ├── routes/ (v1 API endpoints)
│   ├── middleware/ (auth, errorHandler)
│   └── server.js
├── frontend/
│   ├── src/pages/ (Login, Register, UserDashboard, AdminDashboard)
│   ├── src/components/ (Navbar, ProtectedRoute)
│   ├── src/api/ (endpoints, apiClient)
│   └── src/context/ (AuthContext)
└── scripts/ (createAdmin.js)
```

## Test Credentials

**Admin User:**
- Email: `admin@example.com`
- Password: `admin123`
- Dashboard: http://localhost:5174/admin

**Regular User:**
- Email: `test@example.com`
- Password: `password123`
- Dashboard: http://localhost:5174/dashboard

## Running the Project

**Backend:** `npm run dev` (Port 5000)
**Frontend:** `npm run dev` (Port 5174)

## Technology Stack
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs
- **Frontend**: React, Vite, React Router, Axios, Context API
- **Tools**: Swagger UI, Git, VS Code

---

**Developed with ❤️ by Manu V G**  
Final Year CSE Student | VTU CPGS Mysuru
