"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/services/auth";
import useApiMethods from "@/hooks/useApiMethods";

export default function ProtectedRoute({ children }) {
    const router = useRouter();
    const [checking, setChecking] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const { getMethod } = useApiMethods();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const auth = await isAuthenticated();
                if (!auth) {
                    router.replace("/login");
                } else {
                    const response = await getMethod('/auth/verify-client/', {}, true);
                    if (response.is_client) {
                        router.replace("/login");
                        return;
                    }
                    setIsAuthorized(true);
                    setChecking(false);
                }
            } catch (error) {
                console.error('Authentication check failed:', error);
                router.replace("/login");
            }
        };
        checkAuth();
    }, [router]);

    if (checking) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-blue-600 border-t-transparent"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null; // Component will redirect to login
    }

    return children;
}