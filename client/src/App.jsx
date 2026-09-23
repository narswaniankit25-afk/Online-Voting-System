import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VoterDashboard from "./pages/VoterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Results from "./pages/Results";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                {/* Login */}
                <Route
                    path="/login"
                    element={<Login />}
                />

                {/* Register */}
                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* Voter Dashboard
                    Both user and admin can access it */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <VoterDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Dashboard
                    Only admin can access it */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute role="admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Results
                    Any logged-in user can access it */}
                <Route
                    path="/results"
                    element={
                        <ProtectedRoute>
                            <Results />
                        </ProtectedRoute>
                    }
                />

                {/* Unknown URL → Login */}
                <Route
                    path="*"
                    element={<Navigate to="/login" replace />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;