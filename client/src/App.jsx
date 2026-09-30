import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Home from "./pages/Home";
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

                {/* =========================================
                    HOME PAGE
                ========================================= */}

                <Route
                    path="/"
                    element={<Home />}
                />


                {/* =========================================
                    LOGIN
                ========================================= */}

                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* =========================================
                    REGISTER
                ========================================= */}

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* =========================================
                    VOTER DASHBOARD
                    Both users and admins can access
                ========================================= */}

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <VoterDashboard />
                        </ProtectedRoute>
                    }
                />


                {/* =========================================
                    ADMIN DASHBOARD
                    Admin only
                ========================================= */}

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute role="admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />


                {/* =========================================
                    RESULTS
                    Logged-in users only
                    Election-specific results
                ========================================= */}

                <Route
                    path="/results/:electionId"
                    element={
                        <ProtectedRoute>
                            <Results />
                        </ProtectedRoute>
                    }
                />


                {/* =========================================
                    OLD /results URL
                    Redirect to dashboard because an
                    election ID is required for results
                ========================================= */}

                <Route
                    path="/results"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />


                {/* =========================================
                    UNKNOWN URL
                    Redirect to Home
                ========================================= */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;