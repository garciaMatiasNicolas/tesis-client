import CategoriesPage from '@/components/pages/inventory/categories/CategoriesPage';
import ProtectedRoute from '@/services/ProtectedRoute';


const Page = () => {
    return (
        <ProtectedRoute>
            <CategoriesPage />
        </ProtectedRoute>
    );
};

export default Page;