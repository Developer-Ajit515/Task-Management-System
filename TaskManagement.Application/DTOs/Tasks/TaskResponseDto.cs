using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.DTOs.Tasks;
using TaskStatus = TaskManagement.Domain.Enums.TaskStatus;

public class TaskResponseDto
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public TaskPriority Priority { get; set; }

    public TaskStatus Status { get; set; }

    public int? AssignedUserId { get; set; }

    public string? AssignedUserName { get; set; }

    public string CreatedByName { get; set; } = string.Empty;

    public DateTime CreatedDate { get; set; }
}