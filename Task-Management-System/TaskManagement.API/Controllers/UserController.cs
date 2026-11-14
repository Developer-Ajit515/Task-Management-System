
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.Application.DTOs.Auth;

using TaskManagement.Application.Interfaces.IServices;

namespace TaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    // ==========================================
    // GET ALL USERS (ADMIN ONLY)
    // ==========================================

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var users = await _userService.GetAllAsync();

        return Ok(new
        {
            success = true,
            message = "Users retrieved successfully.",
            data = users
        });
    }

    // ==========================================
    // GET USER BY ID (ADMIN ONLY)
    // ==========================================

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _userService.GetByIdAsync(id);

        if (user == null)
        {
            return NotFound(new
            {
                success = false,
                message = "User not found."
            });
        }

        return Ok(new
        {
            success = true,
            message = "User retrieved successfully.",
            data = user
        });
    }

    // ==========================================
    // UPDATE USER (ADMIN ONLY)
    // ==========================================

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateUserDto dto)
    {
        var user = await _userService.UpdateAsync(id, dto);

        return Ok(new
        {
            success = true,
            message = "User updated successfully.",
            data = user
        });
    }

    // ==========================================
    // DEACTIVATE USER (ADMIN ONLY)
    // ==========================================

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Deactivate(int id)
    {
        var result = await _userService.DeactivateAsync(id);

        if (!result)
        {
            return NotFound(new
            {
                success = false,
                message = "User not found or already inactive."
            });
        }

        return Ok(new
        {
            success = true,
            message = "User deactivated successfully."
        });
    }
}
