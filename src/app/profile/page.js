import ProfilePage from "@/pages/profile/ProfilePage";
import ProtectedRoute from "@/services/ProtectedRoute";

const Page = () => {
    return (
        <ProtectedRoute>
            <ProfilePage />
        </ProtectedRoute>
    );
};

export default Page