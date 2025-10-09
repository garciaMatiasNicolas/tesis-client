import SuppliersPage from "@/pages/suppliers/SuppliersPage";
import ProtectedRoute from "@/services/ProtectedRoute";


const page = () => {
    return (
        <ProtectedRoute>
            <SuppliersPage />
        </ProtectedRoute>
    )
}

export default page;