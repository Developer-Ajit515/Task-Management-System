
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Auth.css";

const stats = [
  {
    title: "Total Tasks",
    value: 120,
    change: "+12%",
    icon: "▤",
    color: "blue",
  },
  {
    title: "Completed Tasks",
    value: 78,
    change: "+8%",
    icon: "✓",
    color: "green",
  },
  {
    title: "Pending Tasks",
    value: 25,
    change: "12 awaiting",
    icon: "◷",
    color: "orange",
  },
  {
    title: "In Progress",
    value: 17,
    change: "Active work",
    icon: "↗",
    color: "purple",
  },
];

const weeklyData = [
  { day: "Mon", completed: 35, pending: 15 },
  { day: "Tue", completed: 50, pending: 20 },
  { day: "Wed", completed: 40, pending: 25 },
  { day: "Thu", completed: 65, pending: 15 },
  { day: "Fri", completed: 55, pending: 30 },
  { day: "Sat", completed: 80, pending: 20 },
  { day: "Sun", completed: 45, pending: 10 },
];

const recentTasks = [
  {
    id: 1,
    title: "Create Login API",
    employee: "John Smith",
    priority: "High",
    status: "Completed",
  },
  {
    id: 2,
    title: "Dashboard UI Design",
    employee: "Sarah Wilson",
    priority: "Medium",
    status: "In Progress",
  },
  {
    id: 3,
    title: "Database Integration",
    employee: "David Brown",
    priority: "High",
    status: "Pending",
  },
  {
    id: 4,
    title: "Employee Management",
    employee: "Robert Taylor",
    priority: "Low",
    status: "Completed",
  },
  {
    id: 5,
    title: "Testing APIs",
    employee: "Emma Davis",
    priority: "Medium",
    status: "In Progress",
  },
];

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const sidebarLinks = [
    { title: "Dashboard", link: "/dashboard", icon: "⌂" },
    { title: "Create Task", link: "/create-task", icon: "＋" },
    { title: "Manage Tasks", link: "/tasks", icon: "✓" },
    { title: "Create Employee", link: "/create-employee", icon: "♙" },
    { title: "Manage Users", link: "/users", icon: "♧" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  return (
    <div className="app-layout">

      {/* Sidebar */}
      <aside className="app-sidebar">

        <div className="sidebar-brand">
          <div className="brand-icon">T</div>
          <div>
            <h2>TaskFlow</h2>
            <span>Management System</span>
          </div>
        </div>

        <div className="sidebar-menu">
          <p className="sidebar-heading">MAIN MENU</p>

          {sidebarLinks.map((item) => (
            <Link
              key={item.link}
              to={item.link}
              className={`sidebar-link ${
                location.pathname.toLowerCase() === item.link
                  ? "active"
                  : ""
              }`}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span>{item.title}</span>
            </Link>
          ))}
        </div>

        {/* Sidebar Bottom */}
        <div className="sidebar-bottom">

          <div className="sidebar-user">
            <div className="sidebar-user-icon">A</div>
            <div>
              <strong>Administrator</strong>
              <span>System Admin</span>
            </div>
          </div>

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
            <span>Welcome back, Administrator!</span>
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

                <span className="panel-period">This Week</span>
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
                        style={{ height: `${item.completed}%` }}
                        title={`Completed: ${item.completed}`}
                      ></div>

                      <div
                        className="bar pending-bar"
                        style={{ height: `${item.pending}%` }}
                        title={`Pending: ${item.pending}`}
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
                <h2>120</h2>
                <span>Total Tasks</span>
              </div>

              <div className="progress-item">
                <div>
                  <span>Completed</span>
                  <strong>65%</strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill completed-fill"
                    style={{ width: "65%" }}></div>
                </div>
              </div>

              <div className="progress-item">
                <div>
                  <span>Pending</span>
                  <strong>21%</strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill pending-fill"
                    style={{ width: "21%" }}></div>
                </div>
              </div>

              <div className="progress-item">
                <div>
                  <span>In Progress</span>
                  <strong>14%</strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill working-fill"
                    style={{ width: "14%" }}></div>
                </div>
              </div>

            </div>

          </div>

          {/* Recent Tasks */}
          <div className="dashboard-panel recent-panel">

            <div className="panel-header">
              <div>
                <h3>Recent Tasks</h3>
                <p>Latest task activities in your organization.</p>
              </div>

              <Link to="/tasks" className="view-all-link">
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
                  {recentTasks.map((task) => (
                    <tr key={task.id}>
                      <td className="task-name">{task.title}</td>
                      <td>{task.employee}</td>
                      <td>
                        <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`task-status ${task.status.toLowerCase().replace(" ", "-")}`}>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>

          </div>

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
