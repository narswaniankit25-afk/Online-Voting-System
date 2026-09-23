import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ children, role }) {
    const token = localStorage.getItem("token");

    // No token
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const decodedToken = jwtDecode(token);

        // Check token expiration
        if (decodedToken.exp * 1000 < Date.now()) {
            localStorage.removeItem("token");

            return <Navigate to="/login" replace />;
        }

        // Check role
        if (role && decodedToken.role !== role) {
            return <Navigate to="/dashboard" replace />;
        }

        return children;

    } catch (error) {
        localStorage.removeItem("token");

        return <Navigate to="/login" replace />;
    }
}

export default ProtectedRoute;