using Microsoft.EntityFrameworkCore;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Interfaces.IRepository;
using TaskManagement.Infrastructure.Data;

namespace TaskManagement.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    // GET USER BY ID
    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users
            .Include(x => x.UserRoles)
                .ThenInclude(x => x.Role)
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    // GET ALL USERS
    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await _context.Users
            .AsNoTracking()
            .Include(x => x.UserRoles)
                .ThenInclude(x => x.Role)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    // CHECK ACTIVE EMPLOYEE
    public async Task<bool> IsActiveEmployeeAsync(int userId)
    {
        return await _context.Users
            .AnyAsync(user =>
                user.Id == userId &&
                user.IsActive &&
                user.UserRoles.Any(userRole =>
                    userRole.Role.Name == "Employee"));
    }

    // CHECK EMAIL EXISTS
    public async Task<bool> EmailExistsAsync(
        string email,
        int? excludeUserId = null)
    {
        return await _context.Users
            .AnyAsync(user =>
                user.Email == email &&
                (!excludeUserId.HasValue ||
                 user.Id != excludeUserId.Value));
    }

    // UPDATE USER
    public async Task UpdateAsync(User user)
    {
        _context.Users.Update(user);

        await _context.SaveChangesAsync();
    }

    // DEACTIVATE USER
    public async Task<bool> DeactivateAsync(int id)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Id == id);

        if (user == null)
            return false;

        user.IsActive = false;

        await _context.SaveChangesAsync();

        return true;
    }
}