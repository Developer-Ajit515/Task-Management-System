using TaskStatusEnum = TaskManagement.Domain.Enums.TaskStatus;

namespace TaskManagement.Domain.Entities;

public class DashboardDailyStats
{
    public DateTime Date { get; set; }

    public TaskStatusEnum Status { get; set; }

    public int Count { get; set; }
}