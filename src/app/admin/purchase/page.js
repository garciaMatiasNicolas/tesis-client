import PurchaseOrdersPage from '@/pages/admin/PurchaseOrdersPage';
import ProtectedRoute from '@/services/ProtectedRoute';

export default function Page() {
    return (
        <ProtectedRoute>
            <PurchaseOrdersPage />
        </ProtectedRoute>
    );
}
