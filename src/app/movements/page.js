import StockMovementPage from '@/pages/inventory/movements/StockMovementPage';
import ProtectedRoute from '@/services/ProtectedRoute';

const page = () => {
    return (
        <ProtectedRoute>
            <StockMovementPage />
        </ProtectedRoute>
    )
}

export default page