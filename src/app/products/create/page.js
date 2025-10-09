"use client";
import React from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/services/ProtectedRoute";
import ProductForm from "@/components/products/ProductForm";
import SideBar from "@/components/ui/SideBar";

export default function CreateProductPage() {
    const router = useRouter();

    const handleProductCreated = () => {
        router.push("/products");
    };

    return (
        <ProtectedRoute>    
            <div className="flex min-h-screen bg-[#f8fafc]">
                <SideBar
                    onProfile={() => window.location.href = "/profile"}
                    onSupport={() => showAlert("info", "Soporte", "Funcionalidad en desarrollo")}
                    onLogout={() => showAlert("info", "Logout", "Funcionalidad en desarrollo")}
                />
                <main className="flex-1 p-4 md:p-8 h-screen overflow-y-auto">
                    <ProductForm onProductCreated={handleProductCreated} />
                </main>
            </div>
        </ProtectedRoute>
    );
}