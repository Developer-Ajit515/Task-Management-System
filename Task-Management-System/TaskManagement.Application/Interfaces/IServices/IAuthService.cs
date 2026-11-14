
using TaskManagement.Application.DTOs.Auth;

namespace TaskManagement.Application.Interfaces;

public interface IAuthService
{
    
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<UserResponseDto> CreateEmployeeAsync(CreateUserDto dto);
    Task<AuthResponseDto> RefreshTokenAsync( RefreshTokenRequestDto dto);
    Task RevokeRefreshTokenAsync( RefreshTokenRequestDto dto);
}
