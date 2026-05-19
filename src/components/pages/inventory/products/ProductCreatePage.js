"use client";
import React from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/products/ProductForm";
import SideBar from "@/components/ui/SideBar";

export default function ProductCreatePage() {
    const router = useRouter();

    const handleProductCreated = () => {
        router.push("/products");
    };

    // Manejar cancelación
    const handleCancel = () => {
        router.push("/products");
    };

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            <SideBar
                onProfile={() => window.location.href = "/profile"}
                onSupport={() => alert("Soporte")}
                onLogout={() => alert("Cerrar sesión")}
            />
            <main className="flex-1 p-4 md:p-8 h-screen overflow-y-auto">
                <ProductForm onProductCreated={handleProductCreated} onCancel={handleCancel} />
            </main>
        </div>
    );
}