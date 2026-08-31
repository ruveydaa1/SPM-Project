"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";

import {
    Asset,
    ScanResult,
    Finding,
    ScanRun,
} from "./types";

import AssetTable from "./components/AssetTable";
import AssetFormModal from "./components/AssetFormModal";
import DeleteAssetModal from "./components/DeleteAssetModal";

export default function AssetsPage() {
    const { user } = useAuth();

    const [assets, setAssets] = useState<Asset[]>([]);
    const [search, setSearch] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] =
        useState<Asset | null>(null);
    const [deletingAsset, setDeletingAsset] =
        useState<Asset | null>(null);
    const [selectedAsset, setSelectedAsset] =
        useState<Asset | null>(null);

    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [url, setUrl] = useState("");
    const [description, setDescription] = useState("");
    const [isActive, setIsActive] = useState(true);

    const [selectedScanner, setSelectedScanner] =
        useState("Semgrep");

    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] =
        useState<ScanResult | null>(null);
    const [scanError, setScanError] = useState("");

    const fetchAssets = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                return;
            }

            const response = await fetch(
                "http://localhost:5245/api/assets",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const errorData =
                    await response.json().catch(() => null);

                console.error(
                    "Assets alınamadı:",
                    errorData
                );

                return;
            }

            const data = await response.json();

            setAssets(data);
        } catch (error) {
            console.error(
                "Assets bağlantı hatası:",
                error
            );
        }
    };

    useEffect(() => {
        if (user && user.roles?.[0] !== "User") {
            fetchAssets();
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

    const handleSaveAsset = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                return;
            }

            if (editingAsset) {
                const response = await fetch(
                    `http://localhost:5245/api/assets/${editingAsset.id}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type":
                                "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            name,
                            type,
                            url,
                            description,
                            isActive,
                        }),
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    console.error(
                        "Asset güncellenemedi:",
                        data
                    );

                    return;
                }

                await fetchAssets();
                closeAssetModal();

                return;
            }

            const response = await fetch(
                "http://localhost:5245/api/assets",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name,
                        type,
                        url,
                        description,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error(
                    "Asset oluşturulamadı:",
                    data
                );

                return;
            }

            await fetchAssets();
            closeAssetModal();
        } catch (error) {
            console.error(
                "Asset işlemi sırasında hata:",
                error
            );
        }
    };

    const handleEditAsset = (asset: Asset) => {
        setEditingAsset(asset);

        setName(asset.name);
        setType(asset.type);
        setUrl(asset.url);
        setDescription(asset.description);
        setIsActive(asset.isActive);

        setIsModalOpen(true);
    };

    const handleDeleteAsset = async () => {
        if (!deletingAsset) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                return;
            }

            const response = await fetch(
                `http://localhost:5245/api/assets/${deletingAsset.id}`,
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
                    "Asset silinemedi:",
                    data
                );

                return;
            }

            await fetchAssets();
            setDeletingAsset(null);
        } catch (error) {
            console.error(
                "Asset silme hatası:",
                error
            );
        }
    };

    const closeAssetModal = () => {
        setIsModalOpen(false);
        setEditingAsset(null);

        setName("");
        setType("");
        setUrl("");
        setDescription("");
        setIsActive(true);
    };

    const openAddModal = () => {
        setEditingAsset(null);

        setName("");
        setType("");
        setUrl("");
        setDescription("");
        setIsActive(true);

        setIsModalOpen(true);
    };

    const openDetailsModal = (asset: Asset) => {
        setSelectedAsset(asset);
        setSelectedScanner("Semgrep");

        setScanResult(null);
        setScanError("");
        setIsScanning(false);
    };

    const closeDetailsModal = () => {
        setSelectedAsset(null);
        setScanResult(null);
        setScanError("");
        setIsScanning(false);
    };

    const fetchScanRuns = async (
        assetId: number
    ): Promise<ScanRun[] | null> => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                return null;
            }

            const response = await fetch(
                `http://localhost:5245/api/assets/${assetId}/scan-runs`,
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

            const scanRuns: ScanRun[] =
                await response.json();

            return scanRuns;
        } catch (error) {
            console.error(
                "Scan geçmişi alınırken hata:",
                error
            );

            return null;
        }
    };

    const fetchFindings = async (
        assetId: number
    ): Promise<Finding[] | null> => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                return null;
            }

            const response = await fetch(
                `http://localhost:5245/api/findings/asset/${assetId}`,
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

            const findings: Finding[] =
                await response.json();

            return findings;
        } catch (error) {
            console.error(
                "Findings alınırken hata:",
                error
            );

            return null;
        }
    };

    const handleScan = async () => {
        if (!selectedAsset) {
            return;
        }

        if (!selectedAsset.url?.trim()) {
            setScanError(
                "This asset does not have a repository URL configured."
            );

            return;
        }

        try {
            setIsScanning(true);
            setScanResult(null);
            setScanError("");

            const token = localStorage.getItem("token");

            if (!token) {
                setScanError(
                    "Authentication token not found."
                );

                return;
            }

            const response = await fetch(
                `http://localhost:5245/api/assets/${selectedAsset.id}/scan`,
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

            const scanRunId = data.scanRunId;

            if (!scanRunId) {
                setScanError(
                    "Scan started, but no scan run ID was returned."
                );

                return;
            }

            const timeout = 10 * 60 * 1000;
            const startTime = Date.now();
            const delay = 1000;

            let completedScan: ScanRun | null = null;

            while (Date.now() - startTime < timeout) {
                const scanRuns =
                    await fetchScanRuns(
                        selectedAsset.id
                    );

                if (scanRuns !== null) {
                    const currentScan =
                        scanRuns.find(
                            (scan) =>
                                scan.id === scanRunId
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
                    "Scan did not complete within 10 minutes."
                );
            }

            const findings =
                await fetchFindings(
                    selectedAsset.id
                );

            if (findings === null) {
                throw new Error(
                    "Scan completed, but findings could not be retrieved."
                );
            }

            const scanFindings =
                findings.filter(
                    (finding) =>
                        finding.scanRunId ===
                        scanRunId
                );

            setScanResult({
                success: true,
                scanner:
                    completedScan.scanner ||
                    selectedScanner,
                source:
                    completedScan.source ||
                    selectedAsset.url,
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

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Assets
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                    Manage assets in the application.
                </p>
            </div>

            <AssetTable
                assets={assets}
                search={search}
                onSearchChange={setSearch}
                onAdd={openAddModal}
                onEdit={handleEditAsset}
                onDelete={setDeletingAsset}
            />

            <AssetFormModal
                isOpen={isModalOpen}
                editingAsset={editingAsset}
                name={name}
                type={type}
                url={url}
                description={description}
                isActive={isActive}
                onNameChange={setName}
                onTypeChange={setType}
                onUrlChange={setUrl}
                onDescriptionChange={
                    setDescription
                }
                onIsActiveChange={
                    setIsActive
                }
                onSubmit={handleSaveAsset}
                onClose={closeAssetModal}
            />

            <DeleteAssetModal
                asset={deletingAsset}
                onCancel={() =>
                    setDeletingAsset(null)
                }
                onConfirm={handleDeleteAsset}
            />
        </div>
    );
}