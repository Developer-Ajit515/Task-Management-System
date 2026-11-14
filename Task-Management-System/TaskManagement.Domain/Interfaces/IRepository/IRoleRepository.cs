using TaskManagement.Domain.Entities;

namespace TaskManagement.Domain.Interfaces.IRepository;

public interface IRoleRepository
{
    Task<Role?> GetByIdAsync(int id);

    Task<Role?> GetByNameAsync(string name);

    Task<IEnumerable<Role>> GetAllAsync();

    Task<bool> ExistsAsync(int id);

    Task<bool> ExistsByNameAsync(string name);
}