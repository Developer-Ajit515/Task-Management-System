import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ allowedRoles }) {
    const { isAuthenticated, user } = useAuth();

    // User login nahi hai
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Agar specific roles required hain
    if (allowedRoles && allowedRoles.length > 0) {
        const userRoles = user?.roles || [];

        const hasAccess = allowedRoles.some(role =>
            userRoles.includes(role)
        );

        if (!hasAccess) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return <Outlet />;
}

export default ProtectedRoute;