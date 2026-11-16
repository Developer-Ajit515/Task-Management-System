
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Swal from "sweetalert2";

import { useAuth } from "../context/AuthContext";
import UserService from "../services/userService";

import "./UserManagement.css";

function UserList() {
    const { user } = useAuth();

    const isAdmin = user?.roles?.includes("Admin");

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

    // ==========================================
    // FETCH ALL USERS - ADMIN ONLY
    // ==========================================

    const fetchUsers = useCallback(async () => {
        if (!isAdmin) {
            setUsers([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const response = await UserService.getAll();

            setUsers(response.data || []);

        } catch (error) {
            console.error(
                "Fetch Users Error:",
                error.response?.data || error
            );

            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error.response?.data?.message ||
                    "Unable to load users."
            });

            setUsers([]);

        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // ==========================================
    // SEARCH AND FILTER USERS
    // ==========================================

    const filteredUsers = useMemo(() => {
        const value = search.toLowerCase().trim();

        if (!value) {
            return users;
        }

        return users.filter((user) => {
            const fullName =
                user.fullName?.toLowerCase() || "";

            const email =
                user.email?.toLowerCase() || "";

            const roleMatch =
                user.roles?.some((role) =>
                    role.toLowerCase().includes(value)
                ) ||
                user.role?.toLowerCase().includes(value);

            return (
                fullName.includes(value) ||
                email.includes(value) ||
                roleMatch
            );
        });
    }, [users, search]);

    // ==========================================
    // OPEN EDIT MODAL
    // ==========================================

    const openEditModal = (user) => {
        setSelectedUser(user);

        setFormData({
            fullName: user.fullName || "",
            email: user.email || ""
        });

        setShowEdit(true);
    };

    // ==========================================
    // CLOSE EDIT MODAL
    // ==========================================

    const closeEditModal = () => {
        if (saving) return;

        setShowEdit(false);
        setSelectedUser(null);

        setFormData({
            fullName: "",
            email: ""
        });
    };

    // ==========================================
    // HANDLE FORM INPUT
    // ==========================================

    const handleEditChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // ==========================================
    // UPDATE USER
    // ==========================================

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!selectedUser) return;

        if (
            !formData.fullName.trim() ||
            !formData.email.trim()
        ) {
            Swal.fire({
                icon: "warning",
                title: "Validation Error",
                text: "Name and email are required."
            });

            return;
        }

        try {
            setSaving(true);

            await UserService.update(
                selectedUser.id,
                {
                    fullName: formData.fullName.trim(),
                    email: formData.email.trim()
                }
            );

            setShowEdit(false);
            setSelectedUser(null);

            await Swal.fire({
                icon: "success",
                title: "Updated",
                text: "User updated successfully."
            });

            await fetchUsers();

        } catch (error) {
            console.error(
                "Update User Error:",
                error.response?.data || error
            );

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

    // ==========================================
    // DEACTIVATE USER
    // ==========================================

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
            console.error(
                "Deactivate User Error:",
                error.response?.data || error
            );

            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error.response?.data?.message ||
                    "Unable to deactivate user."
            });
        }
    };

    // ==========================================
    // GET USER ROLES
    // ==========================================

    const getRoles = (user) => {
        if (user.roles?.length) {
            return user.roles.join(", ");
        }

        return user.role || "No Role";
    };

    // ==========================================
    // ROLE PROTECTION
    // ==========================================

    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    // ==========================================
    // UI
    // ==========================================

    return (
        <div className="user-page">

            {/* Header */}
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

            {/* User Statistics */}
            <div className="user-stats">

                <div className="user-stat-card">
                    <span>Total Users</span>
                    <strong>{users.length}</strong>
                </div>

                <div className="user-stat-card">
                    <span>Active Users</span>
                    <strong>
                        {users.filter(
                            (user) => user.isActive
                        ).length}
                    </strong>
                </div>

                <div className="user-stat-card">
                    <span>Inactive Users</span>
                    <strong>
                        {users.filter(
                            (user) => !user.isActive
                        ).length}
                    </strong>
                </div>

            </div>

            {/* Users Table */}
            <div className="user-table-card">

                <div className="user-table-toolbar">

                    <h3>Users List</h3>

                    <input
                        type="search"
                        className="user-search"
                        placeholder="Search name, email or role..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
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
                                    filteredUsers.map((user) => (

                                        <tr key={user.id}>

                                            <td>{user.id}</td>

                                            <td className="user-name-cell">
                                                {user.fullName}
                                            </td>

                                            <td>{user.email}</td>

                                            <td>
                                                {getRoles(user)}
                                            </td>

                                            <td>
                                                <span
                                                    className={`user-status ${
                                                        user.isActive
                                                            ? "active"
                                                            : "inactive"
                                                    }`}
                                                >
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

            {/* Edit User Modal */}
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
                                disabled={saving}
                            >
                                ×
                            </button>

                        </div>

                        <form onSubmit={handleUpdate}>

                            <div className="user-form-group">

                                <label htmlFor="fullName">
                                    Full Name
                                </label>

                                <input
                                    id="fullName"
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleEditChange}
                                    maxLength={100}
                                    required
                                />

                            </div>

                            <div className="user-form-group">

                                <label htmlFor="email">
                                    Email
                                </label>

                                <input
                                    id="email"
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
                                    {saving
                                        ? "Updating..."
                                        : "Update User"}
                                </button>

                                <button
                                    type="button"
                                    className="user-cancel-btn"
                                    onClick={closeEditModal}
                                    disabled={saving}
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
