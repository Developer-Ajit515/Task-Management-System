
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TaskManagement.Domain.Entities;
using TaskManagement.Infrastructure.Data;

namespace TaskManagement.Infrastructure.Services;

public class AdminSeeder
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AdminSeeder(
        AppDbContext context,
        IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task SeedAdminAsync()
    {
        string? email = _configuration["BootstrapAdmin:Email"];
        string? password = _configuration["BootstrapAdmin:Password"];

        if (string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(password))
        {
            return;
        }

        email = email.Trim().ToLower();

        var adminRole = await _context.Roles
            .FirstOrDefaultAsync(r => r.Name == "Admin");

        if (adminRole == null)
            throw new InvalidOperationException("Admin role not found.");

        var existingUser = await _context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Email == email);

        // Never automatically promote an existing Employee.
        if (existingUser != null)
        {
            return;
        }

        var admin = new User
        {
            FullName = "System Administrator",
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        admin.UserRoles.Add(new UserRole
        {
            RoleId = adminRole.Id
        });

        _context.Users.Add(admin);

        await _context.SaveChangesAsync();
    }
}
