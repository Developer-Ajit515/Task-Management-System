using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TaskManagement.Application.DTOs.Dashboard
{

    public class DashboardSummaryDto
    {
        public int TotalTasks { get; set; }

        public int CompletedTasks { get; set; }

        public int PendingTasks { get; set; }

        public int InProgressTasks { get; set; }

        public List<WeeklyActivityDto> WeeklyActivity { get; set; }
            = new();

        public List<RecentTaskDto> RecentTasks { get; set; }
            = new();
    }

    public class WeeklyActivityDto
    {
        public string Day { get; set; } = string.Empty;

        public int Completed { get; set; }

        public int Pending { get; set; }
    }

    public class RecentTaskDto
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string AssignedUserName { get; set; } = string.Empty;

        public int Priority { get; set; }

        public int Status { get; set; }
    }

}