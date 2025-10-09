
import { isAuthenticated, removeAuthToken } from "@/services/auth";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useMemo } from "react";

const useApiMethods = () => {
    const navigate = useRouter();
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || "development";

    const hostname = useMemo(() => {
        if (typeof window !== "undefined") {
            return window.location.hostname.split('.')[0];
        }
        return "";
    }, []);

    const handleSessionExpiry = () => {
        removeAuthToken();
        setTimeout(() => {
            navigate.push("/login");
        }, 2500);
    };

    const getMethod = async (endpoint, params = {}, withHeaders = true) => {
        try {
            let config = {};

            if (withHeaders) {
                let token = await isAuthenticated();
                if (!token) {
                    handleSessionExpiry();
                    return;
                }
                config = {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                };
            }

            const response = await axios.get(`${environment === "development" ? "http" : "https"}://${hostname}.${apiUrl}${endpoint}`, {
                params,
                ...config,
            });
            return response.data;
        } catch (error) {
            console.error("GET request failed:", error);
            throw error;
        }
    };

    const postMethod = async (endpoint, data = {}, withHeaders = true, isFile = false, isResponseFile = false) => {
        try {
            let config = {
                isResponseFile: isFile ? 'blob' : 'json' 
            };

            if (withHeaders) {
                let token = await isAuthenticated();
                if (!token) {
                    handleSessionExpiry();
                    return;
                }
                config.headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': isFile ? 'multipart/form-data' : 'application/json'
                }
            }

            const response = await axios.post(`${environment === "development" ? "http" : "https"}://${hostname}.${apiUrl}${endpoint}`, data, config);
            return isResponseFile ? response : response.data;
        } catch (error) {
            console.error("POST request failed:", error);
            throw error;
        }
    };

    const putMethod = async (endpoint, data = {}, withHeaders = true) => {
        try {
            let config = {};

            if (withHeaders) {
                let token = await isAuthenticated();
                if (!token) {
                    handleSessionExpiry();
                    return;
                }
                config = {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                };
            }

            const response = await axios.put(`${environment === "development" ? "http" : "https"}://${hostname}.${apiUrl}${endpoint}`, data, config);
            return response.data;
        } catch (error) {
            console.error("PUT request failed:", error);
            throw error;
        }
    };

    const patchMethod = async (endpoint, data = {}, withHeaders = true) => {
        try {
            let config = {};

            if (withHeaders) {
                let token = await isAuthenticated();
                if (!token) {
                    handleSessionExpiry();
                    return;
                }
                config = {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                };
            }

            const response = await axios.patch(`${environment === "development" ? "http" : "https"}://${hostname}.${apiUrl}${endpoint}`, data, config);
            return response.data;
        } catch (error) {
            console.error("PATCH request failed:", error);
            throw error;
        }
    };

    const deleteMethod = async (endpoint, withHeaders = true) => {
        try {
            let config = {};

            if (withHeaders) {
                let token = await isAuthenticated();
                if (!token) {
                    handleSessionExpiry();
                    return;
                }
                config = {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                };
            }

            const response = await axios.delete(`${environment === "development" ? "http" : "https"}://${hostname}.${apiUrl}${endpoint}`, config);
            return response.data;
        } catch (error) {
            console.error("DELETE request failed:", error);
            throw error;
        }
    };

    return { getMethod, postMethod, putMethod, patchMethod, deleteMethod };
};

export default useApiMethods;

