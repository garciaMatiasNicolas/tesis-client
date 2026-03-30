import ProtectedRoute from '@/services/ProtectedRoute';
import WarehousePage from '@/pages/warehouse/WarehousePage';
import React from 'react'

const page = () => {
    return (
        <ProtectedRoute>
            <WarehousePage />
        </ProtectedRoute>
    )
}

export default page;