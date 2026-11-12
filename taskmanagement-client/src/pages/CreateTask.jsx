
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import "./Task.css";

function CreateTask() {
    const navigate = useNavigate();

    const [task, setTask] = useState({
        title: "",
        description: "",
        priority: 1,
        assignedUserId: ""
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setTask({
            ...task,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axiosInstance.post("/Tasks", {
                title: task.title,
                description: task.description,
                priority: Number(task.priority),
                assignedUserId: Number(task.assignedUserId)
            });

            await Swal.fire({
                icon: "success",
                title: "Task Created!",
                text: "Your task has been created successfully.",
                confirmButtonColor: "#2563eb"
            });

            navigate("/tasks");

        } catch (error) {
    console.error("Create Task Error:", error.response?.data || error);

    Swal.fire({
        icon: "error",
        title: "Task Creation Failed",
        text:
            error.response?.data?.message ||
            error.response?.data?.title ||
            error.message
    });
}
    };

    return (
        <div className="task-form-page">
            <div className="task-form-card">
                <h2>Create New Task</h2>
                <p className="form-subtitle">Add a task to your workspace</p>

                <form onSubmit={handleSubmit}>
                    <label>Task Title</label>
                    <input
                        type="text"
                        name="title"
                        value={task.title}
                        onChange={handleChange}
                        placeholder="Enter task title"
                        required
                    />

                    <label>Description</label>
                    <textarea
                        name="description"
                        value={task.description}
                        onChange={handleChange}
                        placeholder="Enter task description"
                        rows="4"
                    />

                    <label>Priority</label>
                    <select
                        name="priority"
                        value={task.priority}
                        onChange={handleChange}
                    >
                        <option value="1">Low</option>
                        <option value="2">Medium</option>
                        <option value="3">High</option>
                    </select>

                    <label>Assigned User ID</label>
                    <input
                        type="number"
                        name="assignedUserId"
                        value={task.assignedUserId}
                        onChange={handleChange}
                        placeholder="Enter existing user ID"
                        min="1"
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Create Task"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreateTask;
