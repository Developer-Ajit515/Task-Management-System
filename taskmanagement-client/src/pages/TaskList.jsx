
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import "./Task.css";

function TaskList() {
    const { user } = useAuth();

    const isAdmin = user?.roles?.includes("Admin");
    const isEmployee = user?.roles?.includes("Employee");

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
    const fetchTasks = useCallback(async () => {
        if (!isAdmin && !isEmployee) {
            setTasks([]);
            setTotalCount(0);
            setLoading(false);
            setError("User role not found. Please login again.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Admin gets all tasks.
            // Employee gets only assigned tasks.
            const endpoint = isAdmin
                ? "/Tasks"
                : "/Tasks/my-tasks";

            const params = {
                search: search || undefined,
                status: status || undefined,
                pageNumber,
                pageSize
            };

            // Priority filter is currently supported only by Admin API.
            if (isAdmin) {
                params.priority = priority || undefined;
            }

            const response = await axiosInstance.get(endpoint, {
                params
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
    }, [
        isAdmin,
        isEmployee,
        search,
        priority,
        status,
        pageNumber,
        pageSize
    ]);

    // Search debounce and API call
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTasks();
        }, 400);

        return () => clearTimeout(timer);
    }, [fetchTasks]);

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
        switch (Number(value)) {
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
        switch (Number(value)) {
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


const handleStatusUpdate = async (task, newStatus) => {
    const previousStatus = task.status;

    // Optimistic UI update
    setTasks(previous =>
        previous.map(item =>
            item.id === task.id
                ? { ...item, status: newStatus }
                : item
        )
    );

    try {
        await axiosInstance.patch(
            `/Tasks/${task.id}/status`,
            { status: Number(newStatus) }
        );

        await Swal.fire({
            title: "Success!",
            text: "Task status updated successfully.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false
        });

    } catch (err) {
        // Restore previous status
        setTasks(previous =>
            previous.map(item =>
                item.id === task.id
                    ? { ...item, status: previousStatus }
                    : item
            )
        );

        if (err.response?.status === 403) {
            Swal.fire(
                "Access Denied",
                "You can only update your assigned tasks.",
                "error"
            );
            return;
        }

        Swal.fire(
            "Update Failed",
            err.response?.data?.message ||
            "Unable to update task status.",
            "error"
        );
    }
};


    // Delete Task - Admin only
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

            // If current page has only one task, go to previous page.
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
                    <p>
                        {isAdmin
                            ? "Search, filter and manage all tasks"
                            : "View and track your assigned tasks"}
                    </p>
                </div>

                {isAdmin && (
                    <Link
                        to="/create-task"
                        className="task-create-btn"
                    >
                        + Create Task
                    </Link>
                )}
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

                {isAdmin && (
                    <select
                        value={priority}
                        onChange={(e) => handlePriority(e.target.value)}
                    >
                        <option value="">All Priorities</option>
                        <option value="1">Low</option>
                        <option value="2">Medium</option>
                        <option value="3">High</option>
                    </select>
                )}

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

                            {isAdmin && <th>Action</th>}
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={isAdmin ? 7 : 6}
                                    className="task-empty"
                                >
                                    Loading tasks...
                                </td>
                            </tr>
                        ) : tasks.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={isAdmin ? 7 : 6}
                                    className="task-empty"
                                >
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
    {isEmployee ? (
        <select
            value={task.status}
            onChange={(e) =>
                handleStatusUpdate(task, e.target.value)
            }
            className="task-status-select"
        >
            <option value="1">Pending</option>
            <option value="2">In Progress</option>
            <option value="3">Completed</option>
        </select>
    ) : (
        <span className={`status-badge status-${task.status}`}>
            {getStatusLabel(task.status)}
        </span>
    )}
</td>


                                    <td>
                                        {task.assignedUserName || "Not Assigned"}
                                    </td>

                                    {/* Admin Actions */}
                                    {isAdmin && (
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
                                                    onClick={() =>
                                                        handleDelete(task.id)
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </div>
                                        </td>
                                    )}

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
