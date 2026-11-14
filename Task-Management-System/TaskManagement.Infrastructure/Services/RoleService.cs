using TaskManagement.Application.Interfaces.IServices;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Interfaces.IRepository;

namespace TaskManagement.Application.Services;

public class RoleService : IRoleService
{
    private readonly IRoleRepository _roleRepository;

    public RoleService(IRoleRepository roleRepository)
    {
        _roleRepository = roleRepository;
    }

    public async Task<Role?> GetByIdAsync(int id)
    {
        if (id <= 0)
            throw new ArgumentException("Invalid role ID.");

        return await _roleRepository.GetByIdAsync(id);
    }

    public async Task<Role?> GetByNameAsync(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Role name is required.");

        return await _roleRepository.GetByNameAsync(name.Trim());
    }

    public async Task<IEnumerable<Role>> GetAllAsync()
    {
        return await _roleRepository.GetAllAsync();
    }
}