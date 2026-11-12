using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.DTOs.Tasks;
using TaskStatus = TaskManagement.Domain.Enums.TaskStatus;

public class UpdateTaskStatusDto
{
    public TaskStatus Status { get; set; }
}