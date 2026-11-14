
using System.ComponentModel.DataAnnotations;
using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.DTOs.Tasks;

public class CreateTaskDto
{
    [Required(ErrorMessage = "Task title is required.")]
    [StringLength(100, MinimumLength = 3,
        ErrorMessage = "Title must be between 3 and 100 characters.")]
    public string Title { get; set; } = string.Empty;

    [StringLength(500,
        ErrorMessage = "Description cannot exceed 500 characters.")]
    public string? Description { get; set; }

    [EnumDataType(typeof(TaskPriority),
        ErrorMessage = "Invalid task priority.")]
    public TaskPriority Priority { get; set; }
        = TaskPriority.Medium;

    [Range(1, int.MaxValue,
        ErrorMessage = "Invalid assigned user ID.")]
    public int? AssignedUserId { get; set; }
}
