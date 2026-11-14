using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaskManagement.Domain.Enums;

using TaskItemStatus = TaskManagement.Domain.Enums.TaskStatus;


namespace TaskManagement.Domain.Entities
{
    public class TaskItem
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public TaskPriority Priority { get; set; }
            = TaskPriority.Medium;

        public TaskItemStatus Status { get; set; }
           = TaskItemStatus.Pending;

        public int? AssignedUserId { get; set; }

        public User? AssignedUser { get; set; }

        public int CreatedByUserId { get; set; }

        public User CreatedByUser { get; set; } = null!;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedDate { get; set; }
    }
}
