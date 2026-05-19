import ProductsPage from "@/components/pages/inventory/products/ProductsPage";
import ProtectedRoute from "@/services/ProtectedRoute";

const page = () => {
  return (
    <ProtectedRoute>
      <ProductsPage />
    </ProtectedRoute>
  )
}

export default page;