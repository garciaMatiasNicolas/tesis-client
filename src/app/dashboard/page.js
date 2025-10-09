import ProtectedRoute from "@/services/ProtectedRoute";
const { default: DashboardPage } = require("@/pages/dashboard/DashboardPage")

const Page = () => {
    return (
        <ProtectedRoute>
            <DashboardPage />
        </ProtectedRoute>
    );
};

export default Page