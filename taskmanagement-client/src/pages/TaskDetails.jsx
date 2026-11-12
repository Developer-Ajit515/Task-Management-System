
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import "./TaskPages.css";

function TaskDetails() {
    const { id } = useParams();

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTask = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await axiosInstance.get(`/Tasks/${id}`);

                setTask(response.data);
            } catch (err) {
                console.error("Task Details Error:", err.response?.data || err);

                setError(
                    err.response?.data?.message ||
                    "Unable to load task details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTask();
    }, [id]);

    const getPriority = (value) => {
        switch (value) {
            case 1: return "Low";
            case 2: return "Medium";
            case 3: return "High";
            default: return "Unknown";
        }
    };

    const getStatus = (value) => {
        switch (value) {
            case 1: return "Pending";
            case 2: return "In Progress";
            case 3: return "Completed";
            default: return "Unknown";
        }
    };

    if (loading) {
        return <div className="task-page-message">Loading task details...</div>;
    }

    if (error) {
        return (
            <div className="task-page-container">
                <div className="task-page-error">{error}</div>
                <Link to="/Tasks" className="task-back-btn">
                    Back to Tasks
                </Link>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="task-page-message">
                Task not found.
                <br />
                <Link to="/Tasks" className="task-back-btn">
                    Back to Tasks
                </Link>
            </div>
        );
    }

    return (
        <div className="task-page-container">

            <div className="task-page-header">
                <div>
                    <h2>Task Details</h2>
                    <p>View complete task information</p>
                </div>

                <Link to="/Tasks" className="task-back-btn">
                    Back to Tasks
                </Link>
            </div>

            <div className="task-details-card">

                <div className="task-details-title">
                    <h3>{task.title}</h3>
                    <span className={`status-badge status-${task.status}`}>
                        {getStatus(task.status)}
                    </span>
                </div>

                <div className="task-details-grid">

                    <div className="task-detail-item">
                        <label>Task ID</label>
                        <p>{task.id}</p>
                    </div>

                    <div className="task-detail-item">
                        <label>Priority</label>
                        <p>
                            <span className={`priority-badge priority-${task.priority}`}>
                                {getPriority(task.priority)}
                            </span>
                        </p>
                    </div>

                    <div className="task-detail-item">
                        <label>Assigned User</label>
                        <p>{task.assignedUserName || "Not Assigned"}</p>
                    </div>

                    <div className="task-detail-item">
                        <label>Created By</label>
                        <p>{task.createdByName || "-"}</p>
                    </div>

                    <div className="task-detail-item">
                        <label>Created Date</label>
                        <p>
                            {task.createdDate
                                ? new Date(task.createdDate).toLocaleString()
                                : "-"}
                        </p>
                    </div>

                    <div className="task-detail-item task-description">
                        <label>Description</label>
                        <p>{task.description || "No description available."}</p>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default TaskDetails;
