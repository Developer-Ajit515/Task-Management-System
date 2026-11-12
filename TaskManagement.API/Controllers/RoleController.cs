using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.Application.Interfaces.IServices;

namespace TaskManagement.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class RoleController : ControllerBase
{
    private readonly IRoleService _roleService;

    public RoleController(IRoleService roleService)
    {
        _roleService = roleService;
    }

    // GET: api/Role
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var roles = await _roleService.GetAllAsync();

        return Ok(new
        {
            success = true,
            data = roles
        });
    }

    // GET: api/Role/1
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetById(int id)
    {
        var role = await _roleService.GetByIdAsync(id);

        if (role == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Role not found."
            });
        }

        return Ok(new
        {
            success = true,
            data = role
        });
    }

    // GET: api/Role/name/Admin
    [HttpGet("name/{name}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetByName(string name)
    {
        var role = await _roleService.GetByNameAsync(name);

        if (role == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Role not found."
            });
        }

        return Ok(new
        {
            success = true,
            data = role
        });
    }
}