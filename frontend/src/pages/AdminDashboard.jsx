import React, { useEffect, useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaUserCircle } from "react-icons/fa";
import { ACCESS_TOKEN } from "../constants"; // ✅ Import token key

function AdminDashboard() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    const [users, setUsers] = useState([]);

    const toggleMenu = () => setShowMenu(!showMenu);
    const handleLogout = () => navigate("/logout");
    const handleUserStatusChange = (userId, shouldBlock) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    const endpoint = shouldBlock ? "block-user" : "unblock-user";

        fetch(`http://127.0.0.1:8000/api/${endpoint}/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ user_id: userId })
        })
            .then(res => res.json())
            .then(data => {
                console.log(data.message || data.error);
                // Re-fetch users after update
                return fetch("http://127.0.0.1:8000/api/get-all-users/", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setUsers(data);
                }
            })
            .catch(err => console.error("Error updating user status:", err));
    };


    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem(ACCESS_TOKEN); // ✅ Use correct token key

        if (!storedUser || !token) {
            navigate("/login");
            return;
        }

        fetch("http://127.0.0.1:8000/api/get-all-users/", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error("Unauthorized or failed to fetch users.");
                }
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setUsers(data);
                } else {
                    console.error("Expected array, got:", data);
                }
            })
            .catch(err => {
                console.error("Failed to fetch users:", err);
                navigate("/login");
            });
    }, [navigate]);
    

    if (!user || !localStorage.getItem(ACCESS_TOKEN)) return null;

    return (
        <div className="home-container">
            <header className="home-header">
                <div className="logo">Sportify Admin</div>
                <nav className="nav-bar">
                    <Link to="/news-admin">News Upload</Link>

                    <div className="account-container">
                        <FaUserCircle size={24} onClick={toggleMenu} style={{ cursor: "pointer" }} />
                        {showMenu && (
                            <div className="account-dropdown">
                            <p>👤 {user.username}</p>
                            <p><Link to="/account">Account Overview</Link></p>
                            <button onClick={handleLogout}>Logout</button>
                            </div>
                        )}
                    </div>
                </nav>
            </header>

            <main style={{ padding: "2rem" }}>
                <h1>Welcome Admin, {user.username}</h1>

                <h2 style={{ marginTop: "2rem" }}>All Users</h2>
                <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "1rem" }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(users) && users.map(u => (
                            <tr key={u.id}>
                                <td>{u.id}</td>
                                <td>{u.username}</td>
                                <td>{u.email}</td>
                                <td>{u.is_blocked ? "Blocked" : "Normal"}</td>
                                <td>
                                    {u.is_blocked ? (
                                        <button onClick={() => handleUserStatusChange(u.id, false)}>Unblock</button>
                                    ) : (
                                        <button onClick={() => handleUserStatusChange(u.id, true)}>Block</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>
        </div>
    );
}

export default AdminDashboard;
