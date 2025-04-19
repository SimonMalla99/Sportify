import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Fantasy from "./pages/Fantasy";
import NotFound from "./pages/NotFound";
import FantasyTeam from "./pages/FantasyTeam";
import AdminDashboard from "./pages/AdminDashboard";
import NewsAdmin from "./pages/NewsAdmin";
import News from "./pages/News";
import TeamPredictionForm from "./pages/TeamPredictionForm";
import NewsDetail from "./pages/NewsDetail";
import ProtectedRoute from "./components/ProtectedRoute"; // ✅ use your good one
import NepalPremierLeague from "./pages/NepalPremierLeague";
import Leaderboard from "./pages/Leaderboard";
import Account from "./pages/Account";

function Logout() {
    localStorage.clear();
    return <Navigate to="/login" />;
}

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/logout" element={<Logout />} />

            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/fantasy"
                element={
                    <ProtectedRoute>
                        <Fantasy />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/fantasy-team"
                element={
                    <ProtectedRoute>
                        <FantasyTeam />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/team-prediction-form"
                element={
                    <ProtectedRoute>
                        <TeamPredictionForm />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin-dashboard"
                element={
                    <ProtectedRoute requireAdmin={true}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/news-admin"
                element={
                    <ProtectedRoute requireAdmin={true}>
                        <NewsAdmin />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/news"
                element={
                    <ProtectedRoute>
                        <News />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/news/:id"
                element={
                    <ProtectedRoute>
                        <NewsDetail />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/npl"
                element={
                    <ProtectedRoute>
                        <NepalPremierLeague />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/leaderboard"
                element={
                    <ProtectedRoute>
                        <Leaderboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/account"
                element={
                    <ProtectedRoute>
                        <Account />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;
