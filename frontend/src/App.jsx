import { Routes, Route, Navigate, } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Fantasy from "./pages/Fantasy";
import NotFound from "./pages/NotFound";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import FantasyTeam from "./pages/FantasyTeam";
import AdminDashboard from "./pages/AdminDashboard";
import NewsAdmin from "./pages/NewsAdmin";
import News from "./pages/News";
import Predictions from "./pages/Predictions"


function PrivateRoute({ children }) {
    const { user } = useContext(AuthContext);
    return user ? children : <Navigate to="/login" />;
}

function Logout() {
    localStorage.clear();
    return <Navigate to="/login" />;
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/register" element={<Register />} />
            <Route path="/fantasy" element={<PrivateRoute><Fantasy /></PrivateRoute>} />
            <Route path="*" element={<NotFound />} />
            <Route path="/fantasy-team" element={<FantasyTeam />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path='/news-admin'element={<NewsAdmin />}/>
            <Route path='/news'element={<News />}/>
            <Route path='/predictions'element={<Predictions />}/>
        </Routes>
    );
}

export default App;
