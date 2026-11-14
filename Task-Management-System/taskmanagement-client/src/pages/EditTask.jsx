
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import "./TaskPages.css";

function EditTask() {
    const { id } = useParams();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: 2,
        assignedUserId: ""
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTask = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await axiosInstance.get(`/Tasks/${id}`);

                const task = response.data;

                setFormData({
                    title: task.title || "",
                    description: task.description || "",
                    priority: task.priority ?? 2,
                    assignedUserId: task.assignedUserId ?? ""
                });

            } catch (err) {
                console.error("Edit Task Fetch Error:", err.response?.data || err);

                setError(
                    err.response?.data?.message ||
                    "Unable to load task."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTask();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: name === "priority"
                ? Number(value)
                : value
        }));
    };

    if (loading) {
        return <div className="task-page-message">Loading task...</div>;
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

    return (
        <div className="task-page-container">

            <div className="task-page-header">
                <div>
                    <h2>Edit Task</h2>
                    <p>Task ID: {id}</p>
                </div>

                <Link to="/Tasks" className="task-back-btn">
                    Back to Tasks
                </Link>
            </div>

            <div className="task-form-card">

                <form onSubmit={(e) => e.preventDefault()}>

                    <div className="task-form-group">
                        <label>Task Title</label>

                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter task title"
                        />
                    </div>

                    <div className="task-form-group">
                        <label>Description</label>

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter task description"
                            rows="5"
                        />
                    </div>

                    <div className="task-form-group">
                        <label>Priority</label>

                        <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                        >
                            <option value={1}>Low</option>
                            <option value={2}>Medium</option>
                            <option value={3}>High</option>
                        </select>
                    </div>

                    <div className="task-form-group">
                        <label>Assigned User ID</label>

                        <input
                            type="number"
                            name="assignedUserId"
                            value={formData.assignedUserId}
                            onChange={handleChange}
                            placeholder="Enter assigned user ID"
                        />
                    </div>

                    <div className="task-form-actions">
                        <Link to="/Tasks" className="task-cancel-btn">
                            Cancel
                        </Link>

                        <button
                            type="button"
                            className="task-save-btn"
                            disabled
                        >
                            Update (Coming Soon)
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default EditTask;
