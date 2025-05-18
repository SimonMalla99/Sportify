import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [previousFixtures, setPreviousFixtures] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [players, setPlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [newsArticles, setNewsArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const toggleMenu = () => setShowMenu(!showMenu);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [showPointLog, setShowPointLog] = useState(false);
  const [pointLogs, setPointLogs] = useState([]);
  const { profilePic } = useContext(AuthContext);
  const [topUsers, setTopUsers] = useState([]);
  
  const goToFantasy = () => {
    if (user) navigate("/fantasy");
    else navigate("/login");
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/leaderboard/")
      .then(res => res.json())
      .then(data => setLeaders(data))
      .catch(err => console.error("Error fetching leaderboard:", err));
  }, []);

  return (
    <div className="npl-container" >
      <header className="home-header">
        <div className="logo">Sportify</div>
        <nav className="nav-bar">
          <Link to="/">Home Page</Link>
          <Link to="/fantasy-team">Fantasy</Link>
          <Link to="/News">Sports News</Link>
          <Link to="/team-prediction-form">Predictions</Link>
          <Link to="/npl">NPL</Link>
          <Link to="/leaderboard">Leaderboards</Link>
          <Link to="/videostream">Live Game</Link>
          {user && (
            <div className="account-container">
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Profile"
                  className="nav-profile-picture"
                  onClick={toggleMenu}
                />
              ) : (
                <FaUserCircle
                  size={24}
                  onClick={toggleMenu}
                  style={{ cursor: "pointer" }}
                />
              )}
              
              {showMenu && (
                <div className="account-dropdown">
                  <p>👤 {user.username}</p>
                  <p><Link to="/account">Account Overview</Link></p>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>

          )}
        </nav>
      </header>
      <h1 className="text-3xl font-bold text-center my-8">🏆 Leaderboard</h1>
      <div className="overflow-x-auto">
        <table className="leaderboard-table">
          <thead className="leaderboard-header">
            <tr>
              <th className="border p-2">Rank</th>
              <th className="border p-2">User</th>
              <th className="border p-2">Total Points</th>
            </tr>
          </thead>
          <tbody>
            {leaders
                .filter(user => user.allpoints > 0)
                .map((user, index) => {
                let rowClass = "";
                if (index === 0) rowClass = "bg-yellow-100 font-bold";     // 🥇 1st
                else if (index === 1) rowClass = "bg-gray-200 font-semibold"; // 🥈 2nd
                else if (index === 2) rowClass = "bg-orange-100 font-medium"; // 🥉 3rd

                return (
                    <tr
                        key={user.user_id}
                        style={{
                            backgroundColor:
                            index === 0 ? "#FEF08A" : index === 1 ? "#E5E7EB" : index === 2 ? "#FED7AA" : "white",
                            fontWeight: index < 3 ? "bold" : "normal",
                        }}
                        >

                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2">{user.username}</td>
                    <td className="border p-2">{user.allpoints}</td>
                    </tr>
                );
                })}
            </tbody>

        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
