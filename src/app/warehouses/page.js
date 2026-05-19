import WarehousePage from '@/components/pages/warehouse/WarehousePage';
import ProtectedRoute from '@/services/ProtectedRoute';
import React from 'react'

const page = () => {
    return (
        <ProtectedRoute>
            <WarehousePage />
        </ProtectedRoute>
    )
}

export default page;