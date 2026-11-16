
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import  "./EditTask.css";

function EditTask() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);

    const [form, setForm] = useState({
        title: "",
        description: "",
        priority: 2,
        assignedUserId: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Load task and employees
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                const [taskResponse, employeeResponse] = await Promise.all([
    axiosInstance.get(`/Tasks/${id}`),
    axiosInstance.get("/User/employees")
]);

const task = taskResponse.data?.data ?? taskResponse.data;
const employees = employeeResponse.data?.data ?? [];

setForm({
    title: task.title ?? "",
    description: task.description ?? "",
    priority: task.priority ?? 2,
    assignedUserId: task.assignedUserId ?? ""
});

setEmployees(employees);

                setEmployees(
                    Array.isArray(employeeList) ? employeeList : []
                );

            } catch (error) {
                console.error("Load Task Error:", error);
                
                Swal.fire(
                    "Error",
                    error.response?.data?.message ||
                    "Unable to load task details.",
                    "error"
                );

                navigate("/tasks");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm(previous => ({
            ...previous,
            [name]: value
        }));
    };

    // Update task
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.title.trim()) {
            Swal.fire("Validation", "Title is required.", "warning");
            return;
        }

        try {
            setSaving(true);

            await axiosInstance.put(`/Tasks/${id}`, {
                title: form.title.trim(),
                description: form.description.trim(),
                priority: Number(form.priority),
                assignedUserId: form.assignedUserId
                    ? Number(form.assignedUserId)
                    : null
            });

            await Swal.fire(
                "Updated!",
                "Task updated successfully.",
                "success"
            );

            navigate("/tasks");

        } catch (error) {
            console.error("Update Task Error:", error);

            Swal.fire(
                "Error",
                error.response?.data?.message ||
                "Unable to update task.",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p>Loading task...</p>;
    }

    return (
        <div className="edit-task-page">
            <h2>Edit Task</h2>

            <form onSubmit={handleSubmit}>
                <label>Task Title</label>
                <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                />

                <label>Description</label>
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                />

                <label>Priority</label>
                <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                >
                    <option value="1">Low</option>
                    <option value="2">Medium</option>
                    <option value="3">High</option>
                </select>

                <label>Assign Employee</label>
               <select
    name="assignedUserId"
    value={form.assignedUserId}
    onChange={handleChange}
>
    <option value="">Unassigned</option>

    {employees.map(employee => (
        <option key={employee.id} value={employee.id}>
            {employee.fullName}
        </option>
    ))}
</select>

                <button type="submit" disabled={saving}>
                    {saving ? "Updating..." : "Update Task"}
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/tasks")}
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}

export default EditTask;
