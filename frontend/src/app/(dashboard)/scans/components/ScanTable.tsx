"use client";

import { ScanRun } from "../types";
import { useRouter } from "next/navigation";

interface ScanTableProps {
    scanRuns: ScanRun[];
}

export default function ScanTable({
    scanRuns,
}: ScanTableProps) {
    const router = useRouter();

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700">
                                Scan
                            </th>

                            <th className="px-6 py-4 font-semibold text-gray-700">
                                Asset
                            </th>

                            <th className="px-6 py-4 font-semibold text-gray-700">
                                Scanner
                            </th>

                            <th className="px-6 py-4 font-semibold text-gray-700">
                                Status
                            </th>

                            <th className="px-6 py-4 font-semibold text-gray-700">
                                Findings
                            </th>

                            <th className="px-6 py-4 font-semibold text-gray-700">
                                Source
                            </th>

                            <th className="px-6 py-4 font-semibold text-gray-700">
                                Action
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {scanRuns.map((scan) => (
                            <tr
                                key={scan.id}
                                className="hover:bg-gray-50"
                            >
                                <td className="px-6 py-4">
                                    <span className="font-semibold text-gray-900">
                                        #{scan.id}
                                    </span>
                                </td>

                                <td className="px-6 py-4 text-gray-700">
                                    #{scan.assetId}
                                </td>

                                <td className="px-6 py-4 text-gray-700">
                                    {scan.scanner}
                                </td>

                                <td className="px-6 py-4">
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
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
                                </td>

                                <td className="px-6 py-4">
                                    <span className="font-medium text-gray-900">
                                        {scan.findings?.length ?? 0}
                                    </span>
                                </td>

                                <td className="max-w-xs px-6 py-4">
                                    <p
                                        className="truncate text-gray-600"
                                        title={scan.source}
                                    >
                                        {scan.source}
                                    </p>
                                </td>

                                <td className="px-6 py-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.push(
                                                `/scans/${scan.id}`
                                            )
                                        }
                                        className="cursor-pointer font-medium text-blue-600 transition hover:text-blue-800 hover:underline"
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {scanRuns.length === 0 && (
                    <div className="py-12 text-center">
                        <p className="text-sm text-gray-500">
                            No scan records found.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}