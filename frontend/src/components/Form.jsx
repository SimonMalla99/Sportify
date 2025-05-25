import { useState, useContext } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Form.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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
  const [formMode, setFormMode] = useState(method); // login, signup, forgot
  const [showOtpReset, setShowOtpReset] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const availableSports = [
    "Football", "Basketball", "Cricket", "Swimming",
    "Table Tennis", "Badminton", "Volleyball", "Track and Field"
  ];

  const name = formMode === "login" ? "Login" : "Sign Up";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formMode === "forgot") {
      try {
        await api.post("/api/request-reset-otp/", { email });
        toast.success("OTP sent to your email.");
        setShowOtpReset(true);
      } catch (err) {
        toast.error("Failed to send OTP. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (formMode !== "login" && password !== confirmPassword) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const payload =
        formMode === "login"
          ? { username, password }
          : { username, password, email };

      const res = await api.post(route, payload);

      if (formMode === "login") {
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
      const data = error.response?.data;

      if (typeof data === "string") {
        toast.error(data);
      } else if (data?.detail) {
        toast.error(data.detail); // ✅ this will catch "Your credentials do not match"
      } else if (data?.username) {
        toast.error(data.username[0]);
      } else if (data?.email) {
        toast.error(data.email[0]);
      } else {
        toast.error("Something went wrong.");
      }

    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      await api.post("/api/reset-password/", { email, otp, new_password: newPassword });
      toast.success("Password reset successful!");
      setFormMode("login");
    } catch (error) {
      toast.error("Failed to reset password. Try again.");
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
          <h2>{formMode === "forgot" ? "Forgot Password" : name}</h2>

          {formMode === "forgot" ? (
            <>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                required
              />

              {showOtpReset ? (
                <>
                  <input
                    className="form-input"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    required
                  />
                  <input
                    className="form-input"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    required
                  />
                  <button
                    className="form-button"
                    type="button"
                    onClick={handleResetPassword}
                  >
                    Reset Password
                  </button>
                </>
              ) : (
                <button className="form-button" type="submit">
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              )}
              <p
                onClick={() => setFormMode("login")}
                style={{ cursor: "pointer", color: "#3182ce", marginTop: "10px" }}
              >
                Back to login
              </p>
            </>
          ) : (
            <>
              <input
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
              />
              {formMode !== "login" && (
                <input
                  className="form-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                />
              )}

              <div className="password-wrapper">
                <input
                  className="form-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="eye-icon"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              {formMode === "login" && (
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#3182ce",
                    cursor: "pointer",
                    marginTop: "10px",
                    textAlign: "right"
                  }}
                  onClick={() => setFormMode("forgot")}
                >
                  Forgot your password?
                </p>
              )}

              {formMode !== "login" && (
                <>
                  <div className="password-wrapper">
                    <input
                      className="form-input"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Retype Password"
                      required
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="eye-icon"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>

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

              {formMode === "login" && (
                <div className="form-footer">
                  Don’t have an account?
                  <button type="button" onClick={handleSignupRedirect}>
                    Sign up
                  </button>
                </div>
              )}
            </>
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
