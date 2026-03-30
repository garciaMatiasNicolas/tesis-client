import ProductCreatePage from "@/pages/inventory/products/ProductCreatePage";
import ProtectedRoute from "@/services/ProtectedRoute";

const page = () => {
  return (
    <ProtectedRoute>
      <ProductCreatePage />
    </ProtectedRoute>
  )
}

export default page;