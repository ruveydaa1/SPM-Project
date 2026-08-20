"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) {
    return null;
  }

  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white transition hover:bg-gray-800"
      >
        {initials}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
          <div className="border-b border-gray-100 px-3 py-2">
            <p className="text-sm font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </p>

            <p className="text-xs text-gray-500">
              {user.email}
            </p>
          </div>

          <a
            href="/profile"
            className="mt-1 block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Profile
          </a>

          <button
            onClick={handleLogout}
            className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}