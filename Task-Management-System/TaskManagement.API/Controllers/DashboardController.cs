
using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using TaskManagement.Application.Interfaces.IServices;

namespace TaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Employee")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(
        IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetDashboardSummary()
    {
        var userIdValue = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdValue, out var userId))
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid user token."
            });
        }

        // Admin sees all tasks.
        // Employee sees only assigned tasks.
        bool isAdmin = User.IsInRole("Admin");

        int? filterUserId = isAdmin ? null : userId;

        var result = await _dashboardService
            .GetDashboardSummaryAsync(filterUserId);

        return Ok(new
        {
            success = true,
            data = result
        });
    }
}
