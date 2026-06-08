import PaymentsMethodsPage from '@/components/pages/ecommerce/PaymentsMethodsPage';
import ProtectedRoute from '@/services/ProtectedRoute';

const page = () => {
    return (
        <ProtectedRoute>
            <PaymentsMethodsPage />
        </ProtectedRoute>
    )
}

export default page