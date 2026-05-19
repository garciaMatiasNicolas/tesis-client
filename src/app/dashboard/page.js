import StatsPage from "@/components/pages/stats/StatsPage";
import ProtectedRoute from "@/services/ProtectedRoute";

const Page = () => {
    return (
        <ProtectedRoute>
            <StatsPage />
        </ProtectedRoute>
    );
};

export default Page