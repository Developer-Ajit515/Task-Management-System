# Task Management System

A full-stack Task Management System built using **ASP.NET Core Web API, React.js, Entity Framework Core, and Microsoft SQL Server**. The application supports JWT authentication, refresh tokens, role-based authorization, employee management, and task management.

## Features

- JWT-based authentication
- Refresh token generation, renewal, and revocation
- Role-based authorization (Admin and Employee)
- Employee management
- Task creation, assignment, updating, and deletion
- Task status and priority management
- Task search, filtering, and pagination
- Dashboard summary and task statistics
- RESTful APIs
- Swagger / OpenAPI documentation
- Global exception handling
- Automated unit and integration tests

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, JavaScript, HTML5, CSS3, Bootstrap |
| API Communication | Axios |
| Backend | ASP.NET Core Web API, C# |
| ORM | Entity Framework Core, LINQ |
| Authentication | JWT, Refresh Tokens, BCrypt |
| Database | Microsoft SQL Server |
| Testing | xUnit, ASP.NET Core Integration Testing |
| Documentation | Swagger / OpenAPI |

## Project Structure

```text
Task-Management-System/
├── TaskManagement.API/
│   ├── Controllers/
│   ├── Middleware/
│   └── Program.cs
├── TaskManagement.Application/
├── TaskManagement.Domain/
├── TaskManagement.Infrastructure/
│   ├── Data/
│   ├── Repositories/
│   ├── Services/
│   └── Migrations/
├── TaskManagement.Tests/
├── taskmanagement-client/
├── Postman/
│   └── TaskManagementSystem.postman_collection.json
├── TaskManagementSystem.sln
└── README.md
```

## Prerequisites

Install the following before running the application:

- .NET 8 SDK
- Microsoft SQL Server or SQL Server LocalDB
- Node.js and npm
- Visual Studio 2022 or VS Code
- Git
- Entity Framework Core CLI (`dotnet-ef`)

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Developer-Ajit515/Task-Management-System.git
cd Task-Management-System
```

### 2. Configure SQL Server Using User Secrets

The backend uses the connection string named `conStr`.

For local development, use **ASP.NET Core User Secrets** to store database credentials and JWT configuration. This prevents sensitive values from being committed to GitHub.

Open PowerShell in the repository root:

```powershell
cd TaskManagement.API
```

Initialize User Secrets if they have not already been initialized:

```powershell
dotnet user-secrets init
```

Set your SQL Server connection string.

For SQL Server LocalDB with Windows authentication:

```powershell
dotnet user-secrets set "ConnectionStrings:conStr" "Server=(localdb)\MSSQLLocalDB;Database=TaskManagementDB;Trusted_Connection=True;TrustServerCertificate=True;"
```

For a regular SQL Server instance using SQL Server authentication, use your own server name and credentials:

```powershell
dotnet user-secrets set "ConnectionStrings:conStr" "Server=localhost;Database=TaskManagementDB;User Id=YOUR_USERNAME;Password=YOUR_PASSWORD;TrustServerCertificate=True;"
```

Replace the example values with your actual database configuration.

### 3. Configure JWT Using User Secrets

Generate a secure random JWT signing key. The key must contain at least 32 bytes.

Run this PowerShell code:

```powershell
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 64
$rng.GetBytes($bytes)
$key = [Convert]::ToBase64String($bytes)
$rng.Dispose()

dotnet user-secrets set "Jwt:Key" $key
```

Configure the remaining JWT settings:

```powershell
dotnet user-secrets set "Jwt:Issuer" "TaskManagementAPI"
dotnet user-secrets set "Jwt:Audience" "TaskManagementClient"
dotnet user-secrets set "Jwt:ExpiryInMinutes" "15"
dotnet user-secrets set "Jwt:RefreshTokenExpiryInDays" "7"
```

The application requires the JWT signing key, issuer, audience, and access token expiry configuration.

To verify your configuration keys:

```powershell
dotnet user-secrets list
```

Do not share or commit the generated JWT key, database password, or other secrets.

### 4. Configure the Bootstrap Admin Account

The application creates the initial Admin account during startup using the `AdminSeeder`.

Configure the initial Admin credentials using .NET User Secrets:

```powershell
dotnet user-secrets set "BootstrapAdmin:Email" "admin@example.com"
dotnet user-secrets set "BootstrapAdmin:Password" "YourStrongPassword@123"
```

Replace the example email and password with your own secure credentials.

Verify the configured secrets:

```powershell
dotnet user-secrets list
```

**Important:**

- Configure the Admin credentials before starting the API.
- Never commit real Admin credentials to GitHub.
- The Admin password is hashed before being stored in the database.
- The configured Admin email must be available for the initial account.
- If an account with the configured Admin email already exists, the seeder does not automatically promote that account to Admin.
- Database migrations must be applied before the application starts for the first time.

### 5. Apply Entity Framework Core Migrations

Database migrations are maintained in:

```text
TaskManagement.Infrastructure/Migrations/
```

Install the EF Core CLI if it is not already installed:

```bash
dotnet tool install --global dotnet-ef
```

If it is already installed, update it if required:

```bash
dotnet tool update --global dotnet-ef
```

Return to the repository root:

```powershell
cd ..
```

Apply migrations:

```bash
dotnet ef database update --project TaskManagement.Infrastructure --startup-project TaskManagement.API
```

Make sure your SQL Server instance is running and the connection string is correct before applying migrations.

For a clean development setup, use a new empty database or a separate disposable test database. Do not delete a database containing important data.

### 6. Run the Backend

From the repository root:

```bash
dotnet restore
dotnet build
dotnet run --project TaskManagement.API
```

The configured launch profiles use:

- HTTPS: `https://localhost:7246`
- HTTP: `http://localhost:5294`

