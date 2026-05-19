import ProductUnitsPage from "@/components/pages/inventory/product-units/ProductUnitsPage";
import ProtectedRoute from "@/services/ProtectedRoute";

const page = () => {
  return (
    <ProtectedRoute>
      <ProductUnitsPage />
    </ProtectedRoute>
  )
}

export default page;
