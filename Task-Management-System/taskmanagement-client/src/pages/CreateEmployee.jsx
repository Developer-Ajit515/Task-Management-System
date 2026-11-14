
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import UserService from "../services/userService";
import "./UserManagement.css";

function CreateEmployee() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            await UserService.createEmployee(formData);

            await Swal.fire({
                icon: "success",
                title: "Employee Created",
                text: "Employee account created successfully."
            });

            navigate("/Users");
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error.response?.data?.message ||
                    "Unable to create employee."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="user-page">
            <div className="user-page-header">
                <div>
                    <h2>Create Employee</h2>
                    <p>Create a new employee login account.</p>
                </div>

                <Link to="/Users" className="user-secondary-btn">
                    Back to Users
                </Link>
            </div>

            <div className="user-form-card">
                <form onSubmit={handleSubmit}>
                    <div className="user-form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Enter full name"
                            maxLength={100}
                            required
                        />
                    </div>

                    <div className="user-form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email address"
                            required
                        />
                    </div>

                    <div className="user-form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Minimum 6 characters"
                            minLength={6}
                            required
                        />
                    </div>

                    <div className="user-form-actions">
                        <button
                            type="submit"
                            className="user-primary-btn"
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Create Employee"}
                        </button>

                        <Link
                            to="/Users"
                            className="user-cancel-btn"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateEmployee;
