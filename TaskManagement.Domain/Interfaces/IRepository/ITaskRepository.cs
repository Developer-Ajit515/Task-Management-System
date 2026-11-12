using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;

namespace TaskManagement.Domain.Interfaces.IRepository;

public interface ITaskRepository
{
    Task<TaskItem?> GetByIdAsync(int id);

    Task<(List<TaskItem> Items, int TotalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? search,
        TaskManagement.Domain.Enums.TaskStatus? status,
        TaskPriority? priority,
        int? assignedUserId
    );

    Task AddAsync(TaskItem task);

    void Update(TaskItem task);

    void Delete(TaskItem task);

    Task SaveChangesAsync();
}