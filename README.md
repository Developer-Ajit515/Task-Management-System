# Task Management System

A full-stack **Task Management System** developed to simplify task creation, employee management, task assignment, and progress tracking. The application provides secure authentication, role-based authorization, and RESTful API integration.

## 🚀 Features

- **User Authentication** – Secure registration and login using JWT authentication.
- **Role-Based Authorization** – Manage access based on user roles and permissions.
- **Employee Management** – Create and manage employee accounts.
- **Task Management** – Create, view, and manage tasks.
- **Task Assignment** – Assign tasks to employees.
- **Task Status Tracking** – Update and monitor task progress.
- **RESTful APIs** – Backend APIs built with ASP.NET Core Web API.
- **Refresh Token** – Token refresh and revocation functionality.
- **Responsive UI** – User-friendly React-based interface.

## 🛠️ Tech Stack

### Frontend
- React.js
- JavaScript
- React Router DOM
- Axios
- HTML5
- CSS3
- Bootstrap

### Backend
- ASP.NET Core Web API
- C#
- Entity Framework Core
- LINQ
- JWT Authentication
- Role-Based Authorization

### Database
- Microsoft SQL Server

### Development Tools
- Visual Studio
- Visual Studio Code
- SQL Server Management Studio
- Git & GitHub
- Swagger / OpenAPI

## 📂 Project Structure

```text
Task-Management-System/
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── Backend/
│   ├── TaskManagement.API/
│   ├── TaskManagement.Application/
│   ├── TaskManagement.Domain/
│   └── TaskManagement.Infrastructure/
│
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/Task-Management-System.git
```

### 2. Backend Setup

- Open the backend solution in Visual Studio.
- Configure your SQL Server connection string in `appsettings.json`.
- Apply Entity Framework Core migrations if required.
- Run the ASP.NET Core Web API project.

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd Frontend
```

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm run dev
```

### 4. Access the Application

Open the frontend application in your browser using the development URL displayed in the terminal.

Backend API documentation can be accessed through Swagger when enabled.

## 🔐 Authentication

The application uses JWT-based authentication to secure API endpoints. Role-based authorization ensures that users can access resources according to their assigned permissions.

## 🎯 Project Objective

The main objective of this project is to build a practical task management solution that helps organizations manage employees, distribute tasks, track work progress, and improve team productivity.

## 👨‍💻 Developer

**Developed as a Full Stack Web Development Project.**

Technologies: React.js | ASP.NET Core Web API | C# | Entity Framework Core | SQL Server

---

⭐ If you find this project useful, consider giving it a star!
