
using TaskManagement.Application.DTOs.Dashboard;
using TaskManagement.Application.Interfaces.IServices;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;
using TaskManagement.Domain.Interfaces.IRepository;
using TaskStatusEnum = TaskManagement.Domain.Enums.TaskStatus;

namespace TaskManagement.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _dashboardRepository;

    public DashboardService(
        IDashboardRepository dashboardRepository)
    {
        _dashboardRepository = dashboardRepository;
    }

    public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(
        int? userId)
    {
        // Current week starts on Monday (UTC).
        var today = DateTime.UtcNow.Date;

        int daysSinceMonday =
            ((int)today.DayOfWeek + 6) % 7;

        var startDate = today.AddDays(-daysSinceMonday);

        var endDate = startDate.AddDays(7);

        // Get task counts.
        var counts = await _dashboardRepository
            .GetTaskCountsAsync(userId);

        // Get weekly task activity.
        var weeklyStats = await _dashboardRepository
            .GetWeeklyActivityAsync(
                userId,
                startDate,
                endDate);

        var weeklyActivity = Enumerable.Range(0, 7)
            .Select(day =>
            {
                var date = startDate.AddDays(day);

                return new WeeklyActivityDto
                {
                    Day = date.ToString("ddd"),

                    Completed = weeklyStats
                        .Where(x =>
                            x.Date.Date == date &&
                            x.Status == TaskStatusEnum.Completed)
                        .Sum(x => x.Count),

                    Pending = weeklyStats
                        .Where(x =>
                            x.Date.Date == date &&
                            x.Status == TaskStatusEnum.Pending)
                        .Sum(x => x.Count)
                };
            })
            .ToList();

        // Get latest five tasks.
        var recentTasks = await _dashboardRepository
            .GetRecentTasksAsync(userId, 5);

        return new DashboardSummaryDto
        {
            TotalTasks = counts.TotalTasks,

            CompletedTasks = counts.CompletedTasks,

            PendingTasks = counts.PendingTasks,

            InProgressTasks = counts.InProgressTasks,

            WeeklyActivity = weeklyActivity,

            RecentTasks = recentTasks
                .Select(task => new RecentTaskDto
                {
                    Id = task.Id,

                    Title = task.Title,

                    AssignedUserName =
                        task.AssignedUser?.FullName ?? "Unassigned",

                    Priority = (int)task.Priority,

                    Status = (int)task.Status
                })
                .ToList()
        };
    }
}
