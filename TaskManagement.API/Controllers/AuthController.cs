
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

using TaskManagement.Application.DTOs.Auth;
using TaskManagement.Application.Interfaces;

namespace TaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    // ==========================================
    // REGISTER
    // ==========================================

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var result = await _authService.RegisterAsync(dto);

        return Ok(new
        {
            message = "Registration successful.",
            data = result
        });
    }

    // ==========================================
    // LOGIN
    // ==========================================

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);

        return Ok(new
        {
            message = "Login successful.",
            data = result
        });
    }

    // ==========================================
    // REFRESH TOKEN
    // ==========================================

    [AllowAnonymous]
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken(
        RefreshTokenRequestDto dto)
    {
        var result = await _authService.RefreshTokenAsync(dto);

        return Ok(new
        {
            message = "Token refreshed successfully.",
            data = result
        });
    }

    // ==========================================
    // LOGOUT
    // ==========================================

    [AllowAnonymous]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(
        RefreshTokenRequestDto dto)
    {
        await _authService.RevokeRefreshTokenAsync(dto);

        return Ok(new
        {
            message = "Logout successful."
        });
    }

    // ==========================================
    // CREATE EMPLOYEE (ADMIN ONLY)
    // ==========================================

    [Authorize(Roles = "Admin")]
    [HttpPost("create-employee")]
    public async Task<IActionResult> CreateEmployee(
        CreateUserDto dto)
    {
        var result = await _authService.CreateEmployeeAsync(dto);

        return StatusCode(201, new
        {
            message = "Employee created successfully.",
            data = result
        });
    }
}
