
using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using TaskManagement.Application.DTOs.Tasks;
using TaskManagement.Application.Interfaces.IServices;
using TaskManagement.Domain.Enums;

namespace TaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    // ==========================================
    // ADMIN: GET ALL TASKS
    // ==========================================

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllTasks(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] TaskManagement.Domain.Enums.TaskStatus? status = null,
        [FromQuery] TaskPriority? priority = null,
        [FromQuery] int? assignedUserId = null)
    {
        var validation = ValidatePagination(pageNumber, pageSize);

        if (validation != null)
            return BadRequest(new { message = validation });

        var result = await _taskService.GetAllTasksAsync(
           pageNumber,
           pageSize,
           search,
           status,
           priority,
           assignedUserId
);

        return Ok(result);
    }

    // ==========================================
    // EMPLOYEE: GET ASSIGNED TASKS
    // ==========================================

    [HttpGet("my-tasks")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> GetMyTasks(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] TaskManagement.Domain.Enums.TaskStatus? status = null)
    {
        var validation = ValidatePagination(pageNumber, pageSize);

        if (validation != null)
            return BadRequest(new { message = validation });

        var userId = GetCurrentUserId();

        var result = await _taskService.GetMyTasksAsync(
            userId,
            pageNumber,
            pageSize,
            search,
            status
        );

        return Ok(result);
    }

    // ==========================================
    // ADMIN: GET TASK BY ID
    // ==========================================

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetTaskById(int id)
    {
        if (id <= 0)
            return BadRequest(new { message = "Invalid task ID." });

        var result = await _taskService.GetTaskByIdAsync(id);

        if (result == null)
            return NotFound(new { message = "Task not found." });

        return Ok(result);
    }


    // ==========================================
    // EMPLOYEE: GET MY TASK BY ID
    // ==========================================

    [HttpGet("my-tasks/{id:int}")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> GetMyTaskById(int id)
    {
        if (id <= 0)
            return BadRequest(new
            {
                message = "Invalid task ID."
            });

        var userId = GetCurrentUserId();

        var result = await _taskService.GetMyTaskByIdAsync(
            id,
            userId
        );

        return Ok(new
        {
            success = true,
            message = "Task retrieved successfully.",
            data = result
        });
    }

    // ==========================================
    // ADMIN: CREATE TASK
    // ==========================================

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateTask(
        [FromBody] CreateTaskDto dto)
    {
        var userId = GetCurrentUserId();

        var result = await _taskService.CreateTaskAsync(
            dto,
            userId
        );

        return CreatedAtAction(
            nameof(GetTaskById),
            new { id = result.Id },
            result
        );
    }

    // ==========================================
    // ADMIN: UPDATE TASK
    // ==========================================

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateTask(
        int id,
        [FromBody] UpdateTaskDto dto)
    {
        if (id <= 0)
            return BadRequest(new { message = "Invalid task ID." });

        await _taskService.UpdateTaskAsync(id, dto);

        return Ok(new
        {
            success = true,
            message = "Task updated successfully."
        });
    }

    // ==========================================
    // ADMIN: DELETE TASK
    // ==========================================

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        if (id <= 0)
            return BadRequest(new { message = "Invalid task ID." });

        await _taskService.DeleteTaskAsync(id);

        return Ok(new
        {
            success = true,
            message = "Task deleted successfully."
        });
    }

    // ==========================================
    // EMPLOYEE: UPDATE ASSIGNED TASK STATUS
    // ==========================================

    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> UpdateTaskStatus(
        int id,
        [FromBody] UpdateTaskStatusDto dto)
    {
        if (id <= 0)
            return BadRequest(new { message = "Invalid task ID." });

        var userId = GetCurrentUserId();

        await _taskService.UpdateTaskStatusAsync(
            id,
            userId,
            dto.Status
        );

        return Ok(new
        {
            success = true,
            message = "Task status updated successfully."
        });
    }

    // ==========================================
    // PAGINATION VALIDATION
    // ==========================================

    private static string? ValidatePagination(
        int pageNumber,
        int pageSize)
    {
        if (pageNumber < 1)
            return "Page number must be greater than zero.";

        if (pageSize < 1 || pageSize > 100)
            return "Page size must be between 1 and 100.";

        return null;
    }

    // ==========================================
    // GET CURRENT USER ID FROM JWT
    // ==========================================

    private int GetCurrentUserId()
    {
        var userId = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        );

        if (!int.TryParse(userId, out var id))
        {
            throw new UnauthorizedAccessException(
                "Invalid user token."
            );
        }

        return id;
    }
}
