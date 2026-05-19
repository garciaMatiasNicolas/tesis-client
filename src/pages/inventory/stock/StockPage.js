"use client";
import SideBar from '@/components/ui/SideBar';
import Alert from '@/components/ui/Alert';
import StockTable from '@/components/stock/StockTable';
import React, { useState } from 'react';

const StockPage = () => {
    const [alert, setAlert] = useState(null);

    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
        if (type === 'success') {
            setTimeout(() => setAlert(null), 5000);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            {/* Alert component */}
            {alert && (
                <Alert
                    type={alert.type}
                    title={alert.title}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
            
            <SideBar
                onProfile={() => window.location.href = "/profile"}
                onSupport={() => showAlert("info", "Soporte", "Funcionalidad en desarrollo")}
                onLogout={() => showAlert("info", "Logout", "Funcionalidad en desarrollo")}
            />
            <main className="flex-1 p-4 md:p-8 h-screen overflow-y-auto">
                <StockTable onShowAlert={showAlert} />
            </main>
        </div>
    )
}

export default StockPage