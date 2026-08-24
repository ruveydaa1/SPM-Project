"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";

import { ScanRun } from "./types";
import ScanTable from "./components/ScanTable";

export default function ScansPage() {
    const { user } = useAuth();

    const [scanRuns, setScanRuns] = useState<ScanRun[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchScanRuns = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                setError("Authentication token not found.");
                return;
            }

            const response = await fetch(
                "http://localhost:5245/api/scan-runs",
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
                        "Scan kayıtları alınamadı."
                );

                return;
            }

            setScanRuns(data);
        } catch (error) {
            console.error(
                "Scan kayıtları alınırken hata:",
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
        if (user && user.roles?.[0] !== "User") {
            fetchScanRuns();
        }
    }, [user]);

    // User rolü Scans sayfasına erişemez
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
                    Scans
                </h1>

                <p className="mt-4 text-sm text-gray-500">
                    Loading scan records...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Scans
                </h1>

                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-600">
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Scans
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                    View scan history and vulnerability findings.
                </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">
                    Total scans:{" "}
                    <span className="font-semibold text-gray-900">
                        {scanRuns.length}
                    </span>
                </p>

                <div className="mt-6">
                    <ScanTable scanRuns={scanRuns} />
                </div>
            </div>
        </div>
    );
}