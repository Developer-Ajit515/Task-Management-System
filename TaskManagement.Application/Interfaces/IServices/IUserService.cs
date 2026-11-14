
using TaskManagement.Application.DTOs.Auth;

namespace TaskManagement.Application.Interfaces.IServices;

public interface IUserService
{
    Task<UserResponseDto?> GetByIdAsync(int id);

    Task<IEnumerable<UserResponseDto>> GetAllAsync();

    Task<IEnumerable<UserResponseDto>> GetActiveEmployeesAsync();

    Task<bool> IsActiveEmployeeAsync(int userId);

    Task<UserResponseDto> UpdateAsync(int id, UpdateUserDto dto);

    Task<bool> DeactivateAsync(int id);
}
