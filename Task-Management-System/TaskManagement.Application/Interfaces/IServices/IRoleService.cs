using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Interfaces.IServices;

public interface IRoleService
{
    Task<Role?> GetByIdAsync(int id);

    Task<Role?> GetByNameAsync(string name);

    Task<IEnumerable<Role>> GetAllAsync();
}