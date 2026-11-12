
using TaskManagement.Application.DTOs.Tasks;
using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.Interfaces.IServices;

public interface ITaskService
{
    // Admin: Get all tasks with pagination and filters
    Task<PagedResultDto<TaskResponseDto>> GetAllTasksAsync(
        int pageNumber,
        int pageSize,
        string? search,
        TaskManagement.Domain.Enums.TaskStatus? status,
        TaskPriority? priority,
        int? assignedUserId = null);

    // Employee: Get only assigned tasks
    Task<PagedResultDto<TaskResponseDto>> GetMyTasksAsync(
        int userId,
        int pageNumber,
        int pageSize,
        string? search,
        TaskManagement.Domain.Enums.TaskStatus? status);

    // Get task by ID
    Task<TaskResponseDto?> GetTaskByIdAsync(int id);

    // Create task
    Task<TaskResponseDto> CreateTaskAsync(
        CreateTaskDto dto,
        int createdByUserId);

    // Update task
    Task UpdateTaskAsync(int id, UpdateTaskDto dto);

    // Delete task
    Task DeleteTaskAsync(int id);

    // Employee: Update assigned task status
    Task UpdateTaskStatusAsync(
        int id,
        int userId,
        TaskManagement.Domain.Enums.TaskStatus status);
}
