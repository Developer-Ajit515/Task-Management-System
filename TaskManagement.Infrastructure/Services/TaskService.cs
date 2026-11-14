
using TaskManagement.Application.DTOs.Tasks;
using TaskManagement.Application.Interfaces.IServices;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;
using TaskManagement.Domain.Interfaces.IRepository;
using TaskManagement.Application.Exceptions;

namespace TaskManagement.Application.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _taskRepository;
    private readonly IUserRepository _userRepository;

    public TaskService(
        ITaskRepository taskRepository,
        IUserRepository userRepository)
    {
        _taskRepository = taskRepository;
        _userRepository = userRepository;
    }

    // ==========================================
    // ADMIN: GET ALL TASKS
    // ==========================================

    public async Task<PagedResultDto<TaskResponseDto>> GetAllTasksAsync(
        int pageNumber,
        int pageSize,
        string? search,
        TaskManagement.Domain.Enums.TaskStatus? status,
        TaskPriority? priority,
        int? assignedUserId = null)
    {
        ValidatePagination(ref pageNumber, ref pageSize);

        if (assignedUserId.HasValue && assignedUserId.Value <= 0)
            throw new ArgumentException("Invalid assigned user ID.");

        if (status.HasValue &&
            !Enum.IsDefined(
                typeof(TaskManagement.Domain.Enums.TaskStatus),
                status.Value))
        {
            throw new ArgumentException("Invalid task status.");
        }

        if (priority.HasValue &&
            !Enum.IsDefined(typeof(TaskPriority), priority.Value))
        {
            throw new ArgumentException("Invalid task priority.");
        }

        var result = await _taskRepository.GetPagedAsync(
            pageNumber,
            pageSize,
            search,
            status,
            priority,
            assignedUserId);

        return CreatePagedResult(
            result.Items,
            pageNumber,
            pageSize,
            result.TotalCount);
    }

    // ==========================================
    // EMPLOYEE: GET MY ASSIGNED TASKS
    // ==========================================

    public async Task<PagedResultDto<TaskResponseDto>> GetMyTasksAsync(
        int userId,
        int pageNumber,
        int pageSize,
        string? search,
        TaskManagement.Domain.Enums.TaskStatus? status)
    {
        ValidatePagination(ref pageNumber, ref pageSize);

        if (userId <= 0)
            throw new UnauthorizedAccessException("Invalid user ID.");

        if (status.HasValue &&
            !Enum.IsDefined(
                typeof(TaskManagement.Domain.Enums.TaskStatus),
                status.Value))
        {
            throw new ArgumentException("Invalid task status.");
        }

        var result = await _taskRepository.GetPagedAsync(
            pageNumber,
            pageSize,
            search,
            status,
            null,
            userId);

        return CreatePagedResult(
            result.Items,
            pageNumber,
            pageSize,
            result.TotalCount);
    }

    // ==========================================
    // ADMIN: GET TASK BY ID
    // ==========================================

    public async Task<TaskResponseDto?> GetTaskByIdAsync(int id)
    {
        if (id <= 0)
            throw new ArgumentException("Invalid task ID.");

        var task = await _taskRepository.GetByIdAsync(id);

        return task == null ? null : MapToDto(task);
    }

    // ==========================================
    // EMPLOYEE: GET MY TASK BY ID
    // ==========================================

    public async Task<TaskResponseDto?> GetMyTaskByIdAsync(
        int id,
        int userId)
    {
        if (id <= 0)
            throw new ArgumentException("Invalid task ID.");

        if (userId <= 0)
            throw new UnauthorizedAccessException("Invalid user ID.");

        var task = await _taskRepository.GetByIdAsync(id);

        // Employee can only view assigned tasks.
        if (task == null || task.AssignedUserId != userId)
            throw new KeyNotFoundException("Task not found.");

        return MapToDto(task);
    }

    // ==========================================
    // ADMIN: CREATE TASK
    // ==========================================

    public async Task<TaskResponseDto> CreateTaskAsync(
        CreateTaskDto dto,
        int createdByUserId)
    {
        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        if (createdByUserId <= 0)
            throw new UnauthorizedAccessException("Invalid creator ID.");

        if (string.IsNullOrWhiteSpace(dto.Title))
            throw new ArgumentException("Task title is required.");

        if (!Enum.IsDefined(typeof(TaskPriority), dto.Priority))
            throw new ArgumentException("Invalid task priority.");

        await ValidateAssignedUserAsync(dto.AssignedUserId);

        var task = new TaskItem
        {
            Title = dto.Title.Trim(),

            Description = string.IsNullOrWhiteSpace(dto.Description)
                ? null
                : dto.Description.Trim(),

            Priority = dto.Priority,

            Status = TaskManagement.Domain.Enums.TaskStatus.Pending,

            AssignedUserId = dto.AssignedUserId,

            CreatedByUserId = createdByUserId,

            CreatedDate = DateTime.UtcNow
        };

        await _taskRepository.AddAsync(task);

        var savedTask = await _taskRepository.GetByIdAsync(task.Id);

        if (savedTask == null)
            throw new InvalidOperationException(
                "Task could not be retrieved after creation.");

        return MapToDto(savedTask);
    }

    // ==========================================
    // ADMIN: UPDATE TASK
    // ==========================================

    public async Task UpdateTaskAsync(
        int id,
        UpdateTaskDto dto)
    {
        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        if (id <= 0)
            throw new ArgumentException("Invalid task ID.");

        var task = await _taskRepository.GetByIdAsync(id);

        if (task == null)
            throw new KeyNotFoundException("Task not found.");

        if (string.IsNullOrWhiteSpace(dto.Title))
            throw new ArgumentException("Task title is required.");

        if (!Enum.IsDefined(typeof(TaskPriority), dto.Priority))
            throw new ArgumentException("Invalid task priority.");

        await ValidateAssignedUserAsync(dto.AssignedUserId);

        task.Title = dto.Title.Trim();

        task.Description = string.IsNullOrWhiteSpace(dto.Description)
            ? null
            : dto.Description.Trim();

        task.Priority = dto.Priority;

        task.AssignedUserId = dto.AssignedUserId;

        task.UpdatedDate = DateTime.UtcNow;

        _taskRepository.Update(task);

        await _taskRepository.SaveChangesAsync();
    }

    // ==========================================
    // ADMIN: DELETE TASK
    // ==========================================

    public async Task DeleteTaskAsync(int id)
    {
        if (id <= 0)
            throw new ArgumentException("Invalid task ID.");

        var task = await _taskRepository.GetByIdAsync(id);

        if (task == null)
            throw new KeyNotFoundException("Task not found.");

        _taskRepository.Delete(task);

        await _taskRepository.SaveChangesAsync();
    }

    // ==========================================
    // EMPLOYEE: UPDATE ASSIGNED TASK STATUS
    // ==========================================

    public async Task UpdateTaskStatusAsync(
        int id,
        int userId,
        TaskManagement.Domain.Enums.TaskStatus status)
    {
        if (id <= 0)
            throw new ArgumentException("Invalid task ID.");

        if (userId <= 0)
            throw new UnauthorizedAccessException("Invalid user ID.");

        if (!Enum.IsDefined(
            typeof(TaskManagement.Domain.Enums.TaskStatus),
            status))
        {
            throw new ArgumentException("Invalid task status.");
        }

        var task = await _taskRepository.GetByIdAsync(id);

        if (task == null)
            throw new KeyNotFoundException("Task not found.");

        if (task.AssignedUserId != userId)
        {
            throw new ForbiddenException(
                "You can only update your assigned tasks.");
        }

        task.Status = status;

        task.UpdatedDate = DateTime.UtcNow;

        _taskRepository.Update(task);

        await _taskRepository.SaveChangesAsync();
    }

    // ==========================================
    // VALIDATE ASSIGNED EMPLOYEE
    // ==========================================

    private async Task ValidateAssignedUserAsync(int? userId)
    {
        if (!userId.HasValue)
            return;

        if (userId.Value <= 0)
            throw new ArgumentException("Invalid assigned user ID.");

        var isActiveEmployee =
            await _userRepository.IsActiveEmployeeAsync(userId.Value);

        if (!isActiveEmployee)
        {
            throw new ArgumentException(
                "Task can only be assigned to an active Employee.");
        }
    }

    // ==========================================
    // PAGINATION VALIDATION
    // ==========================================

    private static void ValidatePagination(
        ref int pageNumber,
        ref int pageSize)
    {
        if (pageNumber < 1)
            pageNumber = 1;

        if (pageSize < 1)
            pageSize = 10;

        if (pageSize > 100)
            pageSize = 100;
    }

    // ==========================================
    // CREATE PAGED RESULT
    // ==========================================

    private static PagedResultDto<TaskResponseDto> CreatePagedResult(
        List<TaskItem> tasks,
        int pageNumber,
        int pageSize,
        int totalRecords)
    {
        return new PagedResultDto<TaskResponseDto>
        {
            Data = tasks.Select(MapToDto).ToList(),

            PageNumber = pageNumber,

            PageSize = pageSize,

            TotalRecords = totalRecords,

            TotalPages = (int)Math.Ceiling(
                totalRecords / (double)pageSize)
        };
    }

    // ==========================================
    // MAP ENTITY TO DTO
    // ==========================================

    private static TaskResponseDto MapToDto(TaskItem task)
    {
        return new TaskResponseDto
        {
            Id = task.Id,

            Title = task.Title,

            Description = task.Description,

            Priority = task.Priority,

            Status = task.Status,

            AssignedUserId = task.AssignedUserId,

            AssignedUserName = task.AssignedUser?.FullName,

            CreatedByName = task.CreatedByUser?.FullName ?? "",

            CreatedDate = task.CreatedDate
        };
    }
}
