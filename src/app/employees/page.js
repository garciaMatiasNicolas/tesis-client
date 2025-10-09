import EmployeesPage from "@/pages/employees/EmployeesPage";
import ProtectedRoute from "@/services/ProtectedRoute";

const Page = () => {
    return (
        <ProtectedRoute>
            <EmployeesPage />
        </ProtectedRoute>
    );
};

export default Page