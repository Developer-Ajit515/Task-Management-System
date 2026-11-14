
using TaskManagement.Domain.Entities;

namespace TaskManagement.Domain.Interfaces.IRepository;

public interface IUserRepository
{
    // GET USER BY ID
    Task<User?> GetByIdAsync(int id);

    // GET ALL USERS
    Task<IEnumerable<User>> GetAllAsync();

    // CHECK ACTIVE EMPLOYEE
    Task<bool> IsActiveEmployeeAsync(int userId);

    // CHECK EMAIL EXISTS
    Task<bool> EmailExistsAsync(
        string email,
        int? excludeUserId = null);

    // UPDATE USER
    Task UpdateAsync(User user);

    // DEACTIVATE USER
    Task<bool> DeactivateAsync(int id);

    // GET ACTIVE EMPLOYEES
    Task<IEnumerable<User>> GetActiveEmployeesAsync();
}
