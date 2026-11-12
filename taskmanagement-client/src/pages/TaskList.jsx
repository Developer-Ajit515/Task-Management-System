
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import "./Task.css";

function TaskList() {
    const [tasks, setTasks] = useState([]);
    const [search, setSearch] = useState("");
    const [priority, setPriority] = useState("");
    const [status, setStatus] = useState("");

    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalCount, setTotalCount] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const totalPages = Math.ceil(totalCount / pageSize);

    // Fetch paginated tasks
    const fetchTasks = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await axiosInstance.get("/Tasks", {
                params: {
                    search: search || undefined,
                    priority: priority || undefined,
                    status: status || undefined,
                    pageNumber,
                    pageSize
                }
            });

            const result = response.data;

            console.log("Tasks API Response:", result);

            setTasks(result.data || []);
            setTotalCount(result.totalRecords || 0);

        } catch (err) {
            console.error(
                "Fetch Tasks Error:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load tasks."
            );

            setTasks([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    // Search debounce and API call
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTasks();
        }, 400);

        return () => clearTimeout(timer);
    }, [search, priority, status, pageNumber, pageSize]);

    // Reset page when filters change
    const handleSearch = (value) => {
        setSearch(value);
        setPageNumber(1);
    };

    const handlePriority = (value) => {
        setPriority(value);
        setPageNumber(1);
    };

    const handleStatus = (value) => {
        setStatus(value);
        setPageNumber(1);
    };

    // Priority labels
    const getPriorityLabel = (value) => {
        switch (value) {
            case 1:
                return "Low";
            case 2:
                return "Medium";
            case 3:
                return "High";
            default:
                return "Unknown";
        }
    };

    // Status labels
    const getStatusLabel = (value) => {
        switch (value) {
            case 1:
                return "Pending";
            case 2:
                return "In Progress";
            case 3:
                return "Completed";
            default:
                return "Unknown";
        }
    };

    // Delete Task
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You will not be able to recover this task!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel"
        });

        if (!result.isConfirmed) return;

        try {
            await axiosInstance.delete(`/Tasks/${id}`);

            await Swal.fire({
                title: "Deleted!",
                text: "Task deleted successfully.",
                icon: "success",
                confirmButtonColor: "#2563eb"
            });

            // Move to previous page if current page becomes empty
            if (tasks.length === 1 && pageNumber > 1) {
                setPageNumber((previous) => previous - 1);
            } else {
                fetchTasks();
            }

        } catch (err) {
            console.error(
                "Delete Task Error:",
                err.response?.data || err
            );

            Swal.fire({
                title: "Delete Failed",
                text:
                    err.response?.data?.message ||
                    "Unable to delete task.",
                icon: "error",
                confirmButtonColor: "#dc2626"
            });
        }
    };

    return (
        <div className="task-list-page">

            {/* Header */}
            <div className="task-list-header">
                <div>
                    <h2>Task Management</h2>
                    <p>Search, filter and manage your tasks</p>
                </div>

                <Link
                    to="/create-task"
                    className="task-create-btn"
                >
                    + Create Task
                </Link>
            </div>

            {/* Search and Filters */}
            <div className="task-filters">

                <input
                    type="text"
                    placeholder="Search by title or description..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="task-search"
                />

                <select
                    value={priority}
                    onChange={(e) => handlePriority(e.target.value)}
                >
                    <option value="">All Priorities</option>
                    <option value="1">Low</option>
                    <option value="2">Medium</option>
                    <option value="3">High</option>
                </select>

                <select
                    value={status}
                    onChange={(e) => handleStatus(e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value="1">Pending</option>
                    <option value="2">In Progress</option>
                    <option value="3">Completed</option>
                </select>

                <select
                    value={pageSize}
                    onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setPageNumber(1);
                    }}
                >
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                </select>

            </div>

            {/* Error */}
            {error && (
                <div className="task-error">
                    {error}
                </div>
            )}

            {/* Task Table */}
            <div className="task-table-wrapper">
                <table className="task-table">

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Assigned User</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="task-empty">
                                    Loading tasks...
                                </td>
                            </tr>
                        ) : tasks.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="task-empty">
                                    No tasks found.
                                </td>
                            </tr>
                        ) : (
                            tasks.map((task) => (
                                <tr key={task.id}>

                                    <td>{task.id}</td>

                                    <td className="task-title-cell">
                                        {task.title}
                                    </td>

                                    <td>
                                        {task.description || "-"}
                                    </td>

                                    <td>
                                        <span
                                            className={`priority-badge priority-${task.priority}`}
                                        >
                                            {getPriorityLabel(task.priority)}
                                        </span>
                                    </td>

                                    <td>
                                        <span
                                            className={`status-badge status-${task.status}`}
                                        >
                                            {getStatusLabel(task.status)}
                                        </span>
                                    </td>

                                    <td>
                                        {task.assignedUserName || "Not Assigned"}
                                    </td>

                                    <td>
    <div className="task-actions">

        <Link
            to={`/tasks/${task.id}`}
            className="task-view-btn"
        >
            View
        </Link>

        <Link
            to={`/tasks/edit/${task.id}`}
            className="task-edit-btn"
        >
            Edit
        </Link>

        <button
            type="button"
            className="task-delete-btn"
            onClick={() => handleDelete(task.id)}
        >
            Delete
        </button>

    </div>
</td>

                                </tr>
                            ))
                        )}
                    </tbody>

                </table>
            </div>

            {/* Pagination */}
            <div className="task-pagination">

                <span>
                    Total Tasks: <strong>{totalCount}</strong>
                </span>

                <div className="pagination-controls">

                    <button
                        disabled={pageNumber <= 1 || loading}
                        onClick={() =>
                            setPageNumber((previous) => previous - 1)
                        }
                    >
                        Previous
                    </button>

                    <span>
                        Page {totalPages === 0 ? 0 : pageNumber} of {totalPages}
                    </span>

                    <button
                        disabled={
                            pageNumber >= totalPages || loading
                        }
                        onClick={() =>
                            setPageNumber((previous) => previous + 1)
                        }
                    >
                        Next
                    </button>

                </div>
            </div>

        </div>
    );
}

export default TaskList;
