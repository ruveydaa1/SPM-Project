"use client";

import { Asset } from "../types";

type AssetFormModalProps = {
    isOpen: boolean;
    editingAsset: Asset | null;

    name: string;
    type: string;
    url: string;
    description: string;
    isActive: boolean;

    onNameChange: (value: string) => void;
    onTypeChange: (value: string) => void;
    onUrlChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onIsActiveChange: (value: boolean) => void;

    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
};

export default function AssetFormModal({
    isOpen,
    editingAsset,
    name,
    type,
    url,
    description,
    isActive,
    onNameChange,
    onTypeChange,
    onUrlChange,
    onDescriptionChange,
    onIsActiveChange,
    onSubmit,
    onClose,
}: AssetFormModalProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
                <div className="border-b border-gray-200 px-7 py-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {editingAsset
                                    ? "Edit Asset"
                                    : "Add New Asset"}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {editingAsset
                                    ? "Update the asset information below."
                                    : "Add a new asset to the application."}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg px-3 py-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="space-y-4 px-7 py-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="asset-name"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Name
                                </label>

                                <input
                                    id="asset-name"
                                    type="text"
                                    value={name}
                                    onChange={(e) =>
                                        onNameChange(e.target.value)
                                    }
                                    placeholder="e.g. Production API"
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="asset-type"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Type
                                </label>

                                <input
                                    id="asset-type"
                                    type="text"
                                    value={type}
                                    onChange={(e) =>
                                        onTypeChange(e.target.value)
                                    }
                                    placeholder="e.g. API, Website, Server"
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label
                                    htmlFor="asset-url"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    URL
                                </label>

                                {url && (
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-medium text-gray-500 hover:text-gray-900 hover:underline"
                                    >
                                        Open URL ↗
                                    </a>
                                )}
                            </div>

                            <input
                                id="asset-url"
                                type="url"
                                value={url}
                                onChange={(e) =>
                                    onUrlChange(e.target.value)
                                }
                                placeholder="https://github.com/example/repository"
                                required
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
                            />

                            <p className="mt-1.5 text-xs text-gray-400">
                                The repository URL that will be used for security scanning.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="asset-description"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Description
                            </label>

                            <textarea
                                id="asset-description"
                                value={description}
                                onChange={(e) =>
                                    onDescriptionChange(e.target.value)
                                }
                                rows={3}
                                placeholder="Describe what this asset is used for..."
                                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
                            />
                        </div>

                        {editingAsset && (
                            <div>
                                <label
                                    htmlFor="asset-status"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Status
                                </label>

                                <select
                                    id="asset-status"
                                    value={
                                        isActive ? "active" : "inactive"
                                    }
                                    onChange={(e) =>
                                        onIsActiveChange(
                                            e.target.value === "active"
                                        )
                                    }
                                    className="h-[46px] w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
                                >
                                    <option value="active">
                                        Active
                                    </option>

                                    <option value="inactive">
                                        Inactive
                                    </option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-7 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                        >
                            {editingAsset
                                ? "Save Changes"
                                : "Create Asset"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}