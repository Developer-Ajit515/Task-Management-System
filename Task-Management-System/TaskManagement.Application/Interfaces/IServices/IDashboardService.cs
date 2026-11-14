
using TaskManagement.Application.DTOs.Dashboard;

namespace TaskManagement.Application.Interfaces.IServices;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetDashboardSummaryAsync(
        int? userId);
}
