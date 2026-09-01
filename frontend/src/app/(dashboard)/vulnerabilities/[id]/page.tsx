"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function VulnerabilityDetailPage() {
    const { user } = useAuth();
    const params = useParams();

    const id = params.id;

    const [finding, setFinding] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchFinding = async () => {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");

                if (!token) {
                    setError("Authentication token not found.");
                    return;
                }

                const response = await fetch(
                    `http://localhost:5245/api/findings/${id}`,
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
                            "Vulnerability details could not be retrieved."
                    );
                    return;
                }

                setFinding(data);
            } catch (error) {
                console.error(
                    "Vulnerability detayı alınırken hata:",
                    error
                );

                setError("Backend'e bağlanılamadı.");
            } finally {
                setLoading(false);
            }
        };

        if (user && user.roles?.[0] !== "User" && id) {
            fetchFinding();
        }
    }, [user, id]);

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
                    Vulnerability Details
                </h1>

                <p className="mt-4 text-sm text-gray-500">
                    Loading vulnerability details...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Vulnerability Details
                </h1>

                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!finding) {
        return (
            <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Vulnerability Details
                </h1>

                <p className="mt-4 text-sm text-gray-500">
                    Vulnerability not found.
                </p>
            </div>
        );
    }

    const getSeverityClass = (severity: string) => {
        switch (severity?.toLowerCase()) {
            case "error":
                return "bg-red-100 text-red-700 border-red-200";

            case "warning":
                return "bg-yellow-100 text-yellow-700 border-yellow-200";

            case "info":
                return "bg-green-100 text-green-700 border-green-200";

            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getSeverityLabel = (severity: string) => {
        if (!severity) return "Unknown";

        return (
            severity.charAt(0).toUpperCase() +
            severity.slice(1).toLowerCase()
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-6xl">
                {/* Back */}
                <Link
                    href="/vulnerabilities"
                    className="inline-flex items-center text-sm font-medium text-gray-500 transition hover:text-gray-900"
                >
                    ← Back to Vulnerabilities
                </Link>

                {/* Header */}
                <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Vulnerability Finding #{finding.id}
                            </p>

                            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                                {finding.vulnerabilityClass ||
                                    finding.checkId ||
                                    "Unknown vulnerability"}
                            </h1>

                            <p className="mt-3 max-w-4xl text-sm leading-6 text-gray-600">
                                {finding.message ||
                                    "No description available for this vulnerability."}
                            </p>
                        </div>

                        <span
                            className={`inline-flex w-fit shrink-0 items-center rounded-full border px-4 py-2 text-sm font-semibold ${getSeverityClass(
                                finding.severity
                            )}`}
                        >
                            {getSeverityLabel(finding.severity)}
                        </span>
                    </div>
                </div>

                {/* Overview */}
                <div className="mt-8">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Overview
                    </h2>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Severity
                            </p>

                            <p className="mt-2 text-lg font-semibold text-gray-900">
                                {getSeverityLabel(finding.severity)}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Confidence
                            </p>

                            <p className="mt-2 text-lg font-semibold text-gray-900">
                                {finding.confidence || "-"}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Impact
                            </p>

                            <p className="mt-2 text-lg font-semibold text-gray-900">
                                {finding.impact || "-"}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Category
                            </p>

                            <p className="mt-2 text-lg font-semibold text-gray-900">
                                {finding.category || "-"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Security + Finding Information */}
                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Security Classification */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-5">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Security Classification
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Security standards associated with this finding.
                            </p>
                        </div>

                        <div className="space-y-5 px-6 py-6">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    CWE
                                </p>

                                <p className="mt-2 text-sm font-medium text-gray-900">
                                    {finding.cwe || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    OWASP
                                </p>

                                <p className="mt-2 text-sm font-medium leading-6 text-gray-900">
                                    {finding.owasp || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Vulnerability Class
                                </p>

                                <p className="mt-2 text-sm font-medium text-gray-900">
                                    {finding.vulnerabilityClass || "-"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Finding Information */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-5">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Finding Information
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Identification information for this finding.
                            </p>
                        </div>

                        <div className="space-y-5 px-6 py-6">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Finding ID
                                </p>

                                <p className="mt-2 text-sm font-medium text-gray-900">
                                    {finding.id}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Check ID
                                </p>

                                <div className="mt-2 rounded-lg bg-gray-50 p-3">
                                    <p className="break-all font-mono text-xs leading-5 text-gray-700">
                                        {finding.checkId || "-"}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Asset
                                </p>

                                <p className="mt-2 text-sm font-medium text-gray-900">
                                    {finding.asset?.name ||
                                        finding.assetId ||
                                        "-"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Scan Run ID
                                </p>

                                <p className="mt-2 text-sm font-medium text-gray-900">
                                    {finding.scanRunId || "-"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Code Location */}
                <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-6 py-5">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Code Location
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Location where the vulnerability was detected.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 px-6 py-6 md:grid-cols-3">
                        <div className="md:col-span-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                File
                            </p>

                            <div className="mt-2 rounded-lg bg-gray-50 p-3">
                                <p className="break-all font-mono text-xs leading-5 text-gray-700">
                                    {finding.path || "-"}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Start Position
                            </p>

                            <p className="mt-2 text-sm font-medium text-gray-900">
                                Line {finding.startLine ?? "-"} · Column{" "}
                                {finding.startColumn ?? "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                End Position
                            </p>

                            <p className="mt-2 text-sm font-medium text-gray-900">
                                Line {finding.endLine ?? "-"} · Column{" "}
                                {finding.endColumn ?? "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Detected At
                            </p>

                            <p className="mt-2 text-sm font-medium text-gray-900">
                                {finding.createdAt
                                    ? new Date(
                                          finding.createdAt
                                      ).toLocaleString()
                                    : "-"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Scan Information */}
                {finding.scanRun && (
                    <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-5">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Scan Information
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Information about the scan that detected this
                                finding.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 px-6 py-6 md:grid-cols-2">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Scanner
                                </p>

                                <p className="mt-2 text-sm font-medium text-gray-900">
                                    {finding.scanRun.scanner || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Status
                                </p>

                                <p className="mt-2 text-sm font-medium text-gray-900">
                                    {finding.scanRun.status || "-"}
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Source
                                </p>

                                <div className="mt-2 rounded-lg bg-gray-50 p-3">
                                    <p className="break-all font-mono text-xs leading-5 text-gray-700">
                                        {finding.scanRun.source || "-"}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Started At
                                </p>

                                <p className="mt-2 text-sm font-medium text-gray-900">
                                    {finding.scanRun.startedAt
                                        ? new Date(
                                              finding.scanRun.startedAt
                                          ).toLocaleString()
                                        : "-"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Completed At
                                </p>

                                <p className="mt-2 text-sm font-medium text-gray-900">
                                    {finding.scanRun.completedAt
                                        ? new Date(
                                              finding.scanRun.completedAt
                                          ).toLocaleString()
                                        : "-"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* References */}
                <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-6 py-5">
                        <h2 className="text-lg font-semibold text-gray-900">
                            References
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            External resources related to this vulnerability.
                        </p>
                    </div>

                    <div className="px-6 py-6">
                        {finding.reference ? (
                            <div className="space-y-3">
                                {finding.reference
                                    .split(",")
                                    .map(
                                        (
                                            reference: string,
                                            index: number
                                        ) => {
                                            const url = reference.trim();

                                            return (
                                                <a
                                                    key={index}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block break-all rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-blue-600 transition hover:border-gray-300 hover:bg-gray-100 hover:text-blue-700"
                                                >
                                                    {url}
                                                </a>
                                            );
                                        }
                                    )}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">
                                No references available.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}