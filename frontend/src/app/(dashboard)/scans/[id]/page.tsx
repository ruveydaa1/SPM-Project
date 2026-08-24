"use client";

import { Fragment, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useAuth } from "@/components/AuthProvider";
import { ScanRun } from "../types";

export default function ScanDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();

    const [scan, setScan] = useState<ScanRun | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedFinding, setExpandedFinding] =
        useState<number | null>(null);

    const fetchScan = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                setError("Authentication token not found.");
                return;
            }

            const response = await fetch(
                `http://localhost:5245/api/scan-runs/${params.id}`,
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
                        "Scan details could not be retrieved."
                );

                return;
            }

            setScan(data);
        } catch (error) {
            console.error(
                "Scan detayı alınırken hata:",
                error
            );

            setError(
                "Backend'e bağlanılamadı."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.roles?.[0] !== "User" && params.id) {
            fetchScan();
        }
    }, [user, params.id]);

    // User rolü Scan Details sayfasına erişemez
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
                    Scan Details
                </h1>

                <p className="mt-4 text-sm text-gray-500">
                    Loading scan details...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Scan Details
                </h1>

                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-600">
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    if (!scan) {
        return null;
    }

    return (
        <div className="p-8">
            <div className="mb-6">
                <button
                    onClick={() => router.push("/scans")}
                    className="mb-4 inline-flex items-center text-sm font-medium text-gray-500 transition hover:text-gray-900"
                >
                    ← Back to Scans
                </button>

                <h1 className="text-3xl font-bold text-gray-900">
                    Scan #{scan.id}
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                    Detailed information about this scan.
                </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-400">
                            Asset
                        </p>

                        <p className="mt-1 font-medium text-gray-900">
                            #{scan.assetId}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-400">
                            Scanner
                        </p>

                        <p className="mt-1 font-medium text-gray-900">
                            {scan.scanner}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-400">
                            Status
                        </p>

                        <span
                            className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                                scan.status.toLowerCase() ===
                                "completed"
                                    ? "bg-green-100 text-green-700"
                                    : scan.status.toLowerCase() ===
                                        "failed"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
                            {scan.status}
                        </span>
                    </div>

                    <div>
                        <p className="text-sm text-gray-400">
                            Findings
                        </p>

                        <p className="mt-1 font-medium text-gray-900">
                            {scan.findings?.length ?? 0}
                        </p>
                    </div>

                    <div className="col-span-2">
                        <p className="text-sm text-gray-400">
                            Source
                        </p>

                        <p className="mt-1 break-all font-medium text-gray-900">
                            {scan.source}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-400">
                            Started At
                        </p>

                        <p className="mt-1 font-medium text-gray-900">
                            {scan.startedAt}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-400">
                            Completed At
                        </p>

                        <p className="mt-1 font-medium text-gray-900">
                            {scan.completedAt || "-"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Vulnerability Findings
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Security findings detected during this scan.
                    </p>
                </div>

                {scan.findings.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <p className="text-sm text-gray-500">
                            No vulnerabilities were found in this scan.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-gray-200 bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Severity
                                    </th>

                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Finding
                                    </th>

                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        File
                                    </th>

                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Line
                                    </th>

                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        CWE
                                    </th>

                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        OWASP
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {scan.findings.map(
                                    (finding, index) => {
                                        const isExpanded =
                                            expandedFinding ===
                                            index;

                                        const cweValue =
                                            Array.isArray(
                                                finding.cwe
                                            )
                                                ? finding.cwe.join(
                                                      ", "
                                                  )
                                                : finding.cwe ||
                                                  "-";

                                        const owaspValue =
                                            Array.isArray(
                                                finding.owasp
                                            )
                                                ? finding.owasp.join(
                                                      ", "
                                                  )
                                                : finding.owasp ||
                                                  "-";

                                        return (
                                            <Fragment
                                                key={`${finding.checkId}-${index}`}
                                            >
                                                <tr
                                                    onClick={() =>
                                                        setExpandedFinding(
                                                            isExpanded
                                                                ? null
                                                                : index
                                                        )
                                                    }
                                                    className="cursor-pointer hover:bg-gray-50"
                                                >
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                                finding.severity?.toLowerCase() ===
                                                                "high"
                                                                    ? "bg-red-100 text-red-700"
                                                                    : finding.severity?.toLowerCase() ===
                                                                        "medium"
                                                                      ? "bg-yellow-100 text-yellow-700"
                                                                      : finding.severity?.toLowerCase() ===
                                                                          "low"
                                                                        ? "bg-blue-100 text-blue-700"
                                                                        : "bg-gray-100 text-gray-700"
                                                            }`}
                                                        >
                                                            {
                                                                finding.severity
                                                            }
                                                        </span>
                                                    </td>

                                                    <td className="max-w-md px-6 py-4">
                                                        <p className="font-medium text-gray-900">
                                                            {
                                                                finding.message
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-400">
                                                            {
                                                                finding.checkId
                                                            }
                                                        </p>
                                                    </td>

                                                    <td className="max-w-xs px-6 py-4">
                                                        <p
                                                            className="truncate text-gray-700"
                                                            title={
                                                                finding.path
                                                            }
                                                        >
                                                            {
                                                                finding.path
                                                            }
                                                        </p>
                                                    </td>

                                                    <td className="px-6 py-4 text-gray-700">
                                                        {
                                                            finding.startLine
                                                        }
                                                    </td>

                                                    <td className="px-6 py-4 text-gray-700">
                                                        {
                                                            cweValue
                                                        }
                                                    </td>

                                                    <td className="px-6 py-4 text-gray-700">
                                                        {
                                                            owaspValue
                                                        }
                                                    </td>
                                                </tr>

                                                {isExpanded && (
                                                    <tr className="bg-gray-50">
                                                        <td
                                                            colSpan={6}
                                                            className="px-6 py-6"
                                                        >
                                                            <div className="rounded-lg border border-gray-200 bg-white p-5">
                                                                <div className="mb-5">
                                                                    <h3 className="text-base font-semibold text-gray-900">
                                                                        Finding Details
                                                                    </h3>

                                                                    <p className="mt-1 text-sm text-gray-500">
                                                                        Detailed information about this security finding.
                                                                    </p>
                                                                </div>

                                                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                                                    <div>
                                                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                                            Check ID
                                                                        </p>

                                                                        <p className="mt-1 break-all text-sm font-medium text-gray-900">
                                                                            {
                                                                                finding.checkId
                                                                            }
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                                            Category
                                                                        </p>

                                                                        <p className="mt-1 text-sm font-medium text-gray-900">
                                                                            {
                                                                                finding.category ||
                                                                                "-"
                                                                            }
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                                            Severity
                                                                        </p>

                                                                        <p className="mt-1 text-sm font-medium text-gray-900">
                                                                            {
                                                                                finding.severity ||
                                                                                "-"
                                                                            }
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                                            Confidence
                                                                        </p>

                                                                        <p className="mt-1 text-sm font-medium text-gray-900">
                                                                            {
                                                                                finding.confidence ||
                                                                                "-"
                                                                            }
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                                            Impact
                                                                        </p>

                                                                        <p className="mt-1 text-sm font-medium text-gray-900">
                                                                            {
                                                                                finding.impact ||
                                                                                "-"
                                                                            }
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                                            Vulnerability Class
                                                                        </p>

                                                                        <p className="mt-1 break-all text-sm font-medium text-gray-900">
                                                                            {
                                                                                finding.vulnerabilityClass ||
                                                                                "-"
                                                                            }
                                                                        </p>
                                                                    </div>

                                                                    <div className="md:col-span-2">
                                                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                                            Message
                                                                        </p>

                                                                        <p className="mt-1 text-sm leading-6 text-gray-900">
                                                                            {
                                                                                finding.message
                                                                            }
                                                                        </p>
                                                                    </div>

                                                                    <div className="md:col-span-2">
                                                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                                            File / Path
                                                                        </p>

                                                                        <p className="mt-1 break-all text-sm text-gray-900">
                                                                            {
                                                                                finding.path
                                                                            }
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                                            Location
                                                                        </p>

                                                                        <p className="mt-1 text-sm text-gray-900">
                                                                            Line{" "}
                                                                            {
                                                                                finding.startLine
                                                                            }
                                                                            :
                                                                            {
                                                                                finding.startColumn
                                                                            }{" "}
                                                                            -{" "}
                                                                            Line{" "}
                                                                            {
                                                                                finding.endLine
                                                                            }
                                                                            :
                                                                            {
                                                                                finding.endColumn
                                                                            }
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                                            CWE
                                                                        </p>

                                                                        <p className="mt-1 break-all text-sm text-gray-900">
                                                                            {
                                                                                cweValue
                                                                            }
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                                            OWASP
                                                                        </p>

                                                                        <p className="mt-1 break-all text-sm text-gray-900">
                                                                            {
                                                                                owaspValue
                                                                            }
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                                            Reference
                                                                        </p>

                                                                        {finding.reference ? (
                                                                            <a
                                                                                href={
                                                                                    finding.reference
                                                                                }
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                onClick={(
                                                                                    e
                                                                                ) =>
                                                                                    e.stopPropagation()
                                                                                }
                                                                                className="mt-1 block break-all text-sm font-medium text-blue-600 hover:underline"
                                                                            >
                                                                                {
                                                                                    finding.reference
                                                                                }
                                                                            </a>
                                                                        ) : (
                                                                            <p className="mt-1 text-sm text-gray-900">
                                                                                -
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}