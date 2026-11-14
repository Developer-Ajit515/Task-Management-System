# Task Management System

A full-stack Task Management System built using **ASP.NET Core Web API, Entity Framework Core, SQL Server, and React**. The application provides secure authentication and role-based access for Admin and Employee users.

## Tech Stack

### Backend
- ASP.NET Core Web API (.NET 8)
- C#
- Entity Framework Core
- SQL Server
- JWT Authentication
- BCrypt Password Hashing
- Clean / Layered Architecture

### Frontend
- React
- JavaScript
- HTML5
- CSS3
- Axios
- React Router

## Features

- User registration and login
- JWT-based authentication
- Role-based authorization (Admin and Employee)
- Admin task management
- Employee-specific task access
- Task creation, updating, deletion and viewing
- Task assignment to employees
- Task status management
- Input validation and exception handling
- Refresh token support

## Project Structure

```text
Task-Management-System/
│
├── TaskManagement.API/
│   ├── Controllers/
│   ├── Middleware/
│   ├── Properties/
│   ├── Program.cs
│   └── appsettings.json
│
├── TaskManagement.Application/
│   ├── DTOs/
│   ├── Interfaces/
│   └── Services/
│
├── TaskManagement.Domain/
│   ├── Entities/
│   ├── Enums/
│   └── Interfaces/
│
├── TaskManagement.Infrastructure/
│   ├── Data/
│   ├── Repositories/
│   ├── Services/
│   └── Migrations/
│
├── taskmanagement-client/
│   ├── public/
│   ├── src/
│   └── package.json
│
└── TaskManagementSystem.sln
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Developer-Ajit515/Task-Management-System.git
cd Task-Management-System
```

### 2. Backend Setup

Open the solution in Visual Studio 2022 or use the .NET CLI.

Restore dependencies:

```bash
dotnet restore TaskManagementSystem.sln
```

### 3. Configure the Database

Update the SQL Server connection string in your development configuration.

Do not commit database passwords or production credentials.

### 4. Configure JWT Secret

Initialize User Secrets for the API project:

```powershell
dotnet user-secrets init --project ".\TaskManagement.API\TaskManagement.API.csproj"
```

Generate a secure secret locally and store it:

```powershell
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 64
$rng.GetBytes($bytes)
$key = [Convert]::ToBase64String($bytes)
$rng.Dispose()

dotnet user-secrets set "Jwt:Key" "$key" --project ".\TaskManagement.API\TaskManagement.API.csproj"
```

Keep the generated secret private. Never commit it to GitHub.

### 5. Apply Entity Framework Core Migrations

Migrations are maintained in the `TaskManagement.Infrastructure` project.

From the repository root, run:

```bash
dotnet ef database update --project TaskManagement.Infrastructure --startup-project TaskManagement.API
```

If EF Core CLI is not installed:

```bash
dotnet tool install --global dotnet-ef
```

### 6. Run the Backend

```bash
dotnet run --project TaskManagement.API
```

Check the API URL and Swagger URL in the API project's `Properties/launchSettings.json` or terminal output.

### 7. Frontend Setup

Open another terminal:

```bash
cd taskmanagement-client
npm install
npm run dev
```

The React application will start using the development URL shown in the terminal.

Make sure the frontend API base URL points to the running backend API.

## Authentication and Authorization

The application uses JWT authentication.

- **Admin:** Can manage tasks and access administrative task endpoints.
- **Employee:** Can access assigned tasks and perform permitted task-status updates.

Protected API endpoints require a valid JWT access token.

## Architecture

The backend follows a layered architecture:

- **API Layer:** Controllers, middleware and HTTP request handling.
- **Application Layer:** Business services, DTOs and service interfaces.
- **Domain Layer:** Core entities, enums and repository contracts.
- **Infrastructure Layer:** Database context, EF Core migrations, repositories and infrastructure services.

## Security

- JWT secret is configured using .NET User Secrets for local development.
- Passwords are hashed using BCrypt.
- Role-based authorization protects restricted endpoints.
- Refresh tokens are supported.
- Sensitive configuration values should not be committed to source control.

## Screenshots

### Login Page
![Login Page](screenshots/login.png)

### Admin Dashboard
![Admin Dashboard](screenshots/admin-dashboard.png)

### Employee Dashboard
![Employee Dashboard](screenshots/Employee-dashboard.png)

### Task List
![Task List](screenshots/task-list.png)


## Future Improvements

- Automated unit and integration tests
- Improved API documentation
- Additional reporting and dashboard features
- Deployment configuration

## Author

**Ajit Singh**

GitHub: https://github.com/Developer-Ajit515
