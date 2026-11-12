
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import UserService from "../services/userService";
import "./UserManagement.css";

function UserList() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showEdit, setShowEdit] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [formData, setFormData] = useState({
        fullName: "",
        email: ""
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);

            const response = await UserService.getAll();

            setUsers(response.data || []);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error.response?.data?.message ||
                    "Unable to load users."
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        const value = search.toLowerCase().trim();

        if (!value) return users;

        return users.filter(user =>
            user.fullName?.toLowerCase().includes(value) ||
            user.email?.toLowerCase().includes(value) ||
            user.roles?.some(role =>
                role.toLowerCase().includes(value)
            ) ||
            user.role?.toLowerCase().includes(value)
        );
    }, [users, search]);

    const openEditModal = (user) => {
        setSelectedUser(user);

        setFormData({
            fullName: user.fullName || "",
            email: user.email || ""
        });

        setShowEdit(true);
    };

    const closeEditModal = () => {
        setShowEdit(false);
        setSelectedUser(null);
    };

    const handleEditChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!selectedUser) return;

        try {
            setSaving(true);

            await UserService.update(selectedUser.id, formData);

            await Swal.fire({
                icon: "success",
                title: "Updated",
                text: "User updated successfully."
            });

            closeEditModal();
            await fetchUsers();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Update Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to update user."
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = async (user) => {
        const result = await Swal.fire({
            title: "Deactivate User?",
            text: `Are you sure you want to deactivate ${user.fullName}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Deactivate",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#dc2626"
        });

        if (!result.isConfirmed) return;

        try {
            await UserService.deactivate(user.id);

            await Swal.fire({
                icon: "success",
                title: "Deactivated",
                text: "User deactivated successfully."
            });

            await fetchUsers();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error.response?.data?.message ||
                    "Unable to deactivate user."
            });
        }
    };

    const getRoles = (user) => {
        if (user.roles?.length) {
            return user.roles.join(", ");
        }

        return user.role || "No Role";
    };

    return (
        <div className="user-page">
            <div className="user-page-header">
                <div>
                    <h2>Manage Users</h2>
                    <p>View and manage user accounts.</p>
                </div>

                <Link
                    to="/Create-Employee"
                    className="user-primary-btn"
                >
                    + Create Employee
                </Link>
            </div>

            <div className="user-stats">
                <div className="user-stat-card">
                    <span>Total Users</span>
                    <strong>{users.length}</strong>
                </div>

                <div className="user-stat-card">
                    <span>Active Users</span>
                    <strong>
                        {users.filter(user => user.isActive).length}
                    </strong>
                </div>

                <div className="user-stat-card">
                    <span>Inactive Users</span>
                    <strong>
                        {users.filter(user => !user.isActive).length}
                    </strong>
                </div>
            </div>

            <div className="user-table-card">
                <div className="user-table-toolbar">
                    <h3>Users List</h3>

                    <input
                        type="search"
                        className="user-search"
                        placeholder="Search name, email or role..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="user-message">
                        Loading users...
                    </div>
                ) : (
                    <div className="user-table-wrapper">
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Full Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.id}</td>

                                            <td className="user-name-cell">
                                                {user.fullName}
                                            </td>

                                            <td>{user.email}</td>

                                            <td>{getRoles(user)}</td>

                                            <td>
                                                <span className={
                                                    `user-status ${
                                                        user.isActive
                                                            ? "active"
                                                            : "inactive"
                                                    }`
                                                }>
                                                    {user.isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>

                                            <td>
                                                {user.createdAt
                                                    ? new Date(
                                                        user.createdAt
                                                    ).toLocaleDateString()
                                                    : "-"}
                                            </td>

                                            <td>
                                                <div className="user-actions">
                                                    <button
                                                        type="button"
                                                        className="user-edit-btn"
                                                        onClick={() =>
                                                            openEditModal(user)
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    {user.isActive && (
                                                        <button
                                                            type="button"
                                                            className="user-delete-btn"
                                                            onClick={() =>
                                                                handleDeactivate(user)
                                                            }
                                                        >
                                                            Deactivate
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="user-empty"
                                        >
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showEdit && (
                <div
                    className="user-modal-overlay"
                    onClick={closeEditModal}
                >
                    <div
                        className="user-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="user-modal-header">
                            <h3>Edit User</h3>

                            <button
                                type="button"
                                onClick={closeEditModal}
                                className="user-modal-close"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleUpdate}>
                            <div className="user-form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleEditChange}
                                    maxLength={100}
                                    required
                                />
                            </div>

                            <div className="user-form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleEditChange}
                                    required
                                />
                            </div>

                            <div className="user-form-actions">
                                <button
                                    type="submit"
                                    className="user-primary-btn"
                                    disabled={saving}
                                >
                                    {saving ? "Updating..." : "Update User"}
                                </button>

                                <button
                                    type="button"
                                    className="user-cancel-btn"
                                    onClick={closeEditModal}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserList;
