import PurchaseOrdersPage from '@/components/pages/admin/PurchaseOrdersPage';
import ProtectedRoute from '@/services/ProtectedRoute';

export default function Page() {
    return (
        <ProtectedRoute>
            <PurchaseOrdersPage />
        </ProtectedRoute>
    );
}
