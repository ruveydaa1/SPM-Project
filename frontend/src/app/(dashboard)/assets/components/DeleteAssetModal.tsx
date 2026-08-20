"use client";

import { Asset } from "../types";

type DeleteAssetModalProps = {
    asset: Asset | null;
    onCancel: () => void;
    onConfirm: () => void;
};

export default function DeleteAssetModal({
    asset,
    onCancel,
    onConfirm,
}: DeleteAssetModalProps) {
    if (!asset) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                        !
                    </div>

                    <h2 className="text-xl font-semibold text-gray-900">
                        Delete Asset?
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        Are you sure you want to delete{" "}
                        <span className="font-medium text-gray-700">
                            {asset.name}
                        </span>
                        ? This action cannot be undone.
                    </p>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        className="rounded-lg bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                        Delete Asset
                    </button>
                </div>
            </div>
        </div>
    );
}