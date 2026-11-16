
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import dashboardService from "../services/dashboardService";
import "./Auth.css";

// Priority mapping
const getPriorityName = (priority) => {
  const priorities = {
    1: "Low",
    2: "Medium",
    3: "High",
  };

  return priorities[priority] || "Unknown";
};

// Status mapping
const getStatusName = (status) => {
  const statuses = {
    1: "Pending",
    2: "In Progress",
    3: "Completed",
  };

  return statuses[status] || "Unknown";
};

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  // Logged-in user information
  const userName = user?.fullName || "User";

  const roles = Array.isArray(user?.roles) ? user.roles : [];

  const isAdmin = roles.some(
    (role) => role?.toLowerCase() === "admin"
  );

  const userRole = isAdmin ? "Administrator" : "Employee";

  // Dashboard states
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sidebar links
  const sidebarLinks = [
    {
      title: "Dashboard",
      link: "/dashboard",
      icon: "⌂",
      adminOnly: false,
    },
    {
      title: "Create Task",
      link: "/create-task",
      icon: "＋",
      adminOnly: true,
    },
    {
      title: "Manage Tasks",
      link: "/tasks",
      icon: "✓",
      adminOnly: false,
    },
    {
      title: "Create Employee",
      link: "/create-employee",
      icon: "♙",
      adminOnly: true,
    },
    {
      title: "Manage Users",
      link: "/users",
      icon: "♧",
      adminOnly: true,
    },
  ];

  // Show links according to role
  const visibleSidebarLinks = sidebarLinks.filter(
    (item) => !item.adminOnly || isAdmin
  );

  // Fetch dashboard data
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await dashboardService.getDashboardSummary();

      setDashboardData(data);
    } catch (err) {
      console.error("Dashboard Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Logout
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading dashboard...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dashboard-error">
        <h3>Dashboard Error</h3>
        <p>{error}</p>

        <button onClick={fetchDashboard}>
          Retry
        </button>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="dashboard-loading">
        No dashboard data available.
      </div>
    );
  }

  // Dynamic statistics
  const stats = [
    {
      title: "Total Tasks",
      value: dashboardData.totalTasks ?? 0,
      change: "All tasks",
      icon: "▤",
      color: "blue",
    },
    {
      title: "Completed Tasks",
      value: dashboardData.completedTasks ?? 0,
      change: "Completed",
      icon: "✓",
      color: "green",
    },
    {
      title: "Pending Tasks",
      value: dashboardData.pendingTasks ?? 0,
      change: "Awaiting action",
      icon: "◷",
      color: "orange",
    },
    {
      title: "In Progress",
      value: dashboardData.inProgressTasks ?? 0,
      change: "Active work",
      icon: "↗",
      color: "purple",
    },
  ];

  // Weekly activity
  const weeklyData = dashboardData.weeklyActivity || [];

  // Recent tasks
  const recentTasks = dashboardData.recentTasks || [];

  // Task percentages
  const total = dashboardData.totalTasks || 0;

  const getPercentage = (value) => {
    if (total === 0) return 0;

    return Math.round(((value || 0) / total) * 100);
  };

  const completedPercentage = getPercentage(
    dashboardData.completedTasks
  );

  const pendingPercentage = getPercentage(
    dashboardData.pendingTasks
  );

  const inProgressPercentage = getPercentage(
    dashboardData.inProgressTasks
  );

  // Weekly chart scaling
  const maxWeeklyValue = Math.max(
    1,
    ...weeklyData.map((item) =>
      Math.max(item.completed || 0, item.pending || 0)
    )
  );

  return (
    <div className="app-layout">

      {/* Sidebar */}
      <aside className="app-sidebar">

        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-icon">T</div>

          <div>
            <h2>TaskFlow</h2>
            <span>Management System</span>
          </div>
        </div>

        {/* Sidebar Menu */}
        <div className="sidebar-menu">

          <p className="sidebar-heading">
            MAIN MENU
          </p>

          {visibleSidebarLinks.map((item) => (
            <Link
              key={item.link}
              to={item.link}
              className={`sidebar-link ${
                location.pathname.toLowerCase() ===
                item.link.toLowerCase()
                  ? "active"
                  : ""
              }`}
            >
              <span className="sidebar-link-icon">
                {item.icon}
              </span>

              <span>{item.title}</span>
            </Link>
          ))}

        </div>

        {/* Sidebar Bottom */}
        <div className="sidebar-bottom">

          {/* Logged-in User */}
          <div className="sidebar-user">

            <div className="sidebar-user-icon">
              {userName.charAt(0).toUpperCase()}
            </div>

            <div className="sidebar-user-info">
              <strong>{userName}</strong>
              <span>{userRole}</span>
            </div>

          </div>

          {/* Logout */}
          <button
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>

      {/* Main Content */}
      <main className="app-main">

        {/* Navbar */}
        <header className="app-navbar">

          <div>
            <h3>Dashboard Overview</h3>

            <span>
              Welcome back, {userName}!
            </span>
          </div>

          <div className="navbar-right">

            <span className="navbar-status">
              <span className="status-dot"></span>
              System Active
            </span>

          </div>

        </header>

        <div className="dashboard-container">

          {/* Page Heading */}
          <div className="dashboard-header">

            <div>
              <span className="dashboard-eyebrow">
                OVERVIEW
              </span>

              <h2>Dashboard</h2>

              <p>
                Monitor your team's performance and task activities.
              </p>
            </div>

          </div>

          {/* Statistics Cards */}
          <div className="stats-grid">

            {stats.map((item) => (
              <div className="stat-card" key={item.title}>

                <div className={`stat-icon ${item.color}`}>
                  {item.icon}
                </div>

                <div className="stat-info">
                  <p>{item.title}</p>
                  <h2>{item.value}</h2>
                  <span>{item.change}</span>
                </div>

              </div>
            ))}

          </div>

          {/* Charts Section */}
          <div className="dashboard-charts">

            {/* Weekly Chart */}
            <div className="dashboard-panel weekly-panel">

              <div className="panel-header">

                <div>
                  <h3>Task Activity</h3>
                  <p>Weekly task performance</p>
                </div>

                <span className="panel-period">
                  This Week
                </span>

              </div>

              <div className="chart-legend">

                <span>
                  <i className="legend-completed"></i>
                  Completed
                </span>

                <span>
                  <i className="legend-pending"></i>
                  Pending
                </span>

              </div>

              <div className="bar-chart">

                {weeklyData.map((item) => (
                  <div className="bar-group" key={item.day}>

                    <div className="bar-columns">

                      <div
                        className="bar completed-bar"
                        style={{
                          height: `${
                            ((item.completed || 0) /
                              maxWeeklyValue) *
                            100
                          }%`,
                        }}
                        title={`Completed: ${item.completed || 0}`}
                      ></div>

                      <div
                        className="bar pending-bar"
                        style={{
                          height: `${
                            ((item.pending || 0) /
                              maxWeeklyValue) *
                            100
                          }%`,
                        }}
                        title={`Pending: ${item.pending || 0}`}
                      ></div>

                    </div>

                    <span>{item.day}</span>

                  </div>
                ))}

              </div>

            </div>

            {/* Task Progress */}
            <div className="dashboard-panel progress-panel">

              <div className="panel-header">

                <div>
                  <h3>Task Statistics</h3>
                  <p>Overall task distribution</p>
                </div>

              </div>

              <div className="progress-total">
                <h2>{total}</h2>
                <span>Total Tasks</span>
              </div>

              {/* Completed */}
              <div className="progress-item">

                <div>
                  <span>Completed</span>
                  <strong>{completedPercentage}%</strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill completed-fill"
                    style={{
                      width: `${completedPercentage}%`,
                    }}
                  ></div>
                </div>

              </div>

              {/* Pending */}
              <div className="progress-item">

                <div>
                  <span>Pending</span>
                  <strong>{pendingPercentage}%</strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill pending-fill"
                    style={{
                      width: `${pendingPercentage}%`,
                    }}
                  ></div>
                </div>

              </div>

              {/* In Progress */}
              <div className="progress-item">

                <div>
                  <span>In Progress</span>
                  <strong>{inProgressPercentage}%</strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill working-fill"
                    style={{
                      width: `${inProgressPercentage}%`,
                    }}
                  ></div>
                </div>

              </div>

            </div>

          </div>

          {/* Recent Tasks */}
          <div className="dashboard-panel recent-panel">

            <div className="panel-header">

              <div>
                <h3>Recent Tasks</h3>

                <p>
                  Latest task activities in your organization.
                </p>
              </div>

              <Link
                to="/tasks"
                className="view-all-link"
              >
                View All →
              </Link>

            </div>

            <div className="recent-table-wrapper">

              <table className="recent-table">

                <thead>
                  <tr>
                    <th>Task Name</th>
                    <th>Assigned To</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {recentTasks.length > 0 ? (
                    recentTasks.map((task) => {

                      const priority = getPriorityName(
                        task.priority
                      );

                      const status = getStatusName(
                        task.status
                      );

                      return (
                        <tr key={task.id}>

                          <td className="task-name">
                            {task.title}
                          </td>

                          <td>
                            {task.assignedUserName || "Unassigned"}
                          </td>

                          <td>
                            <span
                              className={`priority-badge ${priority.toLowerCase()}`}
                            >
                              {priority}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`task-status ${status
                                .toLowerCase()
                                .replace(" ", "-")}`}
                            >
                              {status}
                            </span>
                          </td>

                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="empty-state">
                        No recent tasks available.
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* Footer */}
          <div className="dashboard-footer">
            <p>Task Management System</p>
            <span>Manage smarter. Work better.</span>
          </div>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;
