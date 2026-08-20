"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function ProfilePage() {
    const { user } = useAuth();

    const [firstName, setFirstName] = useState(user?.firstName ?? "");
    const [lastName, setLastName] = useState(user?.lastName ?? "");
    const [email, setEmail] = useState(user?.email ?? "");

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    if (!user) {
        return null;
    }

    const role = user.roles[0] ?? "User";

    const roleStyle =
        role === "SuperAdmin"
            ? "bg-red-100 text-red-700"
            : role === "Admin"
                ? "bg-purple-100 text-purple-700"
                : role === "Developer"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700";

    const handleSave = async () => {
        setSaving(true);
        setMessage("");
        setError("");

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setError("Oturum bulunamadı.");
                return;
            }

            const response = await fetch(
                `http://localhost:5245/api/users/${user.userId}`,
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
                        isActive: true,
                    }),
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                setError(
                    data?.message || "Profil güncellenirken bir hata oluştu."
                );
                return;
            }

            const updatedUser = {
                ...user,
                firstName,
                lastName,
                email,
            };

            localStorage.setItem("user", JSON.stringify(updatedUser));

            setMessage("Profil başarıyla güncellendi.");
        } catch (error) {
            console.error("Profil güncelleme hatası:", error);
            setError("Sunucuya bağlanılamadı.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Profile
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                    Manage your profile information.
                </p>
            </div>

            {/* Profile Header Card */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-5">

                    {/* Avatar */}
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-900 text-2xl font-semibold text-white">
                        {firstName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {firstName} {lastName}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {email}
                        </p>

                        <span
                            className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${roleStyle}`}
                        >
                            {role}
                        </span>
                    </div>

                </div>
            </div>

            {/* Personal Information */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Personal Information
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Update your personal information.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

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
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-gray-500"
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
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-gray-500"
                        />
                    </div>

                    {/* Email */}
                    <div className="md:col-span-2">
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
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-gray-500"
                        />
                    </div>

                </div>

                {/* Account Information */}
                <div className="mt-8 border-t border-gray-200 pt-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Account Information
                    </h2>

                    <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-4">
                        <div>
                            <p className="text-sm font-medium text-gray-700">
                                Role
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                Your current account role
                            </p>
                        </div>

                        <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${roleStyle}`}
                        >
                            {role}
                        </span>
                    </div>
                </div>

                {/* Messages */}
                {message && (
                    <p className="mt-4 text-sm text-green-600">
                        {message}
                    </p>
                )}

                {error && (
                    <p className="mt-4 text-sm text-red-600">
                        {error}
                    </p>
                )}

                {/* Save Button */}
                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>

            </div>

        </div>
    );
}