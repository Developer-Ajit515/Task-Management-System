
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

    public async Task<PagedResultDto<TaskResponseDto>> GetMyTasksAsync(
        int userId,
        int pageNumber,
        int pageSize,
        string? search,
        TaskManagement.Domain.Enums.TaskStatus? status)
    {
        ValidatePagination(ref pageNumber, ref pageSize);

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

    public async Task<TaskResponseDto?> GetTaskByIdAsync(int id)
    {
        var task = await _taskRepository.GetByIdAsync(id);

        return task == null ? null : MapToDto(task);
    }

    public async Task<TaskResponseDto> CreateTaskAsync(
        CreateTaskDto dto,
        int createdByUserId)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            throw new ArgumentException("Task title is required.");

        if (!Enum.IsDefined(typeof(TaskPriority), dto.Priority))
            throw new ArgumentException("Invalid task priority.");

        await ValidateAssignedUserAsync(dto.AssignedUserId);

        var task = new TaskItem
        {
            Title = dto.Title.Trim(),
            Description = dto.Description,
            Priority = dto.Priority,
            Status = TaskManagement.Domain.Enums.TaskStatus.Pending,
            AssignedUserId = dto.AssignedUserId,
            CreatedByUserId = createdByUserId,
            CreatedDate = DateTime.UtcNow
        };

        await _taskRepository.AddAsync(task);

        var savedTask = await _taskRepository.GetByIdAsync(task.Id);

        return MapToDto(savedTask!);
    }

    public async Task UpdateTaskAsync(int id, UpdateTaskDto dto)
    {
        var task = await _taskRepository.GetByIdAsync(id);

        if (task == null)
            throw new KeyNotFoundException("Task not found.");

        if (string.IsNullOrWhiteSpace(dto.Title))
            throw new ArgumentException("Task title is required.");

        if (!Enum.IsDefined(typeof(TaskPriority), dto.Priority))
            throw new ArgumentException("Invalid task priority.");

        await ValidateAssignedUserAsync(dto.AssignedUserId);

        task.Title = dto.Title.Trim();
        task.Description = dto.Description;
        task.Priority = dto.Priority;
        task.AssignedUserId = dto.AssignedUserId;
        task.UpdatedDate = DateTime.UtcNow;

        _taskRepository.Update(task);

        await _taskRepository.SaveChangesAsync();
    }

    public async Task DeleteTaskAsync(int id)
    {
        var task = await _taskRepository.GetByIdAsync(id);

        if (task == null)
            throw new KeyNotFoundException("Task not found.");

        _taskRepository.Delete(task);

        await _taskRepository.SaveChangesAsync();
    }

    public async Task UpdateTaskStatusAsync(
        int id,
        int userId,
        TaskManagement.Domain.Enums.TaskStatus status)
    {
        if (!Enum.IsDefined(
            typeof(TaskManagement.Domain.Enums.TaskStatus), status))
        {
            throw new ArgumentException("Invalid task status.");
        }

        var task = await _taskRepository.GetByIdAsync(id);

        if (task == null)
            throw new KeyNotFoundException("Task not found.");

        if (task.AssignedUserId != userId)
            throw new ForbiddenException(
     "You can only update your assigned tasks.");

        task.Status = status;
        task.UpdatedDate = DateTime.UtcNow;

        _taskRepository.Update(task);

        await _taskRepository.SaveChangesAsync();
    }


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
