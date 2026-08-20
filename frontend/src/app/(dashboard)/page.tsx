"use client";

import { useEffect, useState } from "react";

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState<
    "Operational" | "Unavailable"
  >("Unavailable");

  const [systemStatusLoading, setSystemStatusLoading] = useState(true);

  useEffect(() => {
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
            "Dashboard users alınamadı:",
            errorData
          );

          return;
        }

        const data = await response.json();

        setUsers(data);
      } catch (error) {
        console.error(
          "Dashboard bağlantı hatası:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const response = await fetch(
          "http://localhost:5245/api/health"
        );

        if (!response.ok) {
          setSystemStatus("Unavailable");
          return;
        }

        const data = await response.json();

        if (data.status === "Operational") {
          setSystemStatus("Operational");
        } else {
          setSystemStatus("Unavailable");
        }
      } catch (error) {
        console.error(
          "System status kontrolü başarısız:",
          error
        );

        setSystemStatus("Unavailable");
      } finally {
        setSystemStatusLoading(false);
      }
    };

    checkSystemStatus();
  }, []);

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.isActive
  ).length;

  const newUsers = users.filter((user) => {
    const createdAt = new Date(user.createdAt);
    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(
      sevenDaysAgo.getDate() - 7
    );

    return createdAt >= sevenDaysAgo;
  }).length;

  const superAdminCount = users.filter((user) =>
    user.roles.includes("SuperAdmin")
  ).length;

  const adminCount = users.filter((user) =>
    user.roles.includes("Admin")
  ).length;

  const developerCount = users.filter((user) =>
    user.roles.includes("Developer")
  ).length;

  const userCount = users.filter((user) =>
    user.roles.includes("User")
  ).length;

  const activePercentage =
    totalUsers > 0
      ? ((activeUsers / totalUsers) * 100).toFixed(1)
      : "0";

  const getRolePercentage = (count: number) => {
    if (totalUsers === 0) return 0;

    return (count / totalUsers) * 100;
  };

  return (
    <div className="p-8">

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Overview of your application.
        </p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Loading dashboard...
        </div>
      ) : (
        <>
          {/* Statistics */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {/* Total Users */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                Total Users
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {totalUsers}
              </p>

              <p className="mt-2 text-xs text-gray-500">
                All registered users
              </p>
            </div>

            {/* Active Users */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                Active Users
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {activeUsers}
              </p>

              <p className="mt-2 text-xs text-green-600">
                {activePercentage}% of total users
              </p>
            </div>

            {/* New Users */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                New Users
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {newUsers}
              </p>

              <p className="mt-2 text-xs text-gray-500">
                Added in the last 7 days
              </p>
            </div>

            {/* System Status */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                System Status
              </p>

              {systemStatusLoading ? (
                <div className="mt-3">
                  <p className="text-lg font-semibold text-gray-500">
                    Checking...
                  </p>

                  <p className="mt-2 text-xs text-gray-500">
                    Checking system availability
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${systemStatus === "Operational"
                          ? "bg-green-500"
                          : "bg-red-500"
                        }`}
                    />

                    <p
                      className={`text-lg font-semibold ${systemStatus === "Operational"
                          ? "text-green-600"
                          : "text-red-600"
                        }`}
                    >
                      {systemStatus}
                    </p>
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    {systemStatus === "Operational"
                      ? "All systems are running normally"
                      : "Backend service is unavailable"}
                  </p>
                </>
              )}
            </div>

          </div>

          {/* Lower Section */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2">

            {/* Users by Role */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

              <div className="border-b border-gray-200 px-6 py-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Users by Role
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Distribution of users across application roles.
                </p>
              </div>

              <div className="space-y-5 px-6 py-6">

                {/* SuperAdmin */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      SUPERADMIN
                    </span>

                    <span className="text-sm text-gray-500">
                      {superAdminCount}
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-red-500"
                      style={{
                        width: `${getRolePercentage(superAdminCount)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Admin */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      ADMIN
                    </span>

                    <span className="text-sm text-gray-500">
                      {adminCount}
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-purple-500"
                      style={{
                        width: `${getRolePercentage(adminCount)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Developer */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      DEVELOPER
                    </span>

                    <span className="text-sm text-gray-500">
                      {developerCount}
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{
                        width: `${getRolePercentage(developerCount)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* User */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      USER
                    </span>

                    <span className="text-sm text-gray-500">
                      {userCount}
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-gray-500"
                      style={{
                        width: `${getRolePercentage(userCount)}%`,
                      }}
                    />
                  </div>
                </div>

              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}