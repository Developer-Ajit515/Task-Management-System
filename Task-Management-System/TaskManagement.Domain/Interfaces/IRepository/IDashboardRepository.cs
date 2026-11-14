
using TaskManagement.Domain.Entities;

namespace TaskManagement.Domain.Interfaces.IRepository;

public interface IDashboardRepository
{
    Task<DashboardTaskCounts> GetTaskCountsAsync(int? userId);

    Task<List<DashboardDailyStats>> GetWeeklyActivityAsync(
        int? userId,
        DateTime startDate,
        DateTime endDate);

    Task<List<TaskItem>> GetRecentTasksAsync(
        int? userId,
        int count);
}
