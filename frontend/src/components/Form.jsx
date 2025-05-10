import { useState, useContext } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Form.css";

function Form({ route, method }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showExtraFields, setShowExtraFields] = useState(false);
  const [userId, setUserId] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [sports, setSports] = useState([]);

  const availableSports = [
    "Football", "Basketball", "Cricket", "Swimming",
    "Table Tennis", "Badminton", "Volleyball", "Track and Field"
  ];

  const name = method === "login" ? "Login" : "Sign Up";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (method !== "login" && password !== confirmPassword) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }
    

    try {
      const payload =
        method === "login"
          ? { username, password }
          : { username, password, email };

      const res = await api.post(route, payload);

      if (method === "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);

        const userRes = await api.get("/api/user/", {
          headers: { Authorization: `Bearer ${res.data.access}` },
        });

        login(userRes.data, res.data.access, res.data.refresh);

        toast.success("Login successful!");

        if (userRes.data.is_superuser) {
          navigate("/admin-dashboard");
        } else {
          navigate("/");
        }
      } else {
        setUserId(res.data.id);
        setShowExtraFields(true);
      }
    } catch (error) {
      console.error("Login/Signup Error:", error);
      const message =
        error.response?.data?.detail ||
        error.response?.data ||
        "Login failed. Please check your credentials.";
      toast.error(typeof message === "string" ? message : "Something went wrong.");
    }
     finally {
      setLoading(false);
    }
  };

  const handleExtraSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/api/create-profile/", {
        user_id: userId,
        dob,
        phone_number: phone,
        bio,
        favourite_sports: sports,
      });

      toast.success("Account created successfully! Please log in.");
      navigate("/login");
    } catch (error) {
      console.error("Profile Submission Error:", error);
      toast.error("Error saving profile details.");
    }
  };

  const handleSportToggle = (sport) => {
    setSports(prev =>
      prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]
    );
  };

  const handleSignupRedirect = () => navigate("/register");

  return (
    <div className="form-container">
      <ToastContainer position="top-center" />

      {!showExtraFields ? (
        <form onSubmit={handleSubmit}>
          <div className="logo-text">Sportify</div>
          <h2>{name}</h2>
          <p style={{ marginBottom: "30px", color: "#4a5568" }}>
            {method === "login"
              ? "Welcome back! Please log in with your username and password"
              : "Create a new account to get started."}
          </p>

          <input
            className="form-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />

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

          {method !== "login" && (
            <>
              <input
                className="form-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Retype Password"
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <p style={{ color: "red", fontSize: "0.85rem" }}>
                  Passwords do not match
                </p>
              )}
            </>
          )}

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
      ) : (
        <form onSubmit={handleExtraSubmit}>
          <div className="logo-text">Sportify</div>
          <h2>Tell us more about you</h2>

          <input
            className="form-input"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            placeholder="Date of Birth"
            required
          />

          <input
            className="form-input"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number"
            pattern="[0-9]{10}"
            title="10-digit number"
            required
          />

          <textarea
            className="form-input"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Short Bio (optional)"
          />

          <label style={{ fontWeight: "bold", marginTop: "10px" }}>
            Favourite Sports (optional):
          </label>
          <div className="sport-tags">
            {availableSports.map((sport) => (
              <button
                type="button"
                key={sport}
                className={`sport-tag ${sports.includes(sport) ? "selected" : ""}`}
                onClick={() => handleSportToggle(sport)}
              >
                {sport}
              </button>
            ))}
          </div>

          <button className="form-button" type="submit">
            Continue
          </button>
        </form>
      )}
    </div>
  );
}

export default Form;
