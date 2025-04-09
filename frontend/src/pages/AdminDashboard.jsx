import React, { useEffect, useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaUserCircle } from "react-icons/fa";

function AdminDashboard() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);

    const toggleMenu = () => setShowMenu(!showMenu);
    const handleLogout = () => navigate("/logout");

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            navigate("/login");
        }
    }, [user, navigate]);

    if (!user) return null;

    return (
        <div className="home-container">
            <header className="home-header">
                <div className="logo">Sportify Admin</div>
                <nav className="nav-bar">
                    <Link to="/">Home Page</Link>
                    <Link to="/fantasy-team">Fantasy</Link>
                    <Link to="/news-admin">Sports News</Link>
                    <Link to="#">About</Link>
                    <Link to="#">Contact</Link>

                    <div className="account-container">
                        <FaUserCircle size={24} onClick={toggleMenu} style={{ cursor: "pointer" }} />
                        {showMenu && (
                            <div className="account-dropdown">
                                <p>👤 {user.username}</p>
                                <button onClick={handleLogout}>Logout</button>
                            </div>
                        )}
                    </div>
                </nav>
            </header>

            <main style={{ padding: "2rem" }}>
                <h1>Welcome Admin, {user.username}!</h1>
                <p>Select a tool from the navigation above.</p>
            </main>
        </div>
    );
}

export default AdminDashboard;
