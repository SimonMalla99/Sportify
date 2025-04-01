import { useState, useContext } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // ✅ Import AuthContext
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";

function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext); // ✅ Use AuthContext
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Sign up";

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        try {
            console.log("Submitting login request...");

            const res = await api.post(route, { username, password });

            if (method === "login") {
                console.log("Login successful, storing tokens...");
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);

                console.log("Stored access token:", res.data.access);

                // ✅ Fetch user info after login
                const userRes = await api.get("/api/user/", {
                    headers: { Authorization: `Bearer ${res.data.access}` },
                });

                console.log("User data fetched:", userRes.data);

                login(userRes.data); // ✅ Update AuthContext
                navigate("/");

            } else {
                console.log("Signup successful, redirecting to login...");
                navigate("/login");
            }
        } catch (error) {
            console.error("Login/Signup Error:", error);
            alert(error.response?.data?.detail || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1>{name}</h1>
            <input
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
            />
            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            <button className="form-button" type="submit" disabled={loading}>
                {loading ? "Loading..." : name}
            </button>
        </form>
    );
}

export default Form;
