
using Microsoft.EntityFrameworkCore;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;
using TaskManagement.Domain.Interfaces.IRepository;
using TaskManagement.Infrastructure.Data;

namespace TaskManagement.Infrastructure.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly AppDbContext _context;

    public TaskRepository(AppDbContext context)
    {
        _context = context;
    }

    // Get task by ID (tracked because service uses it for updates)
    public async Task<TaskItem?> GetByIdAsync(int id)
    {
        return await _context.Tasks
            .Include(x => x.AssignedUser)
            .Include(x => x.CreatedByUser)
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    // Get paginated tasks with search and filters
    public async Task<(List<TaskItem> Items, int TotalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? search,
        TaskManagement.Domain.Enums.TaskStatus? status,
        TaskPriority? priority,
        int? assignedUserId)
    {
        var query = _context.Tasks.AsQueryable();

        // Search
        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();

            query = query.Where(x =>
                x.Title.Contains(search) ||
                (x.Description != null &&
                 x.Description.Contains(search)));
        }

        // Filter by status
        if (status.HasValue)
        {
            query = query.Where(x => x.Status == status.Value);
        }

        // Filter by priority
        if (priority.HasValue)
        {
            query = query.Where(x => x.Priority == priority.Value);
        }

        // Filter by assigned employee
        if (assignedUserId.HasValue)
        {
            query = query.Where(x =>
                x.AssignedUserId == assignedUserId.Value);
        }

        // Get total records before pagination
        var totalCount = await query.CountAsync();

        // Apply pagination and load navigation properties
        var items = await query
            .Include(x => x.AssignedUser)
            .Include(x => x.CreatedByUser)
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedDate)
            .ThenByDescending(x => x.Id)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    // Create task
    public async Task AddAsync(TaskItem task)
    {
        await _context.Tasks.AddAsync(task);
        await _context.SaveChangesAsync();
    }

    // Update task
    public void Update(TaskItem task)
    {
        _context.Tasks.Update(task);
    }

    // Delete task
    public void Delete(TaskItem task)
    {
        _context.Tasks.Remove(task);
    }

    // Save changes
    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
