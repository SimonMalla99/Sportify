import { useState, useContext } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";

function Form({ route, method }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); // ✅ email state
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const name = method === "login" ? "Login" : "Sign Up";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Payload for login vs signup
      const payload =
        method === "login"
          ? { username, password } // backend should support email or username in 'username' field
          : { username, password, email };

      const res = await api.post(route, payload);

      if (method === "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);

        const userRes = await api.get("/api/user/", {
          headers: { Authorization: `Bearer ${res.data.access}` },
        });

        login(userRes.data, res.data.access, res.data.refresh);

        if (userRes.data.is_superuser) {
          navigate("/admin-dashboard");
        } else {
          navigate("/");
        }
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Login/Signup Error:", error);
      alert(error.response?.data?.detail || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupRedirect = () => {
    navigate("/register");
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>{name}</h2>
      <p style={{ marginBottom: "30px", color: "#4a5568" }}>
        {method === "login"
          ? "Welcome back! Please log in with your username or email."
          : "Create a new account to get started."}
      </p>

      {/* ✅ Shared username/email field for login */}
      <input
        className="form-input"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
      />

      {/* ✅ Only show email input on signup */}
      {method !== "login" && (
        <input
          className="form-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
      )}

      <input
        className="form-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      <button className="form-button" type="submit" disabled={loading}>
        {loading ? "Loading..." : name}
      </button>

      {method === "login" && (
        <div className="form-footer">
          Don’t have an account?
          <button type="button" onClick={handleSignupRedirect}>
            Sign up
          </button>
        </div>
      )}
    </form>
  );
}

export default Form;
