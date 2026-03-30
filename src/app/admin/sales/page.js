import SalesPage from '@/pages/admin/SalesPage';
import ProtectedRoute from '@/services/ProtectedRoute';

export default function Page() {
    return (
        <ProtectedRoute>
            <SalesPage />
        </ProtectedRoute>
    );
}