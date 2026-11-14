
using Microsoft.EntityFrameworkCore;

using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;
using TaskManagement.Domain.Interfaces.IRepository;
using TaskManagement.Infrastructure.Data;

using TaskStatusEnum = TaskManagement.Domain.Enums.TaskStatus;

namespace TaskManagement.Infrastructure.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly AppDbContext _context;

    public DashboardRepository(AppDbContext context)
    {
        _context = context;
    }

    private IQueryable<TaskItem> GetTaskQuery(int? userId)
    {
        var query = _context.Tasks.AsNoTracking();

        if (userId.HasValue)
        {
            query = query.Where(x =>
                x.AssignedUserId == userId.Value);
        }

        return query;
    }

    public async Task<DashboardTaskCounts> GetTaskCountsAsync(
        int? userId)
    {
        var query = GetTaskQuery(userId);

        return await query
            .GroupBy(x => 1)
            .Select(g => new DashboardTaskCounts
            {
                TotalTasks = g.Count(),

                CompletedTasks = g.Count(x =>
                    x.Status == TaskStatusEnum.Completed),

                PendingTasks = g.Count(x =>
                    x.Status == TaskStatusEnum.Pending),

                InProgressTasks = g.Count(x =>
                    x.Status == TaskStatusEnum.InProgress)
            })
            .FirstOrDefaultAsync()
            ?? new DashboardTaskCounts();
    }

    public async Task<List<DashboardDailyStats>>
        GetWeeklyActivityAsync(
            int? userId,
            DateTime startDate,
            DateTime endDate)
    {
        return await GetTaskQuery(userId)
            .Where(x =>
                x.CreatedDate >= startDate &&
                x.CreatedDate < endDate)
            .GroupBy(x => new
            {
                Date = x.CreatedDate.Date,
                x.Status
            })
            .Select(g => new DashboardDailyStats
            {
                Date = g.Key.Date,
                Status = g.Key.Status,
                Count = g.Count()
            })
            .ToListAsync();
    }

    public async Task<List<TaskItem>> GetRecentTasksAsync(
        int? userId,
        int count)
    {
        return await GetTaskQuery(userId)
            .Include(x => x.AssignedUser)
            .OrderByDescending(x => x.CreatedDate)
            .Take(count)
            .ToListAsync();
    }
}
