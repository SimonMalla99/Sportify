import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/account.css";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";


const Account = () => {
  const { user } = useContext(AuthContext);
  const [allPoints, setAllPoints] = useState(null);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const toggleMenu = () => setShowMenu(!showMenu);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // 1. Fetch total points
    fetch("http://127.0.0.1:8000/api/leaderboard/")
      .then((res) => res.json())
      .then((data) => {
        const me = data.find((u) => u.username === user.username);
        if (me) setAllPoints(me.allpoints);
      })
      .catch((err) => console.error("Error fetching leaderboard:", err));

    // 2. Fetch extra profile details
    fetch(`http://127.0.0.1:8000/api/get-profile/?user_id=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
      })
      .catch((err) => console.error("Error fetching profile:", err));
  }, [user, navigate]);

  const handleLogout = () => {
    navigate("/logout");
  };

  return (
    <div className="home-container">
    <header className="home-header">
    <div className="logo">Sportify</div>
    <nav className="nav-bar">
      <Link to="/">Home Page</Link>
      <Link to="/fantasy-team">Fantasy</Link>
      <Link to="/News">Sports News</Link>
      <Link to="/team-prediction-form">Predictions</Link>
      <Link to="/npl">NPL</Link>
      <Link to="/leaderboard">Leaderboards</Link>
      {user && (
        <div className="account-container">
          <FaUserCircle
            size={24}
            onClick={toggleMenu}
            style={{ cursor: "pointer" }}
          />
          {showMenu && (
            <div className="account-dropdown">
              <p>👤 {user.username}</p><p><Link to="/account">Account Overview</Link></p>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      )}
    </nav>
  </header>
    <div className="account-wrapper">

      <div className="account-card">
        <div className="avatar-circle">
          {profile?.profile_picture ? (
            <img
              src={`http://127.0.0.1:8000${profile.profile_picture}`}
              alt="Profile"
              className="profile-picture"
            />
          ) : (
            <span>{user?.username.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <h2>{user?.username}</h2>
        <p><strong>Email:</strong> {user?.email || "Not available"}</p>

        <p className="points-label">Total Fantasy Points:</p>
        <div className="points">{allPoints !== null ? allPoints : "Loading..."}</div>

        {profile && (
          <>
            <div className="extra-info">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Date of Birth:</strong> {profile.dob}</p>
              <p><strong>Phone:</strong> {profile.phone_number}</p>
              {profile.bio && <p><strong>Bio:</strong> {profile.bio}</p>}
              {profile.favourite_sports?.length > 0 && (
                <p><strong>Favourite Sports:</strong> {profile.favourite_sports.join(", ")}</p>
              )}
            </div>
          </>
        )}

        <button
          onClick={() => navigate("/profileedit")}
          className="edit-profile-btn"
        >
          Edit Profile
        </button>

        <button onClick={handleLogout} className="logout-btn">Log out</button>

      </div>
    </div>
    </div>
  );
};

export default Account;
