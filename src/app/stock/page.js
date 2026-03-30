import StockPage from '@/pages/inventory/stock/StockPage';
import ProtectedRoute from '@/services/ProtectedRoute';

const page = () => {
    return (
        <ProtectedRoute>
           <StockPage />
        </ProtectedRoute>
    )
}

export default page