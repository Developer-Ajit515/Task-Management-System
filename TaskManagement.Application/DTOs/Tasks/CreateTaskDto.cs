using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.DTOs.Tasks;

public class CreateTaskDto
{
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public TaskPriority Priority { get; set; }

    public int? AssignedUserId { get; set; }
}