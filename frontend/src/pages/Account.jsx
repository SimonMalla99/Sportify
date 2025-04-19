import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/account.css"; // Create this for styling

const Account = () => {
  const { user } = useContext(AuthContext);
  const [allPoints, setAllPoints] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Fetch total points from leaderboard endpoint
    fetch("http://127.0.0.1:8000/api/leaderboard/")
      .then(res => res.json())
      .then(data => {
        const me = data.find(u => u.username === user.username);
        if (me) setAllPoints(me.allpoints);
      })
      .catch(err => console.error("Error fetching leaderboard:", err));
  }, [user, navigate]);

  const handleLogout = () => {
    navigate("/logout");
  };

  return (
    <div className="account-wrapper">
      <div className="account-card">
        <div className="avatar-circle">
          <span>{user?.username.charAt(0).toUpperCase()}</span>
        </div>
        <h2>{user?.username}</h2>
        <p className="points-label">Total Fantasy Points:</p>
        <div className="points">{allPoints !== null ? allPoints : "Loading..."}</div>
        <button onClick={handleLogout} className="logout-btn">Log out</button>
      </div>
    </div>
  );
};

export default Account;
