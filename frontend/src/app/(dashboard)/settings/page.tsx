"use client";

import { useState } from "react";

export default function SettingsPage() {
    const [theme, setTheme] = useState("light");
    const [language, setLanguage] = useState("english");

    return (
        <div className="p-8">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Settings
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                    Manage your application preferences.
                </p>
            </div>

            <div className="w-full space-y-6">

                {/* Appearance */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Appearance
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Choose how the application looks.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                        {/* Light */}
                        <button
                            type="button"
                            onClick={() => setTheme("light")}
                            className={`rounded-xl border p-5 text-left transition ${theme === "light"
                                    ? "border-gray-900 bg-gray-50 ring-2 ring-gray-900"
                                    : "border-gray-200 hover:border-gray-400"
                                }`}
                        >
                            <div className="mb-4 flex h-24 items-center justify-center rounded-lg border border-gray-200 bg-white">
                                <div className="h-10 w-16 rounded border border-gray-300 bg-gray-50" />
                            </div>

                            <h3 className="font-medium text-gray-900">
                                Light
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Use the light appearance.
                            </p>
                        </button>

                        {/* Dark */}
                        <button
                            type="button"
                            onClick={() => setTheme("dark")}
                            className={`rounded-xl border p-5 text-left transition ${theme === "dark"
                                    ? "border-gray-900 bg-gray-50 ring-2 ring-gray-900"
                                    : "border-gray-200 hover:border-gray-400"
                                }`}
                        >
                            <div className="mb-4 flex h-24 items-center justify-center rounded-lg border border-gray-700 bg-gray-900">
                                <div className="h-10 w-16 rounded border border-gray-600 bg-gray-800" />
                            </div>

                            <h3 className="font-medium text-gray-900">
                                Dark
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Use the dark appearance.
                            </p>
                        </button>

                    </div>
                </div>

                {/* Language */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Language
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Choose your preferred language.
                        </p>
                    </div>

                    <div className="space-y-3">

                        {/* English */}
                        <button
                            type="button"
                            onClick={() => setLanguage("english")}
                            className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition ${language === "english"
                                    ? "border-gray-900 bg-gray-50"
                                    : "border-gray-200 hover:border-gray-400"
                                }`}
                        >
                            <div>
                                <p className="font-medium text-gray-900">
                                    English
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    Use English throughout the application.
                                </p>
                            </div>

                            <div
                                className={`flex h-5 w-5 items-center justify-center rounded-full border ${language === "english"
                                        ? "border-gray-900"
                                        : "border-gray-300"
                                    }`}
                            >
                                {language === "english" && (
                                    <div className="h-2.5 w-2.5 rounded-full bg-gray-900" />
                                )}
                            </div>
                        </button>

                        {/* Turkish */}
                        <button
                            type="button"
                            onClick={() => setLanguage("turkish")}
                            className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition ${language === "turkish"
                                    ? "border-gray-900 bg-gray-50"
                                    : "border-gray-200 hover:border-gray-400"
                                }`}
                        >
                            <div>
                                <p className="font-medium text-gray-900">
                                    Türkçe
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    Uygulamanın Türkçe kullanılmasını sağlar.
                                </p>
                            </div>

                            <div
                                className={`flex h-5 w-5 items-center justify-center rounded-full border ${language === "turkish"
                                        ? "border-gray-900"
                                        : "border-gray-300"
                                    }`}
                            >
                                {language === "turkish" && (
                                    <div className="h-2.5 w-2.5 rounded-full bg-gray-900" />
                                )}
                            </div>
                        </button>

                    </div>
                </div>

            </div>
        </div>
    );
}