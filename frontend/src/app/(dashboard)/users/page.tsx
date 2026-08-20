"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";

type User = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
    isActive: boolean;
};

export default function UsersPage() {
    const { user } = useAuth();

    const currentRole = user?.roles?.[0];

    const canManageUsers =
        currentRole === "SuperAdmin" || currentRole === "Admin";

    const canViewUsers =
        currentRole === "SuperAdmin" ||
        currentRole === "Admin" ||
        currentRole === "Developer";

    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("User");
    const [isActive, setIsActive] = useState(true);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                return;
            }

            const response = await fetch(
                "http://localhost:5245/api/users",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);

                console.error(
                    "Users alınamadı:",
                    errorData
                );

                return;
            }

            const data = await response.json();

            setUsers(data);
        } catch (error) {
            console.error("Users bağlantı hatası:", error);
        }
    };

    useEffect(() => {
        if (canViewUsers) {
            fetchUsers();
        }
    }, [canViewUsers]);

    // User rolündeki kullanıcı sayfaya doğrudan girerse
    // sayfayı göstermiyoruz.
    if (!user) {
        return null;
    }

    if (!canViewUsers) {
        return (
            <div className="flex min-h-screen items-center justify-center p-8">
                <div className="text-center">
                    <h1 className="text-xl font-semibold text-gray-900">
                        Access Denied
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        You do not have permission to access this page.
                    </p>
                </div>
            </div>
        );
    }

    const filteredUsers = users.filter((user) => {
        const fullName =
            `${user.firstName} ${user.lastName}`.toLowerCase();

        const searchValue = search.toLowerCase();

        const roles = user.roles.join(" ").toLowerCase();

        return (
            fullName.includes(searchValue) ||
            user.email.toLowerCase().includes(searchValue) ||
            roles.includes(searchValue)
        );
    });

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!canManageUsers) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                return;
            }

            if (editingUser) {
                const response = await fetch(
                    `http://localhost:5245/api/users/${editingUser.id}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            firstName,
                            lastName,
                            email,
                            isActive,
                            role,
                        }),
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    console.error(
                        "Kullanıcı güncellenemedi:",
                        data
                    );
                    return;
                }

                console.log(
                    "Kullanıcı güncellendi:",
                    data
                );

                await fetchUsers();
                closeUserModal();

                return;
            }

            const response = await fetch(
                "http://localhost:5245/api/users",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        firstName,
                        lastName,
                        email,
                        password,
                        role,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error(
                    "Kullanıcı oluşturulamadı:",
                    data
                );
                return;
            }

            console.log(
                "Kullanıcı oluşturuldu:",
                data
            );

            await fetchUsers();
            closeUserModal();

        } catch (error) {
            console.error(
                "Kullanıcı işlemi sırasında hata:",
                error
            );
        }
    };

    const closeUserModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setRole("User");
        setIsActive(true);
    };

    const handleEditUser = (user: User) => {
        if (!canManageUsers) {
            return;
        }

        setEditingUser(user);
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setEmail(user.email);
        setIsActive(user.isActive);
        setRole(user.roles[0] || "User");
        setIsModalOpen(true);
    };

    const handleDeleteUser = async () => {
        if (!deletingUser || !canManageUsers) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                return;
            }

            const response = await fetch(
                `http://localhost:5245/api/users/${deletingUser.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error(
                    "Kullanıcı silinemedi:",
                    data
                );
                return;
            }

            console.log(
                "Kullanıcı silindi:",
                data
            );

            await fetchUsers();

            setDeletingUser(null);

        } catch (error) {
            console.error(
                "Kullanıcı silme hatası:",
                error
            );
        }
    };

    return (
        <div className="p-8">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Users
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                    Manage users in the application.
                </p>
            </div>

            {/* Search & Add User */}
            <div className="mb-6 flex items-center justify-between gap-4">

                <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
                />

                {/* Sadece Admin ve SuperAdmin */}
                {canManageUsers && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditingUser(null);
                            setFirstName("");
                            setLastName("");
                            setEmail("");
                            setPassword("");
                            setRole("User");
                            setIsActive(true);
                            setIsModalOpen(true);
                        }}
                        className="whitespace-nowrap rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                        + Add User
                    </button>
                )}
            </div>

            {/* Users Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                <div className="overflow-x-auto">

                    <table className="w-full text-left">

                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>

                                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                                    Name
                                </th>

                                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                                    Email
                                </th>

                                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                                    Role
                                </th>

                                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                                    Status
                                </th>

                                {/* Actions sadece yönetebilenlerde */}
                                {canManageUsers && (
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                                        Actions
                                    </th>
                                )}

                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">

                            {filteredUsers.map((user) => (
                                <tr
                                    key={user.id}
                                    className="transition hover:bg-gray-50"
                                >

                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">
                                            {user.firstName}{" "}
                                            {user.lastName}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {user.email}
                                    </td>

                                    <td className="px-6 py-4">

                                        {user.roles.map((role) => (
                                            <span
                                                key={role}
                                                className={`mr-2 rounded-full px-3 py-1 text-xs font-medium ${
                                                    role === "SuperAdmin"
                                                        ? "bg-red-100 text-red-700"
                                                        : role === "Admin"
                                                            ? "bg-purple-100 text-purple-700"
                                                            : role === "Developer"
                                                                ? "bg-blue-100 text-blue-700"
                                                                : "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {role}
                                            </span>
                                        ))}

                                    </td>

                                    <td className="px-6 py-4">

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                user.isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            {user.isActive
                                                ? "Active"
                                                : "Inactive"}
                                        </span>

                                    </td>

                                    {/* Actions */}
                                    {canManageUsers && (
                                        <td className="px-6 py-4 text-right">

                                            <div className="flex justify-end gap-2">

                                                {/* Edit */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEditUser(user)
                                                    }
                                                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                                                >
                                                    Edit
                                                </button>

                                                {/* Delete */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDeletingUser(user)
                                                    }
                                                    className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </td>
                                    )}

                                </tr>
                            ))}

                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={
                                            canManageUsers ? 5 : 4
                                        }
                                        className="px-6 py-10 text-center text-sm text-gray-500"
                                    >
                                        No users found.
                                    </td>
                                </tr>
                            )}

                        </tbody>

                    </table>

                </div>

            </div>

            {/* User Count */}
            <div className="mt-4 text-sm text-gray-500">
                Showing {filteredUsers.length} of{" "}
                {users.length} users
            </div>

            {/* Add / Edit User Modal */}
            {isModalOpen && canManageUsers && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

                        <div className="mb-6 flex items-center justify-between">

                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {editingUser
                                        ? "Edit User"
                                        : "Add New User"}
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {editingUser
                                        ? "Update user information."
                                        : "Create a new application user."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeUserModal}
                                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                            >
                                ✕
                            </button>

                        </div>

                        <form
                            onSubmit={handleSaveUser}
                            className="space-y-4"
                        >

                            {/* First Name */}
                            <div>
                                <label
                                    htmlFor="firstName"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    First Name
                                </label>

                                <input
                                    id="firstName"
                                    type="text"
                                    value={firstName}
                                    onChange={(e) =>
                                        setFirstName(e.target.value)
                                    }
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-500"
                                />
                            </div>

                            {/* Last Name */}
                            <div>
                                <label
                                    htmlFor="lastName"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Last Name
                                </label>

                                <input
                                    id="lastName"
                                    type="text"
                                    value={lastName}
                                    onChange={(e) =>
                                        setLastName(e.target.value)
                                    }
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-500"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Email
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-500"
                                />
                            </div>

                            {/* Password */}
                            {!editingUser && (
                                <div>
                                    <label
                                        htmlFor="password"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        Password
                                    </label>

                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-500"
                                    />
                                </div>
                            )}

                            {/* Role */}
                            <div>
                                <label
                                    htmlFor="role"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Role
                                </label>

                                <select
                                    id="role"
                                    value={role}
                                    onChange={(e) =>
                                        setRole(e.target.value)
                                    }
                                    className="h-[46px] w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-700 outline-none focus:border-gray-500"
                                >
                                    <option value="User">
                                        User
                                    </option>

                                    <option value="Developer">
                                        Developer
                                    </option>

                                    <option value="Admin">
                                        Admin
                                    </option>
                                </select>
                            </div>

                            {/* Status */}
                            {editingUser && (
                                <div>
                                    <label
                                        htmlFor="isActive"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        Status
                                    </label>

                                    <select
                                        id="isActive"
                                        value={
                                            isActive
                                                ? "active"
                                                : "inactive"
                                        }
                                        onChange={(e) =>
                                            setIsActive(
                                                e.target.value ===
                                                "active"
                                            )
                                        }
                                        className="h-[46px] w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-700 outline-none focus:border-gray-500"
                                    >
                                        <option value="active">
                                            Active
                                        </option>

                                        <option value="inactive">
                                            Inactive
                                        </option>
                                    </select>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 pt-4">

                                <button
                                    type="button"
                                    onClick={closeUserModal}
                                    className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                                >
                                    {editingUser
                                        ? "Save Changes"
                                        : "Add User"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* Delete User Modal */}
            {deletingUser && canManageUsers && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">

                        <h2 className="text-xl font-semibold text-gray-900">
                            Delete User?
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            Are you sure you want to delete{" "}
                            <span className="font-medium text-gray-700">
                                {deletingUser.firstName}{" "}
                                {deletingUser.lastName}
                            </span>
                            ?
                        </p>

                        <div className="mt-6 flex justify-end gap-3">

                            <button
                                type="button"
                                onClick={() =>
                                    setDeletingUser(null)
                                }
                                className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDeleteUser}
                                className="rounded-lg bg-red-600 px-5 py-3 text-sm font-medium text-white hover:bg-red-700"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}