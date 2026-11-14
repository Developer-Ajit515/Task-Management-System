
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

using System.Security.Claims;
using System.Text;

using TaskManagement.API.Middleware;

using TaskManagement.Application.Interfaces;
using TaskManagement.Application.Interfaces.IServices;
using TaskManagement.Application.Services;

using TaskManagement.Domain.Interfaces.IRepository;

using TaskManagement.Infrastructure.Data;
using TaskManagement.Infrastructure.Repositories;
using TaskManagement.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. CONFIGURATION
// ==========================================

var configuration = builder.Configuration;

var jwtKey = configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT Key is missing.");

var jwtIssuer = configuration["Jwt:Issuer"]
    ?? throw new InvalidOperationException("JWT Issuer is missing.");

var jwtAudience = configuration["Jwt:Audience"]
    ?? throw new InvalidOperationException("JWT Audience is missing.");

if (Encoding.UTF8.GetByteCount(jwtKey) < 32)
{
    throw new InvalidOperationException(
        "JWT Key must be at least 32 bytes long.");
}

// ==========================================
// 2. DATABASE CONFIGURATION
// ==========================================

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(
        configuration.GetConnectionString("conStr")
    );
});

// ==========================================
// 3. REPOSITORY DEPENDENCY INJECTION
// ==========================================

builder.Services.AddScoped<ITaskRepository, TaskRepository>();
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();



// ==========================================
// 4. SERVICE DEPENDENCY INJECTION
// ==========================================

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

// ==========================================
// 5. CONTROLLERS
// ==========================================

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();

// ==========================================
// 6. SWAGGER JWT CONFIGURATION
// ==========================================

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Task Management API",
        Version = "v1",
        Description = "Task Management System API"
    });

    options.AddSecurityDefinition("Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Enter your JWT token here."
        });

    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
});

// ==========================================
// 7. JWT AUTHENTICATION
// ==========================================

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme =
            JwtBearerDefaults.AuthenticationScheme;

        options.DefaultChallengeScheme =
            JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine("JWT AUTHENTICATION FAILED:");
                Console.WriteLine(context.Exception.ToString());

                return Task.CompletedTask;
            }
        };

        options.RequireHttpsMetadata = true;

        options.SaveToken = true;

        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer = jwtIssuer,
                ValidAudience = jwtAudience,

                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtKey)
                ),

                RoleClaimType = ClaimTypes.Role,
                NameClaimType = ClaimTypes.Name,

                ClockSkew = TimeSpan.Zero
            };
    });

// ==========================================
// 8. AUTHORIZATION
// ==========================================

builder.Services.AddAuthorization();

// ==========================================
// 9. CORS CONFIGURATION
// ==========================================

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:5175"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ==========================================
// 10. BUILD APPLICATION
// ==========================================

var app = builder.Build();

// ==========================================
// 11. GLOBAL EXCEPTION HANDLING
// MUST BE FIRST IN PIPELINE
// ==========================================

app.UseMiddleware<GlobalExceptionMiddleware>();

// ==========================================
// 12. SWAGGER
// ==========================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI();
}

// ==========================================
// 13. ADMIN SEEDER
// ==========================================

using (var scope = app.Services.CreateScope())
{
    var seeder = new AdminSeeder(
        scope.ServiceProvider.GetRequiredService<AppDbContext>(),
        scope.ServiceProvider.GetRequiredService<IConfiguration>()
    );

    await seeder.SeedAdminAsync();
}

// ==========================================
// 14. MIDDLEWARE CONFIGURATION
// ==========================================

app.UseHttpsRedirection();

app.UseCors("AllowReact");

app.UseAuthentication();

app.UseAuthorization();

// ==========================================
// 15. MAP CONTROLLERS
// ==========================================

app.MapControllers();

// ==========================================
// 16. RUN APPLICATION
// ==========================================

app.Run();
