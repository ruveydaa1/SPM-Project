"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useScanProgress } from "@/hooks/useScanProgress";

import {
    Asset,
    Finding,
    ScanRun,
    ScanResult,
} from "../types";

export default function AssetDetailsPage() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();

    const assetId = Number(params.id);

    const [asset, setAsset] = useState<Asset | null>(null);

    const [selectedScanner, setSelectedScanner] =
        useState("Semgrep");

    const [isLoading, setIsLoading] = useState(true);
    const [isScanning, setIsScanning] = useState(false);

    const [scanRunId, setScanRunId] =
        useState<number | null>(null);

    const [scanResult, setScanResult] =
        useState<ScanResult | null>(null);

    const [scanError, setScanError] = useState("");

    const scanProgress =
        useScanProgress(assetId, scanRunId);

    const fetchAsset = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                return;
            }

            const response = await fetch(
                `http://localhost:5245/api/assets/${assetId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                }
            );

            if (!response.ok) {
                console.error(
                    "Asset alınamadı:",
                    response.status
                );

                return;
            }

            const data: Asset = await response.json();

            setAsset(data);
        } catch (error) {
            console.error(
                "Asset alınırken hata:",
                error
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.roles?.[0] !== "User") {
            fetchAsset();
        }
    }, [user, assetId]);

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

    const fetchScanRuns = async (
        id: number
    ): Promise<ScanRun[] | null> => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                return null;
            }

            const response = await fetch(
                `http://localhost:5245/api/assets/${id}/scan-runs`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                }
            );

            if (!response.ok) {
                console.error(
                    "Scan geçmişi alınamadı:",
                    response.status
                );

                return null;
            }

            return await response.json();
        } catch (error) {
            console.error(
                "Scan geçmişi alınırken hata:",
                error
            );

            return null;
        }
    };

    const fetchFindings = async (
        id: number
    ): Promise<Finding[] | null> => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                return null;
            }

            const response = await fetch(
                `http://localhost:5245/api/findings/asset/${id}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                }
            );

            if (!response.ok) {
                console.error(
                    "Findings alınamadı:",
                    response.status
                );

                return null;
            }

            return await response.json();
        } catch (error) {
            console.error(
                "Findings alınırken hata:",
                error
            );

            return null;
        }
    };

    const handleScan = async () => {
        if (!asset) {
            return;
        }

        try {
            setIsScanning(true);
            setScanResult(null);
            setScanError("");
            setScanRunId(null);

            const token = localStorage.getItem("token");

            if (!token) {
                setScanError(
                    "Authentication token not found."
                );

                return;
            }

            const response = await fetch(
                `http://localhost:5245/api/assets/${asset.id}/scan`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        scanner: selectedScanner,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setScanError(
                    data?.error ||
                    data?.message ||
                    "Scan could not be completed."
                );

                return;
            }

            const newScanRunId = data.scanRunId;

            if (!newScanRunId) {
                setScanError(
                    "Scan started, but no scan run ID was returned."
                );

                return;
            }

            setScanRunId(newScanRunId);

            const maxAttempts = 60;
            const delay = 1000;

            let completedScan: ScanRun | null = null;

            for (
                let attempt = 0;
                attempt < maxAttempts;
                attempt++
            ) {
                const scanRuns =
                    await fetchScanRuns(asset.id);

                if (scanRuns !== null) {
                    const currentScan =
                        scanRuns.find(
                            (scan) =>
                                scan.id === newScanRunId
                        );

                    if (currentScan) {
                        const status =
                            currentScan.status.toLowerCase();

                        if (status === "completed") {
                            completedScan =
                                currentScan;

                            break;
                        }

                        if (status === "failed") {
                            setScanError(
                                currentScan.error ||
                                "Scan failed."
                            );

                            return;
                        }
                    }
                }

                await new Promise(
                    (resolve) =>
                        setTimeout(
                            resolve,
                            delay
                        )
                );
            }

            if (!completedScan) {
                throw new Error(
                    "Scan did not complete within the expected time."
                );
            }

            const findings =
                await fetchFindings(asset.id);

            if (findings === null) {
                throw new Error(
                    "Scan completed, but findings could not be retrieved."
                );
            }

            const scanFindings =
                findings.filter(
                    (finding) =>
                        finding.scanRunId ===
                        newScanRunId
                );

            setScanResult({
                success: true,
                scanner:
                    completedScan.scanner ||
                    selectedScanner,
                source:
                    completedScan.source ||
                    asset.url,
                scanTime:
                    completedScan.completedAt ||
                    completedScan.startedAt,
                findings: scanFindings,
                error: "",
            });
        } catch (error) {
            console.error(
                "Scan error:",
                error
            );

            setScanError(
                error instanceof Error
                    ? error.message
                    : "Scan service could not be reached. Please make sure the backend is running."
            );
        } finally {
            setIsScanning(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-8">
                <p className="text-sm text-gray-500">
                    Loading asset...
                </p>
            </div>
        );
    }

    if (!asset) {
        return (
            <div className="p-8">
                <button
                    type="button"
                    onClick={() => router.push("/assets")}
                    className="mb-6 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                    ← Back to Assets
                </button>

                <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                    <h1 className="text-xl font-semibold text-gray-900">
                        Asset Not Found
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        The requested asset could not be found.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-6">
                <button
                    type="button"
                    onClick={() => router.push("/assets")}
                    className="mb-5 text-sm font-medium text-gray-500 transition hover:text-gray-900"
                >
                    ← Back to Assets
                </button>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-gray-900">
                                {asset.name}
                            </h1>

                            <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                    asset.isActive
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-600"
                                }`}
                            >
                                {asset.isActive
                                    ? "Active"
                                    : "Inactive"}
                            </span>
                        </div>

                        <p className="mt-2 text-sm text-gray-500">
                            Asset information and security scanning
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-5">
                            <h2 className="text-sm font-semibold text-gray-900">
                                Asset Information
                            </h2>
                        </div>

                        <div className="space-y-4 px-6 py-5">
                            <div>
                                <p className="text-xs font-medium text-gray-400">
                                    Type
                                </p>

                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    {asset.type}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-gray-400">
                                    Created
                                </p>

                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    {new Date(
                                        asset.createdAt
                                    ).toLocaleDateString()}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-gray-400">
                                    URL
                                </p>

                                <a
                                    href={asset.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-1 block break-all text-sm font-medium text-gray-700 hover:text-gray-950 hover:underline"
                                >
                                    {asset.url}
                                </a>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-gray-400">
                                    Description
                                </p>

                                <p className="mt-1 text-sm leading-6 text-gray-600">
                                    {asset.description ||
                                        "No description provided."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-5">
                            <h2 className="text-sm font-semibold text-gray-900">
                                Security Scan
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Select a scanner to analyze this asset for security vulnerabilities.
                            </p>
                        </div>

                        <div className="px-6 py-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                                <div className="flex-1">
                                    <label
                                        htmlFor="scanner"
                                        className="mb-2 block text-xs font-medium text-gray-600"
                                    >
                                        Scanner
                                    </label>

                                    <select
                                        id="scanner"
                                        value={selectedScanner}
                                        onChange={(e) =>
                                            setSelectedScanner(
                                                e.target.value
                                            )
                                        }
                                        disabled={isScanning}
                                        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100 disabled:bg-gray-100"
                                    >
                                        <option value="Semgrep">
                                            Semgrep
                                        </option>
                                    </select>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleScan}
                                    disabled={isScanning}
                                    className="h-11 rounded-lg bg-gray-900 px-6 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                                >
                                    {isScanning
                                        ? "Scanning..."
                                        : "Scan Asset"}
                                </button>
                            </div>

                            {isScanning && (
                                <div className="mt-5 overflow-hidden rounded-xl border border-blue-200 bg-blue-50">
                                    <div className="border-b border-blue-200 px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="animate-spin text-sm">
                                                🔄
                                            </span>

                                            <p className="text-sm font-semibold text-blue-800">
                                                Scan in progress
                                            </p>
                                        </div>

                                        <p className="mt-1 text-xs text-blue-600">
                                            {selectedScanner} is currently analyzing the asset repository.
                                        </p>
                                    </div>

                                    <div className="bg-white px-4 py-3">
                                        {scanProgress.length === 0 ? (
                                            <div className="flex items-center gap-2 py-2">
                                                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />

                                                <p className="text-xs text-gray-500">
                                                    Waiting for scan progress...
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {scanProgress
                                                    .filter(
                                                        (progress) =>
                                                            progress.scanRunId ===
                                                            scanRunId
                                                    )
                                                    .map(
                                                        (
                                                            progress,
                                                            index
                                                        ) => (
                                                            <div
                                                                key={`${progress.timestamp}-${index}`}
                                                                className="flex items-start gap-3"
                                                            >
                                                                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />

                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
                                                                        <span className="font-mono text-xs text-gray-400">
                                                                            {new Date(
                                                                                progress.timestamp
                                                                            ).toLocaleTimeString(
                                                                                "en-GB"
                                                                            )}
                                                                        </span>

                                                                        <span className="text-sm font-medium text-gray-800">
                                                                            {
                                                                                progress.message
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {scanError && !isScanning && (
                                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                    <p className="text-xs font-semibold text-red-700">
                                        Scan Failed
                                    </p>

                                    <p className="mt-1 text-sm leading-5 text-red-600">
                                        {scanError}
                                    </p>
                                </div>
                            )}

                            {scanResult && !isScanning && (
                                <div className="mt-6">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-gray-900">
                                            Latest Scan Results
                                        </h3>

                                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                            ✓ Scan Completed
                                        </span>
                                    </div>

                                    {scanProgress.length > 0 && (
                                        <div className="mb-5 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                                            <div className="border-b border-gray-200 px-5 py-3">
                                                <p className="text-xs font-semibold text-gray-700">
                                                    Scan Process
                                                </p>
                                            </div>

                                            <div className="px-5 py-4">
                                                <div className="space-y-3">
                                                    {scanProgress
                                                        .filter(
                                                            (progress) =>
                                                                progress.scanRunId ===
                                                                scanRunId
                                                        )
                                                        .map(
                                                            (
                                                                progress,
                                                                index
                                                            ) => (
                                                                <div
                                                                    key={`${progress.timestamp}-${index}`}
                                                                    className="flex items-start gap-3"
                                                                >
                                                                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green-500" />

                                                                    <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
                                                                        <span className="font-mono text-xs text-gray-400">
                                                                            {new Date(
                                                                                progress.timestamp
                                                                            ).toLocaleTimeString(
                                                                                "en-GB"
                                                                            )}
                                                                        </span>

                                                                        <span className="text-sm text-gray-700">
                                                                            {
                                                                                progress.message
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="rounded-xl border border-gray-200">
                                        <div className="border-b border-gray-200 px-5 py-5">
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                                <div>
                                                    <p className="text-xs font-medium text-gray-400">
                                                        Scanner
                                                    </p>

                                                    <p className="mt-1 text-sm font-medium text-gray-900">
                                                        {scanResult.scanner}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-medium text-gray-400">
                                                        Scan Time
                                                    </p>

                                                    <p className="mt-1 text-sm font-medium text-gray-900">
                                                        {scanResult.scanTime
                                                            ? new Date(
                                                                scanResult.scanTime
                                                            ).toLocaleString(
                                                                "en-GB",
                                                                {
                                                                    day: "2-digit",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                }
                                                            )
                                                            : "-"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-medium text-gray-400">
                                                        Findings
                                                    </p>

                                                    <p className="mt-1 text-lg font-semibold text-gray-900">
                                                        {
                                                            scanResult
                                                                .findings
                                                                .length
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <p className="text-xs font-medium text-gray-400">
                                                    Source
                                                </p>

                                                <p
                                                    className="mt-1 break-all text-sm text-gray-600"
                                                    title={scanResult.source}
                                                >
                                                    {scanResult.source}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="px-5 py-5">
                                            {scanResult.findings.length === 0 ? (
                                                <div className="rounded-lg bg-gray-50 px-4 py-5 text-center">
                                                    <p className="text-sm font-medium text-gray-700">
                                                        No security findings were detected.
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        The selected scanner did not identify any security vulnerabilities.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {scanResult.findings.map(
                                                        (
                                                            finding,
                                                            index
                                                        ) => (
                                                            <div
                                                                key={
                                                                    finding.id
                                                                }
                                                                className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                                                            >
                                                                <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
                                                                    <div className="min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-xs font-medium text-gray-400">
                                                                                #
                                                                                {index +
                                                                                    1}
                                                                            </span>

                                                                            <h4 className="text-sm font-semibold text-gray-900">
                                                                                {finding.vulnerabilityClass ||
                                                                                    "Security Finding"}
                                                                            </h4>
                                                                        </div>

                                                                        <p className="mt-2 text-sm leading-6 text-gray-700">
                                                                            {
                                                                                finding.message
                                                                            }
                                                                        </p>
                                                                    </div>

                                                                    <span className="shrink-0 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                                                                        {finding.severity ||
                                                                            "Unknown"}
                                                                    </span>
                                                                </div>

                                                                <div className="px-5 py-4">
                                                                    {finding.path && (
                                                                        <div className="mb-4 rounded-lg bg-gray-50 px-4 py-3">
                                                                            <p className="text-xs font-medium text-gray-400">
                                                                                Location
                                                                            </p>

                                                                            <p className="mt-1 break-all font-mono text-xs text-gray-700">
                                                                                {
                                                                                    finding.path
                                                                                }
                                                                                {finding.startLine
                                                                                    ? `:${finding.startLine}`
                                                                                    : ""}
                                                                                {finding.startColumn
                                                                                    ? `:${finding.startColumn}`
                                                                                    : ""}
                                                                            </p>
                                                                        </div>
                                                                    )}

                                                                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                                                                        {finding.checkId && (
                                                                            <div>
                                                                                <p className="text-xs font-medium text-gray-400">
                                                                                    Check ID
                                                                                </p>

                                                                                <p className="mt-1 break-all font-mono text-xs text-gray-700">
                                                                                    {
                                                                                        finding.checkId
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        )}

                                                                        {finding.confidence && (
                                                                            <div>
                                                                                <p className="text-xs font-medium text-gray-400">
                                                                                    Confidence
                                                                                </p>

                                                                                <p className="mt-1 text-sm font-medium text-gray-700">
                                                                                    {
                                                                                        finding.confidence
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        )}

                                                                        {finding.cwe && (
                                                                            <div>
                                                                                <p className="text-xs font-medium text-gray-400">
                                                                                    CWE
                                                                                </p>

                                                                                <p className="mt-1 text-sm text-gray-700">
                                                                                    {
                                                                                        finding.cwe
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        )}

                                                                        {finding.owasp && (
                                                                            <div>
                                                                                <p className="text-xs font-medium text-gray-400">
                                                                                    OWASP
                                                                                </p>

                                                                                <p className="mt-1 text-sm leading-5 text-gray-700">
                                                                                    {
                                                                                        finding.owasp
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {finding.reference && (
                                                                        <div className="mt-5 border-t border-gray-100 pt-4">
                                                                            <a
                                                                                href={
                                                                                    finding.reference
                                                                                }
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="inline-flex items-center text-xs font-medium text-gray-500 transition hover:text-gray-900 hover:underline"
                                                                            >
                                                                                View Reference
                                                                                <span className="ml-1">
                                                                                    →
                                                                                </span>
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}