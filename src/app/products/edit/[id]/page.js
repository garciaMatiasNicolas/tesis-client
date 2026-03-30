import ProductEditPage from "@/pages/inventory/products/ProductEditPage";
import ProtectedRoute from "@/services/ProtectedRoute";

const page = () => {
  return (
    <ProtectedRoute>
      <ProductEditPage />
    </ProtectedRoute>
  )
}

export default page;