Open Swagger:

```text
https://localhost:7246/swagger
```

If the API starts using a different profile or port, use the URL displayed in the terminal.

### 7. Run the Frontend

Open another terminal:

```bash
cd taskmanagement-client
npm install
npm run dev
```

Open the frontend development URL displayed in the terminal.

Ensure the frontend API configuration points to the running backend.

## Authentication and Authorization

The application uses JWT bearer authentication to protect secured API endpoints.

- **Admin:** Can manage employees, roles, and tasks.
- **Employee:** Can view assigned tasks and update permitted task statuses.
- **Access Tokens:** Used to authenticate requests to protected API endpoints.
- **Refresh Tokens:** Allow new access tokens to be issued without requiring the user to log in again.
- **Token Revocation:** Refresh tokens can be revoked during logout or renewal.

After successful login, the API returns authentication tokens.

Use the access token in Swagger or Postman:

```text
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## API Endpoints

The following are the main application endpoints.

### Authentication

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/Auth/register` | Public |
| POST | `/api/Auth/login` | Public |
| POST | `/api/Auth/refresh-token` | Public |
| POST | `/api/Auth/logout` | Public |
| POST | `/api/Auth/create-employee` | Admin |

### Employee Management

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/User` | Admin |
| GET | `/api/User/{id}` | Admin |
| PUT | `/api/User/{id}` | Admin |
| DELETE | `/api/User/{id}` | Admin |
| GET | `/api/User/employees` | Admin |

### Task Management

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/Tasks` | Admin |
| GET | `/api/Tasks/my-tasks` | Employee |
| GET | `/api/Tasks/{id}` | Admin |
| GET | `/api/Tasks/my-tasks/{id}` | Employee |
| POST | `/api/Tasks` | Admin |
| PUT | `/api/Tasks/{id}` | Admin |
| DELETE | `/api/Tasks/{id}` | Admin |
| PATCH | `/api/Tasks/{id}/status` | Employee |

The Admin task listing supports pagination, search, status, priority, and assigned-user filters.

### Roles and Dashboard

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/Role` | Admin |
| GET | `/api/Role/{id}` | Admin |
| GET | `/api/Role/name/{name}` | Admin |
| GET | `/api/Dashboard/summary` | Admin, Employee |

Check the controller authorization attributes for the exact permissions configured in your implementation.

## Task Priority and Status

**Priority**

| Value | Priority |
|---|---|
| 1 | Low |
| 2 | Medium |
| 3 | High |

**Status**

| Value | Status |
|---|---|
| 1 | Pending |
| 2 | InProgress |
| 3 | Completed |

## API Documentation

Swagger / OpenAPI is configured in the ASP.NET Core API project.

Start the backend and open:

```text
https://localhost:7246/swagger
```

Swagger supports API exploration and testing. For protected endpoints, authorize using a valid JWT bearer token.

## Postman API Collection

The project includes a Postman collection:

```text
Postman/TaskManagementSystem.postman_collection.json
```

The collection includes requests for:

- Admin and Employee login
- Employee registration
- Admin employee creation
- Access token refresh
- Logout
- User management
- Task management
- Role management
- Dashboard summary

### Postman Setup

1. Import `Postman/TaskManagementSystem.postman_collection.json` into Postman.
2. Set `baseUrl` to your running API URL.
3. Configure `adminEmail` and `adminPassword`.
4. Run the Login Admin request.
5. Configure the Employee credentials.
6. Run the Login Employee request.
7. Use the Admin and Employee requests with their respective tokens.

The collection maintains separate Admin and Employee access tokens and refresh tokens.

Update `userId`, `roleId`, and `taskId` to match records in your database.

## Automated Testing

The project includes automated unit and integration tests using xUnit.

### Test Coverage

- Task creation with valid and invalid data
- Task update and deletion
- Task ownership and authorization validation
- Pagination and input validation
- API authentication and role-based authorization
- Controller HTTP response validation

### Run Tests

From the solution root:

```bash
dotnet restore
dotnet build
dotnet test
```

Check the test output for the current number of passed and failed tests.

## Frontend Production Build

From the frontend directory:

```bash
npm install
npm run build
```

A successful production build confirms that the frontend compiles without build-time errors.

## Clean Database Verification

For a fresh development environment:

1. Configure a new, empty development database.
2. Configure SQL Server, JWT, and Bootstrap Admin settings using User Secrets.
3. Apply Entity Framework Core migrations.
4. Start the API.
5. Verify that the initial Admin account is created.
6. Log in as Admin.
7. Create an Employee account.
8. Log in as Employee.
9. Create and assign a task as Admin.
10. Verify that the Employee can view and update the assigned task status.
11. Verify that Employee accounts cannot access Admin-only operations.

Only consider the clean setup verified after completing these steps successfully.

## Screenshots

### Login Page

![Login Page](screenshots/login.png)

### Admin Dashboard

![Admin Dashboard](screenshots/admin-dashboard.png)

### Task List

![Task List](screenshots/task-list.png)

### Create Task

![Create Task](screenshots/Create-Task.png)

### Employee Dashboard

![Employee Dashboard](screenshots/Employee-dashboard.png)

## Future Improvements

- Improved frontend refresh-token handling
- Enhanced employee assignment experience
- Additional reporting and dashboard features
- Deployment configuration
- Continuous Integration using GitHub Actions

## Author

**Ajit Singh**

- GitHub: https://github.com/Developer-Ajit515
- LinkedIn: https://www.linkedin.com/in/ajit-singh-62836b158/
