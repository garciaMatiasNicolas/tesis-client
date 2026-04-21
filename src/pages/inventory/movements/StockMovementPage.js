"use client";
import SideBar from '@/components/ui/SideBar';
import StockMovementTable from '@/components/stock/StockMovementTable';
import React, { useState } from 'react';

const StockMovementPage = () => {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">                    
            <SideBar
                onProfile={() => window.location.href = "/profile"}
                onSupport={() => alert("Funcionalidad en desarrollo")}
                onLogout={() => alert("Funcionalidad en desarrollo")}
            />
            <main className="flex-1 p-4 md:p-8 h-screen overflow-y-auto">
                <StockMovementTable 
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                />
            </main>
        </div>
    );
}

export default StockMovementPage;