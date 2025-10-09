import CrmPage from '@/pages/crm/CrmPage';
import ProtectedRoute from '@/services/ProtectedRoute';
import React from 'react';

const Page = () => {
    return (
        <ProtectedRoute>
            <CrmPage />
        </ProtectedRoute>
    );
};

export default Page;