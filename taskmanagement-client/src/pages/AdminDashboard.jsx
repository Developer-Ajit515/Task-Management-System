import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AdminDashboard.css";

function AdminDashboard() {
    const { user, logout } = useAuth();

    const adminCards = [
        {
            title: "Create Task",
            description: "Create a new task and assign it to an employee.",
            link: "/Create-Task",
            icon: "📝"
        },
        {
            title: "All Tasks",
            description: "View, manage, edit and delete tasks.",
            link: "/Tasks",
            icon: "📋"
        },
        {
            title: "Employees",
            description: "View and manage registered users.",
            link: "/Users",
            icon: "👥"
        },
        {
            title: "Create Employee",
            description: "Create a new employee account.",
            link: "/Create-Employee",
            icon: "➕"
        }
    ];

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="admin-dashboard">

            <header className="admin-header">
                <div>
                    <h2>Task Management System</h2>
                    <p>Admin Dashboard</p>
                </div>

                <button
                    className="admin-logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </header>

            <main className="admin-main">

                <section className="admin-welcome">
                    <div>
                        <h1>Welcome, {user?.fullName || "Administrator"}!</h1>
                        <p>Manage your tasks and employees from one place.</p>
                    </div>

                    <span className="admin-role">Admin</span>
                </section>

                <section className="admin-card-grid">
                    {adminCards.map((card) => (
                        <Link
                            to={card.link}
                            className="admin-card"
                            key={card.title}
                        >
                            <div className="admin-card-icon">
                                {card.icon}
                            </div>

                            <h3>{card.title}</h3>

                            <p>{card.description}</p>

                            <span className="admin-card-link">
                                Open →
                            </span>
                        </Link>
                    ))}
                </section>

            </main>
        </div>
    );
}

export default AdminDashboard;