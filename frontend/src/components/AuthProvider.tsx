"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

type User = {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
};

type LoginResponse = {
    token: string;
    expiresAt: string;
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
};

type AuthContextType = {
    user: User | null;
    token: string | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (data: LoginResponse) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }

        setIsLoading(false);
    }, []);

    const login = (data: LoginResponse) => {
        console.log("AuthProvider login çalıştı:", data);

        const userData: User = {
            userId: data.userId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            roles: data.roles,
        };

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("expiresAt", data.expiresAt);

        setToken(data.token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("expiresAt");

        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoggedIn: !!token,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}