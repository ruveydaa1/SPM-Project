"use client";

import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    Package,
    ScanLine,
    Settings,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import { useAuth } from "@/components/AuthProvider";

type SidebarProps = {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
};

export default function Sidebar({
    isCollapsed,
    setIsCollapsed,
}: SidebarProps) {
    const { user } = useAuth();

    return (
        <aside
            className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 ${
                isCollapsed ? "w-20" : "w-64"
            }`}
        >
            {/* Logo */}
            <div
                className={`flex h-20 items-center border-b border-gray-200 ${
                    isCollapsed ? "justify-center px-3" : "px-6"
                }`}
            >
                {isCollapsed ? (
                    <h1 className="text-xl font-bold text-gray-900">
                        S
                    </h1>
                ) : (
                    <h1 className="text-xl font-bold tracking-tight text-gray-900">
                        Security Platform
                    </h1>
                )}
            </div>

            {/* Collapse Button */}
            <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-24 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:bg-gray-50 hover:text-gray-900"
            >
                {isCollapsed ? (
                    <ChevronRight size={14} />
                ) : (
                    <ChevronLeft size={14} />
                )}
            </button>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6">

                {/* Main */}
                <div>
                    {!isCollapsed && (
                        <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Main
                        </p>
                    )}

                    <div className="space-y-1">

                        {/* Dashboard */}
                        <Link
                            href="/"
                            title={isCollapsed ? "Dashboard" : undefined}
                            className={`flex items-center rounded-lg py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 ${
                                isCollapsed
                                    ? "justify-center px-3"
                                    : "gap-3 px-4"
                            }`}
                        >
                            <LayoutDashboard size={19} />

                            {!isCollapsed && (
                                <span>Dashboard</span>
                            )}
                        </Link>

                        {/* Users */}
                        {user?.roles?.[0] === "User" ? (
                            <div
                                title="You do not have permission to access Users"
                                className={`flex cursor-not-allowed items-center rounded-lg py-3 text-sm font-medium text-gray-400 ${
                                    isCollapsed
                                        ? "justify-center px-3"
                                        : "gap-3 px-4"
                                }`}
                            >
                                <Users size={19} />

                                {!isCollapsed && (
                                    <span>Users</span>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/users"
                                title={isCollapsed ? "Users" : undefined}
                                className={`flex items-center rounded-lg py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 ${
                                    isCollapsed
                                        ? "justify-center px-3"
                                        : "gap-3 px-4"
                                }`}
                            >
                                <Users size={19} />

                                {!isCollapsed && (
                                    <span>Users</span>
                                )}
                            </Link>
                        )}

                        {/* Assets */}
                        {user?.roles?.[0] === "User" ? (
                            <div
                                title="You do not have permission to access Assets"
                                className={`flex cursor-not-allowed items-center rounded-lg py-3 text-sm font-medium text-gray-400 ${
                                    isCollapsed
                                        ? "justify-center px-3"
                                        : "gap-3 px-4"
                                }`}
                            >
                                <Package size={19} />

                                {!isCollapsed && (
                                    <span>Assets</span>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/assets"
                                title={isCollapsed ? "Assets" : undefined}
                                className={`flex items-center rounded-lg py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 ${
                                    isCollapsed
                                        ? "justify-center px-3"
                                        : "gap-3 px-4"
                                }`}
                            >
                                <Package size={19} />

                                {!isCollapsed && (
                                    <span>Assets</span>
                                )}
                            </Link>
                        )}

                        {/* Scans */}
                        {user?.roles?.[0] === "User" ? (
                            <div
                                title="You do not have permission to access Scans"
                                className={`flex cursor-not-allowed items-center rounded-lg py-3 text-sm font-medium text-gray-400 ${
                                    isCollapsed
                                        ? "justify-center px-3"
                                        : "gap-3 px-4"
                                }`}
                            >
                                <ScanLine size={19} />

                                {!isCollapsed && (
                                    <span>Scans</span>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/scans"
                                title={isCollapsed ? "Scans" : undefined}
                                className={`flex items-center rounded-lg py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 ${
                                    isCollapsed
                                        ? "justify-center px-3"
                                        : "gap-3 px-4"
                                }`}
                            >
                                <ScanLine size={19} />

                                {!isCollapsed && (
                                    <span>Scans</span>
                                )}
                            </Link>
                        )}

                    </div>
                </div>

                {/* Settings */}
                <div className="mt-8">
                    <Link
                        href="/settings"
                        title={isCollapsed ? "Settings" : undefined}
                        className={`flex items-center rounded-lg py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 ${
                            isCollapsed
                                ? "justify-center px-3"
                                : "gap-3 px-4"
                        }`}
                    >
                        <Settings size={19} />

                        {!isCollapsed && (
                            <span>Settings</span>
                        )}
                    </Link>
                </div>

            </nav>

            {/* Current User */}
            <div className="border-t border-gray-200 p-4">

                <Link
                    href="/profile"
                    title={isCollapsed ? "Profile" : undefined}
                    className={`flex items-center rounded-lg p-2 transition hover:bg-gray-100 ${
                        isCollapsed
                            ? "justify-center"
                            : "gap-3"
                    }`}
                >
                    {/* Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                        {user?.firstName?.charAt(0).toUpperCase()}
                    </div>

                    {/* User Info */}
                    {!isCollapsed && (
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900">
                                {user?.firstName} {user?.lastName}
                            </p>

                            <p className="text-xs text-gray-500">
                                {user?.roles?.[0]}
                            </p>
                        </div>
                    )}

                </Link>

            </div>

        </aside>
    );
}