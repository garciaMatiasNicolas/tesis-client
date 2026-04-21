import ProtectedRoute from "@/services/ProtectedRoute";
import StatsPage from "@/pages/stats/StatsPage";

const Page = () => {
    return (
        <ProtectedRoute>
            <StatsPage />
        </ProtectedRoute>
    );
};

export default Page