"use client";
import SideBar from '@/components/ui/SideBar';
import StockTable from '@/components/stock/StockTable';
import useStockService from '@/services/stockService';
import React, { useState, useEffect } from 'react';

const StockPage = () => {
    const [stockData, setStockData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    const stockService = useStockService();

    const showAlert = (type, title, message) => {
        alert(`${title}: ${message}`);
    };

    // Cargar datos de stock desde el backend
    useEffect(() => {
        const fetchStockData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await stockService.getAll();
                
                // La respuesta viene en formato { count: X, results: [...] }
                const stocks = response.results || response;
                setStockData(Array.isArray(stocks) ? stocks : []);
            } catch (err) {
                console.error('Error al cargar datos de stock:', err);
                setError(err.message || 'Error al cargar la información del stock');
            } finally {
                setLoading(false);
            }
        };

        fetchStockData();
    }, []);

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">                    
            <SideBar
                onProfile={() => window.location.href = "/profile"}
                onSupport={() => showAlert("info", "Soporte", "Funcionalidad en desarrollo")}
                onLogout={() => showAlert("info", "Logout", "Funcionalidad en desarrollo")}
            />
            <main className="flex-1 p-4 md:p-8 h-screen overflow-y-auto">
                <StockTable
                    stockData={stockData}
                    loading={loading}
                    error={error}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                />
            </main>
        </div>
    )
}

export default StockPage;