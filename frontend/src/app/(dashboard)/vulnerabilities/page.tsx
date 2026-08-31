"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function VulnerabilitiesPage() {
    const { user } = useAuth();

    const [findings, setFindings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchFindings = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                setError("Authentication token not found.");
                return;
            }

            const response = await fetch(
                "http://localhost:5245/api/findings",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data?.message ||
                    "Vulnerability records could not be retrieved."
                );

                return;
            }

            setFindings(data);
        } catch (error) {
            console.error(
                "Vulnerability kayıtları alınırken hata:",
                error
            );

            setError("Backend'e bağlanılamadı.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.roles?.[0] !== "User") {
            fetchFindings();
        }
    }, [user]);

    if (user && user.roles?.[0] === "User") {
        return (
            <div className="flex min-h-screen items-center justify-center p-8">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Access Denied
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        You do not have permission to access this page.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Vulnerabilities
                </h1>

                <p className="mt-4 text-sm text-gray-500">
                    Loading vulnerability records...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Vulnerabilities
                </h1>

                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-600">
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    const getSeverityClass = (severity: string) => {
        switch (severity?.toLowerCase()) {
            case "error":
                return "bg-red-500 text-white";

            case "warning":
                return "bg-yellow-400 text-gray-900";

            case "info":
                return "bg-green-500 text-white";

            default:
                return "bg-gray-400 text-white";
        }
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Vulnerabilities
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                    View all vulnerability findings detected across scans.
                </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                {/* Summary */}
                <div className="border-b border-gray-200 px-6 py-4">
                    <p className="text-sm text-gray-500">
                        Total vulnerabilities:{" "}
                        <span className="font-semibold text-gray-900">
                            {findings.length}
                        </span>
                    </p>
                </div>

                {findings.length === 0 ? (
                    <div className="px-6 py-10 text-center">
                        <p className="text-sm text-gray-500">
                            No vulnerability records found.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Severity
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Vulnerability
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Asset
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        CWE
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Detected At
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {findings.map((finding) => (
                                    <tr
                                        key={finding.id}
                                        className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                                    >
                                        {/* Severity */}
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getSeverityClass(
                                                    finding.severity
                                                )}`}
                                            >
                                                {finding.severity || "Unknown"}
                                            </span>
                                        </td>

                                        {/* Vulnerability */}
                                        <td className="max-w-md px-6 py-4">
                                            <p className="font-medium text-gray-900">
                                                {finding.vulnerabilityClass ||
                                                    finding.checkId ||
                                                    "Unknown vulnerability"}
                                            </p>

                                            {finding.message && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {finding.message}
                                                </p>
                                            )}
                                        </td>

                                        {/* Asset */}
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {finding.asset?.name ||
                                                finding.assetId ||
                                                "-"}
                                        </td>

                                        {/* CWE */}
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {finding.cwe || "-"}
                                        </td>

                                        {/* Detected At */}
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {finding.createdAt
                                                ? new Date(
                                                    finding.createdAt
                                                ).toLocaleString()
                                                : "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}