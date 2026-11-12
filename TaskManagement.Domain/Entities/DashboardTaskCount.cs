
namespace TaskManagement.Domain.Entities;

public class DashboardTaskCounts
{
    public int TotalTasks { get; set; }

    public int CompletedTasks { get; set; }

    public int PendingTasks { get; set; }

    public int InProgressTasks { get; set; }
}
