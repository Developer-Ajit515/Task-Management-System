
using System.ComponentModel.DataAnnotations;
using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.DTOs.Tasks;

using TaskStatus = TaskManagement.Domain.Enums.TaskStatus;

public class UpdateTaskStatusDto
{
    [EnumDataType(typeof(TaskStatus),
        ErrorMessage = "Invalid task status.")]
    public TaskStatus Status { get; set; }
}
