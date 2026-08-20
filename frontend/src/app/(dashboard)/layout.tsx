"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ProfileMenu from "@/components/ProfileMenu";
import { useAuth } from "@/components/AuthProvider";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const router = useRouter();
    const { isLoggedIn, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            router.replace("/login");
        }
    }, [isLoading, isLoggedIn, router]);

    if (isLoading || !isLoggedIn) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">

            <Sidebar
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
            />

            <main
                className={`min-h-screen transition-all duration-300 ${
                    isSidebarCollapsed ? "ml-20" : "ml-64"
                }`}
            >
                <header className="flex h-20 items-center justify-end bg-white px-8 shadow-sm">
                    <ProfileMenu />
                </header>

                {children}
            </main>

        </div>
    );
}