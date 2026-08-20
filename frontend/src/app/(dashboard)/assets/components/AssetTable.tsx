"use client";

import { useRouter } from "next/navigation";
import { Asset } from "../types";

type AssetTableProps = {
    assets: Asset[];
    search: string;
    onSearchChange: (value: string) => void;
    onAdd: () => void;
    onEdit: (asset: Asset) => void;
    onDelete: (asset: Asset) => void;
};

export default function AssetTable({
    assets,
    search,
    onSearchChange,
    onAdd,
    onEdit,
    onDelete,
}: AssetTableProps) {
    const router = useRouter();

    const filteredAssets = assets.filter((asset) => {
        const searchValue = search.toLowerCase();

        return (
            asset.name.toLowerCase().includes(searchValue) ||
            asset.type.toLowerCase().includes(searchValue) ||
            asset.url.toLowerCase().includes(searchValue) ||
            asset.description.toLowerCase().includes(searchValue)
        );
    });

    const handleDetails = (asset: Asset) => {
        router.push(`/assets/${asset.id}`);
    };

    return (
        <>
            <div className="mb-6 flex items-center justify-between gap-4">
                <input
                    type="text"
                    placeholder="Search assets..."
                    value={search}
                    onChange={(e) =>
                        onSearchChange(e.target.value)
                    }
                    className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
                />

                <button
                    type="button"
                    onClick={onAdd}
                    className="whitespace-nowrap rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                    + Add Asset
                </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                                    Name
                                </th>

                                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                                    Type
                                </th>

                                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                                    URL
                                </th>

                                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                                    Status
                                </th>

                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {filteredAssets.map((asset) => (
                                <tr
                                    key={asset.id}
                                    className="transition hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">
                                            {asset.name}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                                            {asset.type}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <a
                                            href={asset.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block max-w-xs truncate text-sm text-gray-600 hover:text-gray-900 hover:underline"
                                            title={asset.url}
                                        >
                                            {asset.url}
                                        </a>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                asset.isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            {asset.isActive
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDetails(asset)
                                                }
                                                className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-gray-800 underline decoration-gray-300 underline-offset-4 transition hover:bg-gray-100 hover:text-gray-950 hover:decoration-gray-700"
                                            >
                                                View Details
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onEdit(asset)
                                                }
                                                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onDelete(asset)
                                                }
                                                className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredAssets.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-10 text-center text-sm text-gray-500"
                                    >
                                        No assets found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4 text-sm text-gray-500">
                Showing {filteredAssets.length} of{" "}
                {assets.length} assets
            </div>
        </>
    );
}