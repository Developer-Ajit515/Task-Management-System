using TaskManagement.Application.DTOs.Auth;

using TaskManagement.Application.Interfaces.IServices;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Interfaces.IRepository;

namespace TaskManagement.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    // GET USER BY ID
    public async Task<UserResponseDto?> GetByIdAsync(int id)
    {
        if (id <= 0)
            throw new ArgumentException("Invalid user ID.");

        var user = await _userRepository.GetByIdAsync(id);

        if (user == null)
            return null;

        return MapToResponse(user);
    }

    // GET ALL USERS
    public async Task<IEnumerable<UserResponseDto>> GetAllAsync()
    {
        var users = await _userRepository.GetAllAsync();

        return users.Select(MapToResponse).ToList();
    }

    // CHECK ACTIVE EMPLOYEE
    public async Task<bool> IsActiveEmployeeAsync(int userId)
    {
        if (userId <= 0)
            return false;

        return await _userRepository.IsActiveEmployeeAsync(userId);
    }

    // UPDATE USER
    public async Task<UserResponseDto> UpdateAsync(
        int id,
        UpdateUserDto dto)
    {
        if (id <= 0)
            throw new ArgumentException("Invalid user ID.");

        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        string fullName = dto.FullName.Trim();
        string email = dto.Email.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(fullName))
            throw new ArgumentException("Full name is required.");

        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email is required.");

        var user = await _userRepository.GetByIdAsync(id);

        if (user == null)
            throw new KeyNotFoundException("User not found.");

        bool emailExists = await _userRepository.EmailExistsAsync(
            email,
            id
        );

        if (emailExists)
            throw new InvalidOperationException(
                "Email already exists.");

        user.FullName = fullName;
        user.Email = email;

        await _userRepository.UpdateAsync(user);

        return MapToResponse(user);
    }

    // DEACTIVATE USER
    public async Task<bool> DeactivateAsync(int id)
    {
        if (id <= 0)
            throw new ArgumentException("Invalid user ID.");

        return await _userRepository.DeactivateAsync(id);
    }

    // MAP ENTITY TO DTO
    private static UserResponseDto MapToResponse(User user)
    {
        var roles = user.UserRoles
            .Select(x => x.Role.Name)
            .ToList();

        return new UserResponseDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = roles.FirstOrDefault() ?? string.Empty,
            Roles = roles,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }
}