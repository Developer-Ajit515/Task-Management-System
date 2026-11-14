# Task Management System

A full-stack Task Management System built using **ASP.NET Core Web API, React.js, Entity Framework Core, and SQL Server**. The application helps organizations manage employees, assign tasks, monitor progress, and control access through JWT authentication and role-based authorization.

## Features

### Authentication & Authorization
- User registration and login
- JWT-based authentication
- Refresh token support
- Refresh token revocation
- Role-based authorization for Admin and Employee
- Secure password hashing

### Admin Features
- Manage employees and users
- Create, assign, update, and delete tasks
- View task information
- Monitor task status and progress
- Access Admin-restricted endpoints

### Employee Features
- View assigned tasks
- Access personal task information
- Update task status
- Access resources according to assigned permissions

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, JavaScript, HTML5, CSS3, Bootstrap |
| Routing | React Router DOM |
| HTTP Client | Axios |
| Backend | ASP.NET Core Web API, C# |
| Architecture | Layered / Clean Architecture approach |
| ORM | Entity Framework Core |
| Database | Microsoft SQL Server |
| Authentication | JWT, Refresh Tokens, BCrypt |
| API Documentation | Swagger / OpenAPI |
| Tools | Visual Studio, VS Code, Git, GitHub |

## Project Architecture

The backend is separated into four projects:

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
│   └── Services/
│
├── TaskManagementSystem.sln
└── README.md
```

The React frontend is maintained separately. See the frontend setup section below for its actual project directory.

### Architecture Responsibilities

- **API:** HTTP endpoints, authentication, authorization, and middleware.
- **Application:** Business logic, application services, and DTOs.
- **Domain:** Core entities, enums, and repository contracts.
- **Infrastructure:** Entity Framework Core, database access, repositories, and infrastructure services.

## Prerequisites

Install the following before running the project:

- .NET 8 SDK
- Node.js and npm
- Microsoft SQL Server LocalDB or SQL Server
- Visual Studio 2022 or Visual Studio Code
- Git

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Developer-Ajit515/Task-Management-System.git

cd Task-Management-System
```

### 2. Backend Setup

Open PowerShell in the repository root.

Restore dependencies:

```bash
dotnet restore .\TaskManagementSystem.sln
```

Build the solution:

```bash
dotnet build .\TaskManagementSystem.sln
```

### 3. Configure the Database

The development configuration uses SQL Server LocalDB.

Update the connection string in your local configuration if you use a different SQL Server instance.

Example:

```text
Server=(localdb)\MSSQLLocalDB;
Database=Db_TaskManagementSystem;
Trusted_Connection=True;
MultipleActiveResultSets=True;
```

If the project contains Entity Framework Core migrations, apply them using the API project as the startup project and the appropriate migrations project:

```bash
dotnet ef database update --project <verified-migrations-project> --startup-project .\TaskManagement.API\TaskManagement.API.csproj
```

Install the EF Core CLI tool if needed:

```bash
dotnet tool install --global dotnet-ef
```

### 4. Configure JWT Secret

The JWT signing key must not be committed to source control.

Initialize User Secrets for the API project:

```bash
dotnet user-secrets init --project .\TaskManagement.API\TaskManagement.API.csproj
```

Set a strong, randomly generated secret:

```bash
dotnet user-secrets set "Jwt:Key" "YOUR_GENERATED_SECRET" --project .\TaskManagement.API\TaskManagement.API.csproj
```

Keep the JWT issuer and audience settings in the appropriate application configuration.

### 5. Run the Backend

```bash
dotnet run --project .\TaskManagement.API\TaskManagement.API.csproj
```

The API URL and Swagger URL are determined by the API project's launch settings.

Open the Swagger URL shown by the application to explore and test the endpoints.

### 6. Frontend Setup

Navigate to the actual React frontend directory (replace the path below with the verified directory):

```bash
cd <frontend-directory>
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the frontend URL displayed in the terminal.

## Authentication and Authorization

The application uses JWT Bearer authentication.

1. Register a user or log in with existing credentials.
2. The API returns an authentication token after successful login.
3. Include the access token in protected API requests:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

4. Role-based authorization restricts Admin and Employee endpoints.
5. Refresh token functionality supports renewing access tokens according to the configured expiry policy.

Never publish real credentials, signing keys, or refresh tokens in the repository.

## API Documentation

Swagger provides interactive API documentation in Development mode.

The API includes authentication, task management, user management, and dashboard functionality. Refer to the Swagger documentation for the actual routes, request models, and response structures.

## Screenshots

Add screenshots of the application here:

- Login page
- Registration page
- Admin dashboard
- Employee dashboard
- Task list
- Create / Edit task
- Task details

Example:

```markdown
![Login Page](docs/screenshots/login.png)
```

## Future Improvements

- Automated unit and integration testing
- Enhanced API validation and error handling
- Improved reporting and analytics
- CI/CD pipeline
- Deployment configuration for production

## Developer

**Ajit Singh**

Full Stack .NET Developer

Technologies: C# | ASP.NET Core Web API | React.js | SQL Server | Entity Framework Core

---

If you find this project useful, consider giving it a ⭐ on GitHub.
